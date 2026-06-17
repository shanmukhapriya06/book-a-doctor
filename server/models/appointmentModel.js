const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
    required: true
  },
  userInfo: {
    type: Object,
    default: {},
    required: true
  },
  doctorInfo: {
    type: Object,
    default: {},
    required: true
  },
  date: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  document: {
    type: Object
  },
  documents: {
    type: [{ name: String, fileType: String, data: String }],
    default: []
  },
  status: {
    type: String,
    default: 'pending',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("appointment", appointmentSchema);

