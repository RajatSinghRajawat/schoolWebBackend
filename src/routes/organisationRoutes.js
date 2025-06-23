const express = require('express');
const router = express.Router();
const { 
    sendMobileOTP,
    sendEmailOTP,
    verifyMobileOTP,
    verifyEmailOTP,
    registerOrganisation,
    getAllOrganisations,
    getOrganisationById,
    loginOrganisation,
    sendForgetPasswordOTP,
    verifyForgetPasswordOTP,
    resetPassword,
    getOrganisationProfile,
    updateOrganisationProfile
} = require('../controllers/OrganisationRegister');

// Mobile OTP Routes
router.post('/send-mobile-otp', sendMobileOTP);
router.post('/verify-mobile-otp', verifyMobileOTP);

// Email OTP Routes
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);

// Forget Password Routes
router.post('/forget-password/send-otp', sendForgetPasswordOTP);
router.post('/forget-password/verify-otp', verifyForgetPasswordOTP);
router.post('/forget-password/reset', resetPassword);

// Organisation Routes
router.post('/register', registerOrganisation);
router.post('/login', loginOrganisation);
router.get('/', getAllOrganisations);
router.get('/:id', getOrganisationById);
router.post('/profile/:id', getOrganisationProfile);
router.put('/Updateprofile', updateOrganisationProfile);

module.exports = router; 