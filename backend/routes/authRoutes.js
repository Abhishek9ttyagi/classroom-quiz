// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isLoggedIn } = require('../middleware/authMiddleware'); // Only need isLoggedIn for current_user

// Initiate Google Auth - Redirects to Google
// The '?role=xxx' query param is crucial here
router.get('/google', authController.googleAuth);

// Google Auth Callback - Handles response from Google
router.get('/google/callback', authController.googleCallback);

// Logout User
router.get('/logout', authController.logout);

// Get Logged-in User Info
router.get('/current_user', isLoggedIn, authController.getCurrentUser); // Protect this route

module.exports = router;