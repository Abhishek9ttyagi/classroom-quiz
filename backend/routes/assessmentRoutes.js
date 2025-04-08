// backend/routes/assessmentRoutes.js
const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { isLoggedIn, isTeacher, isStudent, isAssessmentOwner } = require('../middleware/authMiddleware');

// Teacher Routes
router.post('/', isLoggedIn, isTeacher, assessmentController.createAssessment);
router.get('/', isLoggedIn, isTeacher, assessmentController.getMyAssessments); // Get teacher's own assessments
// Note: isAssessmentOwner includes isLoggedIn & isTeacher implicitly for these PUT/DELETE routes due to ownership check logic
router.put('/:id', isLoggedIn, isTeacher, isAssessmentOwner, assessmentController.updateAssessment);
router.delete('/:id', isLoggedIn, isTeacher, isAssessmentOwner, assessmentController.deleteAssessment);

// Route for getting assessment details (can be accessed by teacher owner or any logged-in student)
// The controller logic handles role-specific data filtering (hiding answers for students)
router.get('/:id', isLoggedIn, assessmentController.getAssessmentById);


module.exports = router;