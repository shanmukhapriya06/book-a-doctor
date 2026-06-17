const express = require('express');
const {
  getDoctorProfileController,
  updateDoctorProfileController,
  getAllDoctorAppointmentsController,
  handleStatusController,
  toggleAvailabilityController
} = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/updateprofile', authMiddleware, updateDoctorProfileController);
router.get('/getprofile', authMiddleware, getDoctorProfileController);
router.get('/getdoctorappointments', authMiddleware, getAllDoctorAppointmentsController);
router.post('/handlestatus', authMiddleware, handleStatusController);
router.post('/toggleavailability', authMiddleware, toggleAvailabilityController);

module.exports = router;
