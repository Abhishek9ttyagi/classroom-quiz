// backend/middleware/authMiddleware.js

const Assessment = require('../models/Assessment'); // Adjust the path if necessary

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // Provided by Passport
      return next();
    }
    res.status(401).json({ message: 'Unauthorized: Not logged in' });
  };
  
  const isTeacher = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'teacher') {
      return next();
    }
    res.status(403).json({ message: 'Forbidden: Requires teacher role' });
  };
  
  const isStudent = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'student') {
      return next();
    }
    res.status(403).json({ message: 'Forbidden: Requires student role' });
  };
  
  
  // Optional: Middleware to check if the teacher owns the assessment
  const isAssessmentOwner = async (req, res, next) => {
      try {
          const assessment = await Assessment.findById(req.params.id);
          if (!assessment) {
              return res.status(404).json({ message: 'Assessment not found' });
          }
          // Ensure the logged-in user's ID matches the assessment's creator ID
          if (assessment.createdBy.toString() !== req.user.id) {
              return res.status(403).json({ message: 'Forbidden: You do not own this assessment' });
          }
          req.assessment = assessment; // Attach assessment to request for subsequent handlers
          next();
      } catch (error) {
          console.error("Ownership check error:", error);
          if (error.kind === 'ObjectId') {
               return res.status(400).json({ message: 'Invalid assessment ID format' });
          }
          res.status(500).json({ message: 'Server error during ownership check' });
      }
  };
  
  
  module.exports = { isLoggedIn, isTeacher, isStudent, isAssessmentOwner };