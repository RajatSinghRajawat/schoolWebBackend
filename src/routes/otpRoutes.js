const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// Send OTP
router.post('/send', otpController.sendOTP);

// Verify OTP
router.post('/verify', otpController.verifyOTP);

module.exports = router; 