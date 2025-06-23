const Otp = require('../models/Otp');
const { 
  generateOTP, 
  validateMobileNumber, 
  isOTPExpired, 
  formatMobileNumber,
  generateOTPMessage,
  OTP_CONFIG 
} = require('../utils/otpUtils');

exports.sendOTP = async (req, res) => {
  try {
    const { mobile_num } = req.body;
    
    // Format and validate mobile number
    const formattedMobile = formatMobileNumber(mobile_num);
    if (!validateMobileNumber(formattedMobile)) {
      return res.status(400).json({
        success: false,
        message: OTP_CONFIG.TEST_MODE 
          ? 'Test mode is active. Please use the test mobile number: 1234567890'
          : 'Invalid mobile number'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create or update OTP record
    const otpRecord = await Otp.findOneAndUpdate(
      { mobile_num: formattedMobile },
      { 
        otp,
        status: 'pending',
        createdAt: new Date()
      },
      { 
        upsert: true,
        new: true
      }
    );

    // In production, you would send the OTP via SMS here
    if (OTP_CONFIG.TEST_MODE) {
      console.log(`Test OTP for ${formattedMobile}: ${otp}`);
      console.log(`Message: ${generateOTPMessage(otp)}`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        mobile_num: formattedMobile,
        // Don't send OTP in response in production
        otp: OTP_CONFIG.TEST_MODE ? otp : otp 
      }
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP'
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { mobile_num, otp } = req.body;

    // Format mobile number
    console.log(mobile_num, "mobile_num",OTP_CONFIG.TEST_MOBILE , otp ," otp",OTP_CONFIG.TEST_OTP);
    
    const formattedMobile = formatMobileNumber(mobile_num);

    // In test mode, verify against test credentials
    if (OTP_CONFIG.TEST_MODE) {
      if (otp === OTP_CONFIG.TEST_OTP) {
        // Create or update OTP record for test mode
        await Otp.findOneAndUpdate(
          { mobile_num: formattedMobile },
          {
            otp,
            status: 'verified',
            createdAt: new Date()
          },
          {
            upsert: true,
            new: true
          }
        );
        return res.status(200).json({
          success: true,
          message: 'OTP verified successfully'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({
      mobile_num: formattedMobile,
      otp,
      status: 'pending'
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.createdAt)) {
      otpRecord.status = 'expired';
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update OTP status to verified
    otpRecord.status = 'verified';
    await otpRecord.save();
    console.log(otpRecord,"lllll");

    res.status(200).json({
      success: true,
      data: otpRecord,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP'
    });
  }
}; 