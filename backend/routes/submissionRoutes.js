// backend/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { isLoggedIn, isStudent } = require('../middleware/authMiddleware');

// Student Routes
router.post('/:assessmentId', isLoggedIn, isStudent, submissionController.submitAssessment);
router.get('/my-results', isLoggedIn, isStudent, submissionController.getMySubmissions); // Get student's own submission history
router.get('/:submissionId', isLoggedIn, isStudent, submissionController.getSubmissionById); // Get details of a specific result

module.exports = router;