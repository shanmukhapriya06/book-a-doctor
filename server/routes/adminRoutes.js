const express = require('express');
const {
  getAllUsersControllers,
  getAllDoctorsControllers,
  getStatusApproveController,
  getStatusRejectController,
  displayAllAppointmentController
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/getallusers', authMiddleware, getAllUsersControllers);
router.get('/getalldoctors', authMiddleware, getAllDoctorsControllers);
router.post('/getapprove', authMiddleware, getStatusApproveController);
router.post('/getreject', authMiddleware, getStatusRejectController);
router.get('/getallAppointmentsAdmin', authMiddleware, displayAllAppointmentController);

module.exports = router;
