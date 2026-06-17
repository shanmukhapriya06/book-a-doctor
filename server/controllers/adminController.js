const userModel = require('../models/userModel');
const doctorModel = require('../models/docModel');
const appointmentModel = require('../models/appointmentModel');

const getAllUsersControllers = async (req, res) => {
  try {
    const users = await userModel.find({});
    return res.status(200).send({ message: "Users Fetched Successfully", success: true, data: users });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching users", success: false, error });
  }
};

const getAllDoctorsControllers = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    return res.status(200).send({ message: "Doctors Fetched Successfully", success: true, data: doctors });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching doctors", success: false, error });
  }
};

const getStatusApproveController = async (req, res) => {
  try {
    const { doctorId, userid } = req.body;
    await doctorModel.findByIdAndUpdate(doctorId, { status: "approved" });
    const user = await userModel.findOne({ _id: userid });
    if (user) {
      user.isdoctor = true;
      user.notification.push({
        type: "doctor-approved",
        message: "Your doctor account has been approved"
      });
      await user.save();
    }
    return res.status(200).send({ message: "Doctor Approved", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error approving doctor", success: false, error });
  }
};

const getStatusRejectController = async (req, res) => {
  try {
    const { doctorId, userid } = req.body;
    await doctorModel.findByIdAndUpdate(doctorId, { status: "rejected" });
    const user = await userModel.findOne({ _id: userid });
    if (user) {
      user.notification.push({
        type: "doctor-rejected",
        message: "Your doctor account application has been rejected"
      });
      await user.save();
    }
    return res.status(200).send({ message: "Doctor Rejected", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error rejecting doctor", success: false, error });
  }
};

const displayAllAppointmentController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    return res.status(200).send({ message: "Appointments Fetched Successfully", success: true, data: appointments });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching appointments", success: false, error });
  }
};

module.exports = {
  getAllUsersControllers,
  getAllDoctorsControllers,
  getStatusApproveController,
  getStatusRejectController,
  displayAllAppointmentController
};
