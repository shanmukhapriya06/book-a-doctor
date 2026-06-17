const doctorModel = require('../models/docModel');
const appointmentModel = require('../models/appointmentModel');
const userModel = require('../models/userModel');

const getDoctorProfileController = async (req, res) => {
  try {
    const { userId } = req.body;
    const doctor = await doctorModel.findOne({ userId });
    if (!doctor) {
      return res.status(200).send({ message: "Doctor profile not found", success: false });
    }
    return res.status(200).send({ success: true, data: doctor });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching doctor profile", success: false, error });
  }
};

const updateDoctorProfileController = async (req, res) => {
  try {
    const { userId } = req.body;
    const updateData = { ...req.body };
    updateData.experience = Number(updateData.experience) || 0;
    updateData.fees = Number(updateData.fees) || 0;
    await doctorModel.findOneAndUpdate({ userId }, updateData);
    return res.status(201).send({ message: "Doctor Profile Updated", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error updating doctor profile", success: false, error });
  }
};

const getAllDoctorAppointmentsController = async (req, res) => {
  try {
    const { userId } = req.body;
    const doctor = await doctorModel.findOne({ userId });
    const appointments = await appointmentModel.find({ doctorId: doctor._id });
    return res.status(200).send({ message: "Appointments Fetched Successfully", success: true, data: appointments });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching doctor appointments", success: false, error });
  }
};

const handleStatusController = async (req, res) => {
  try {
    const { appointId, status } = req.body;
    console.log('STATUS UPDATE: appointId =', appointId, ', status =', status);
    const appointment = await appointmentModel.findById(appointId);
    if (!appointment) {
      console.log('STATUS UPDATE: Appointment not found');
      return res.status(200).send({ message: "Appointment not found", success: false });
    }

    console.log('STATUS UPDATE: appointment.userId =', appointment.userId, ', type =', typeof appointment.userId);
    console.log('STATUS UPDATE: doctorInfo =', JSON.stringify(appointment.doctorInfo));

    await appointmentModel.findByIdAndUpdate(appointId, { status });

    const doctorName = appointment.doctorInfo?.fullName || "Doctor";
    const patient = await userModel.findOne({ _id: appointment.userId });
    console.log('STATUS UPDATE: patient found =', !!patient, ', patient._id =', patient?._id);

    if (patient) {
      const statusLabel = status === "approved" ? "accepted" : status === "rejected" ? "rejected" : status;
      patient.notification.push({
        type: "status-updated",
        message: `Your appointment with Dr. ${doctorName} has been ${statusLabel}`
      });
      await patient.save();
      console.log('STATUS UPDATE: notification pushed to patient, total notifications =', patient.notification.length);
    }

    return res.status(200).send({ message: "Appointment Status Updated", success: true });
  } catch (error) {
    console.log('STATUS UPDATE ERROR:', error.message, error.stack);
    return res.status(500).send({ message: "Error updating appointment status", success: false, error });
  }
};

const toggleAvailabilityController = async (req, res) => {
  try {
    console.log('TOGGLE: req.body =', JSON.stringify(req.body));
    const { userId, isAvailable } = req.body;
    console.log('TOGGLE: userId =', userId, ', isAvailable =', isAvailable, ', type =', typeof isAvailable);
    const doctor = await doctorModel.findOneAndUpdate(
      { userId },
      { isAvailable: Boolean(isAvailable) },
      { new: true }
    );
    console.log('TOGGLE: doctor found =', !!doctor, ', updated isAvailable =', doctor?.isAvailable);
    if (!doctor) {
      return res.status(200).send({ message: "Doctor profile not found", success: false });
    }
    return res.status(200).send({ success: true, data: { isAvailable: doctor.isAvailable } });
  } catch (error) {
    console.log('TOGGLE ERROR:', error.message, error.stack);
    return res.status(500).send({ message: "Error updating availability", success: false, error });
  }
};

module.exports = { getDoctorProfileController, updateDoctorProfileController, getAllDoctorAppointmentsController, handleStatusController, toggleAvailabilityController };
