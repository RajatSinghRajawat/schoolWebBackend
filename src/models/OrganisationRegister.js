const mongoose = require('mongoose');

const organisationRegisterSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  otp: {
    type: String,
    trim: true
  },
  otpVerificationStatus: {
    type: Boolean,
    default: false
  },
  emailOtpVerificationStatus: {
    type: Boolean,
    default: false
  },
  forgetPasswordOTP: {
    type: String,
    trim: true
  },
  forgetPasswordOTPExpiry: {
    type: Date,
    default: Date.now
  },
  mobileOtpVerificationStatus: {
    type: Boolean,
    default: false
  },
  organiserName: {
    type: String,
    trim: true
  },

  organiserAddress: {
    addressLine1: {
      type: String,
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true
    },
    addressLine3: {
      type: String,
      trim: true
    },
    cityDistrict: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    }
  },
  organiserMobileNumber: {
    type: String,
    trim: true
  },
  organiserEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  organiserWebsite: {
    type: String,
    trim: true
  },
  directorName: {
    type: String,
    trim: true
  },
  directorMobileNumber: {
    type: String,
    trim: true
  },
  password: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // token
});

module.exports = mongoose.model('OrganisationRegister', organisationRegisterSchema);
