// OTP Configuration
const OTP_CONFIG = {
  LENGTH: 4,
  EXPIRY_TIME: 5 * 60 * 1000, // 5 minutes in milliseconds
  TEST_MODE: true,
  TEST_MOBILE: '1234567890',
  TEST_OTP: '1234'
};

// Generate OTP
const generateOTP = () => {
  if (OTP_CONFIG.TEST_MODE) {
    return OTP_CONFIG.TEST_OTP;
  }
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_CONFIG.LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Validate Mobile Number
const validateMobileNumber = (mobile_num) => {
  // if (OTP_CONFIG.TEST_MODE) {
  //   return mobile_num === OTP_CONFIG.TEST_MOBILE;
  // }
  // Regular expression for Indian mobile numbers
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile_num);
};

// Check if OTP is expired
const isOTPExpired = (createdAt) => {
  const now = new Date();
  const otpTime = new Date(createdAt);
  return (now - otpTime) > OTP_CONFIG.EXPIRY_TIME;
};

// Format mobile number
const formatMobileNumber = (mobile_num) => {
  // Remove any non-digit characters
  return mobile_num.replace(/\D/g, '');
};

// Generate OTP message
const generateOTPMessage = (otp) => {
  return `Your OTP for Student Onboarding is ${otp}. Valid for 5 minutes.`;
};

module.exports = {
  generateOTP,
  validateMobileNumber,
  isOTPExpired,
  formatMobileNumber,
  generateOTPMessage,
  OTP_CONFIG
}; 