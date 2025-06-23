const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/Competition');
const upload = require('../config/multer');

// Overview routes with image upload
router.post('/overview', upload.single('image'), competitionController.createOverview);
router.get('/overview/:id', competitionController.getOverview);
router.put('/overview/:id', upload.single('image'), competitionController.updateOverview);

// Syllabus routes
router.post('/syllabus/:id', competitionController.createSyllabus);
router.get('/syllabus/:id', competitionController.getSyllabus);
router.put('/syllabus/:id', competitionController.updateSyllabus);

// Pattern routes
router.post('/pattern/:id', competitionController.createPattern);
router.get('/pattern/:id', competitionController.getPattern);
router.put('/pattern/:id', competitionController.updatePattern);

// Eligibility routes
router.post('/eligibility/:id', competitionController.createEligibility);
router.get('/eligibility/:id', competitionController.getEligibility);
router.put('/eligibility/:id', competitionController.updateEligibility);

// Registration routes
router.post('/registration/:id', competitionController.createRegistration);
router.get('/registration/:id', competitionController.getRegistration);
router.put('/registration/:id', competitionController.updateRegistration);

// Awards routes
router.post('/awards/:id', competitionController.createAwards);
router.get('/awards/:id', competitionController.getAwards);
router.put('/awards/:id', competitionController.updateAwards);

// all competitions
router.get('/all', competitionController.getAllCompetitions);

module.exports = router; 