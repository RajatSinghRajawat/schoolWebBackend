const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-otp', userController.verifyResetOtp);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/Updateprofile', authMiddleware, userController.updateProfile);
router.put('/additional-details', authMiddleware, userController.updateAdditionalDetails);
router.post('/logout', authMiddleware, userController.logout);

module.exports = router; 