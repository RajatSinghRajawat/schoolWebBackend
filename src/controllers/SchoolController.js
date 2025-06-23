const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, mobile_num, dateOfBirth } = req.body;
   

    // Check if OTP is verified for this mobile number
    const verifiedOtp = await Otp.findOne({
      mobile_num,
      status: 'verified'
    });
    console.log(await Otp.findOne());
    if (!verifiedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your mobile number with OTP first'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      firstName,
      middleName: middleName || '',
      lastName,
      dateOfBirth,
      email,
      password: hashedPassword,
      status: 'pending',
      mobile_num
    });

    await user.save();

    // Delete the used OTP record
    await Otp.deleteOne({ _id: verifiedOtp._id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error in user registration'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, mobile_num, password } = req.body;

    // Check if either email or mobile number is provided
    if (!email && !mobile_num) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either email or mobile number'
      });
    }

    // Find user by email or mobile number
    const user = await User.findOne({
      $or: [
        { email: email },
        { mobile_num: mobile_num }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check user status
    // if (user.status !== 'active') {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'User account is not active'
    //   });
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update user token
    user.token = token;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile_num: user.mobile_num
        }
      }
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      message: 'Error in user login'
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -token');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, middleName, lastName } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.middleName = middleName !== undefined ? middleName : user.middleName;
    user.lastName = lastName || user.lastName;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.token = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error in logout'
    });
  }
};

// Update additional details
exports.updateAdditionalDetails = async (req, res) => {
  try {
    const { schoolName, grade, board, preferredSubjects } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update additional details
    user.additionalDetails = {
      schoolName,
      grade,
      board,
      preferredSubjects: preferredSubjects || []
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Additional details updated successfully',
      data: {
        additionalDetails: user.additionalDetails
      }
    });
  } catch (error) {
    console.error('Error updating additional details:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating additional details'
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { mobile_num } = req.body;

    // Check if user exists
    const user = await User.findOne({ mobile_num });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this mobile number'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    const newOtp = new Otp({
      mobile_num,
      otp,
      expiry: otpExpiry,
      status: 'pending'
    });

    await newOtp.save();

    // TODO: Send OTP via SMS service
    console.log('OTP for password reset:', otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully for password reset'
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error in forgot password process'
    });
  }
};

// Verify Reset OTP
exports.verifyResetOtp = async (req, res) => {
  try {
    const { mobile_num, otp } = req.body;

    // Find the OTP record
    const otpRecord = await Otp.findOne({
      mobile_num,
      otp,
      status: 'pending',
      expiry: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update OTP status
    otpRecord.status = 'verified';
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error in OTP verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error in OTP verification'
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { mobile_num, newPassword } = req.body;

    // Check if OTP is verified
    const verifiedOtp = await Otp.findOne({
      mobile_num,
      status: 'verified'
    });

    if (!verifiedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your mobile number with OTP first'
      });
    }

    // Find user
    const user = await User.findOne({ mobile_num });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete the used OTP record
    await Otp.deleteOne({ _id: verifiedOtp._id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error in password reset:', error);
    res.status(500).json({
      success: false,
      message: 'Error in password reset'
    });
  }
}; 