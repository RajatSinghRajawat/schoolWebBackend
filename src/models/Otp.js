const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile_num: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'expired'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document will be automatically deleted after 5 minutes
  }
});

module.exports = mongoose.model('Otp', otpSchema); 