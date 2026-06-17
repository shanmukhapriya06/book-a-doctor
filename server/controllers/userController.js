const userModel = require('../models/userModel');
const doctorModel = require('../models/docModel');
const appointmentModel = require('../models/appointmentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerController = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    return res.status(201).send({ message: "Register Successfully", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error in Register Controller", success: false, error });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid Password", success: false });
    }
    const token = jwt.sign(
      { userId: user._id, type: user.type },
      process.env.JWT_KEY,
      { expiresIn: '1d' }
    );
    user.password = undefined;
    return res.status(200).send({ message: "Login Successful", success: true, token, userData: user });
  } catch (error) {
    return res.status(500).send({ message: "Error in Login Controller", success: false, error });
  }
};

const applyDoctorController = async (req, res) => {
  try {
    const doctorData = { ...req.body, status: "pending" };
    doctorData.experience = Number(doctorData.experience) || 0;
    doctorData.fees = Number(doctorData.fees) || 0;
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    return res.status(201).send({ message: "Doctor Account Applied", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error applying doctor account", success: false, error });
  }
};

const authController = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }
    user.password = undefined;
    return res.status(200).send({ success: true, data: user });
  } catch (error) {
    return res.status(500).send({ message: "Auth Error", success: false, error });
  }
};

const getAllDoctorsControllers = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    return res.status(200).send({ message: "Doctors Lists Fetched Successfully", success: true, data: doctors });
  } catch (error) {
    return res.status(500).send({ message: "Error while fetching doctors", success: false, error });
  }
};

const getallnotificationController = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(200).send({ success: false, message: "User not found" });
    }
    user.seennotification = [...user.seennotification, ...user.notification];
    user.notification = [];
    await user.save();
    return res.status(200).send({ success: true, message: "All notifications marked as read", data: user });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Error in notification controller", error });
  }
};

const deleteallnotificationController = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(200).send({ success: false, message: "User not found" });
    }
    user.notification = [];
    user.seennotification = [];
    await user.save();
    return res.status(200).send({ success: true, message: "Notifications Deleted Successfully", data: user });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Unable to delete notifications", error });
  }
};

const syncNotificationsController = async (req, res) => {
  try {
    const { userId, notification, seennotification } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(200).send({ success: false, message: "User not found" });
    }
    user.notification = notification || [];
    user.seennotification = seennotification || [];
    await user.save();
    return res.status(200).send({ success: true, message: "Notifications synced", data: user });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Error syncing notifications", error });
  }
};

const appointmentController = async (req, res) => {
  try {
    const { userId, doctorId, date, userInfo, doctorInfo, message, documents } = req.body;
    const doctorDoc = await doctorModel.findById(doctorId);
    if (doctorDoc && doctorDoc.isAvailable === false) {
      return res.status(400).send({ message: "Doctor is currently unavailable for appointments", success: false });
    }

    const existingAppointment = await appointmentModel.findOne({
      userId,
      date,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingAppointment) {
      return res.status(200).send({ message: "You already have an appointment scheduled for this time slot. Please choose another time.", success: false });
    }

    const newAppointment = new appointmentModel({ userId, doctorId, date, userInfo, doctorInfo, message, documents: documents || [], status: "pending" });
    await newAppointment.save();
    
    // Doctor notification
    const doctorUser = await userModel.findOne({ _id: doctorInfo.userId });
    if (doctorUser) {
      doctorUser.notification.push({
        type: "New-appointment-request",
        message: `A new appointment request from ${userInfo.name}`
      });
      await doctorUser.save();
    }

    // Patient notification (appointment booked)
    const patientUser = await userModel.findById(userId);
    if (patientUser) {
      patientUser.notification.push({
        type: "appointment-booked",
        message: `You have successfully booked an appointment with ${doctorInfo.fullName || "Doctor"}`
      });
      await patientUser.save();
    }

    return res.status(201).send({ message: "Appointment Booked Successfully", success: true });
  } catch (error) {
    console.log('APPOINTMENT ERROR:', error.message, error.stack);
    return res.status(500).send({ message: error.message || "Error booking appointment", success: false, error });
  }
};

const getAllUserAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    return res.status(200).send({ message: "Appointments Fetched Successfully", success: true, data: appointments });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching appointments", success: false, error });
  }
};

const updateUserProfileController = async (req, res) => {
  try {
    const { userId, name, email, phone, password } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }
    if (email && email !== user.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(200).send({ message: "Email already in use", success: false });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    user.password = undefined;
    return res.status(200).send({ message: "Profile Updated Successfully", success: true, data: user });
  } catch (error) {
    return res.status(500).send({ message: "Error updating user profile", success: false, error });
  }
};

const cancelAppointmentController = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointment = await appointmentModel.findOne({ _id: appointmentId, userId });
    if (!appointment) {
      return res.status(200).send({ message: "Appointment not found", success: false });
    }
    if (appointment.status !== 'pending') {
      return res.status(200).send({ message: "Only pending appointments can be cancelled", success: false });
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, { status: 'cancelled' });

    const doctorUser = await userModel.findOne({ _id: appointment.doctorInfo?.userId });
    if (doctorUser) {
      doctorUser.notification.push({
        type: "appointment-cancelled",
        message: `Appointment with ${appointment.userInfo?.name || "a patient"} has been cancelled`
      });
      await doctorUser.save();
    }

    const patientUser = await userModel.findById(userId);
    if (patientUser) {
      patientUser.notification.push({
        type: "appointment-cancelled",
        message: `Your appointment with ${appointment.doctorInfo?.fullName || "Doctor"} has been cancelled`
      });
      await patientUser.save();
    }

    return res.status(200).send({ message: "Appointment cancelled successfully", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error cancelling appointment", success: false, error });
  }
};

module.exports = { registerController, loginController, applyDoctorController, authController, getAllDoctorsControllers, getallnotificationController, deleteallnotificationController, syncNotificationsController, appointmentController, getAllUserAppointments, updateUserProfileController, cancelAppointmentController };

