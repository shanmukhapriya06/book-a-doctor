const express = require('express');
const {
  registerController,
  loginController,
  applyDoctorController,
  authController,
  getAllDoctorsControllers,
  getallnotificationController,
  deleteallnotificationController,
  syncNotificationsController,
  appointmentController,
  getAllUserAppointments,
  updateUserProfileController,
  cancelAppointmentController
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/registerdoc', authMiddleware, applyDoctorController);
router.post('/getuserdata', authMiddleware, authController);
router.get('/getalldoctorsu', authMiddleware, getAllDoctorsControllers);
router.post('/getallnotification', authMiddleware, getallnotificationController);
router.post('/deleteallnotification', authMiddleware, deleteallnotificationController);
router.post('/syncnotifications', authMiddleware, syncNotificationsController);
router.post('/getappointment', authMiddleware, appointmentController);
router.get('/getuserappointments', authMiddleware, getAllUserAppointments);
router.post('/updateprofile', authMiddleware, updateUserProfileController);
router.post('/cancelappointment', authMiddleware, cancelAppointmentController);

module.exports = router;