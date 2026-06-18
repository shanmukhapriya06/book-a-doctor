const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    index: true
  },
  fullName: {
    type: String,
    required: true,
    set: val => typeof val === 'string' ? val.charAt(0).toUpperCase() + val.slice(1) : val
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    default: 0
  },
  fees: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  timings: {
    type: Array,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("doctor", docSchema);
