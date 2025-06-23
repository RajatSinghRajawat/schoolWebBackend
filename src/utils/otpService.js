const crypto = require('crypto');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Generate and send OTP
exports.generateAndSendOTP = async (mobileNumber) => {
  try {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(1000, 9999).toString();
    
    // Store OTP with timestamp
    otpStore.set(mobileNumber, {
      otp,
      timestamp: Date.now()
    });

    // Send OTP via SMS using Twilio
    await twilioClient.messages.create({
      body: `Your OTP for verification is: ${otp}`,
      to: mobileNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Verify OTP
exports.verifyOTP = (mobileNumber, otp) => {
  const storedData = otpStore.get(mobileNumber);
  
  if (!storedData) {
    return false;
  }

  // Check if OTP is expired (5 minutes)
  const isExpired = Date.now() - storedData.timestamp > 5 * 60 * 1000;
  
  if (isExpired) {
    otpStore.delete(mobileNumber);
    return false;
  }

  // Verify OTP
  const isValid = storedData.otp === otp;
  
  if (isValid) {
    otpStore.delete(mobileNumber);
  }
  
  return isValid;
}; 