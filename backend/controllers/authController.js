// backend/controllers/authController.js
const passport = require('passport');

// @desc    Initiate Google OAuth flow
// @route   GET /api/auth/google
exports.googleAuth = (req, res, next) => {
    const role = req.query.role; // Get role from query param ('teacher' or 'student')

    if (!role || (role !== 'teacher' && role !== 'student')) {
        return res.status(400).redirect(`${process.env.CLIENT_URL}/login?error=Role%20selection%20required`);
    }

    // Store the selected role temporarily in the session before redirecting to Google
    req.session.authRole = role;

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        // Optionally add prompt: 'select_account' if you always want account chooser
    })(req, res, next);
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) {
            console.error("Google callback error:", err.message);
            // Redirect to frontend login page with error message
            return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(err.message)}`);
        }
        if (!user) {
            // Authentication failed (e.g., user denied permission)
             return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication%20failed`);
        }

        // Authentication successful, log the user in (Passport handles session setup)
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                console.error("Login error after Google callback:", loginErr);
                return res.redirect(`${process.env.CLIENT_URL}/login?error=Login%20failed`);
            }
            // Redirect to the appropriate dashboard based on role
            const redirectUrl = user.role === 'teacher'
                ? `${process.env.CLIENT_URL}/teacher/dashboard`
                : `${process.env.CLIENT_URL}/student/dashboard`;
            res.redirect(redirectUrl);
        });
    })(req, res, next); // Pass req, res, next to the authenticate function
};

// @desc    Logout user
// @route   GET /api/auth/logout
exports.logout = (req, res, next) => {
    req.logout(function(err) { // req.logout requires a callback in recent Passport versions
        if (err) {
            console.error("Logout error:", err);
            return next(err); // Pass error to Express error handler
         }
        req.session.destroy((err) => { // Ensure session is destroyed
             if (err) {
                console.error("Session destruction error:", err);
             }
             res.clearCookie('connect.sid'); // Optional: Clear session cookie
             // Send a success response or redirect
             // res.redirect(process.env.CLIENT_URL || '/'); // Redirect to client home/login
              res.status(200).json({ message: 'Successfully logged out' }); // Or send JSON response
         });

    });
};


// @desc    Get current logged-in user
// @route   GET /api/auth/current_user
exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
     // Send relevant user info, avoid sending sensitive data if any
    res.json({
        _id: req.user._id,
        googleId: req.user.googleId,
        displayName: req.user.displayName,
        email: req.user.email,
        role: req.user.role,
    });
  } else {
    res.status(401).json(null); // Indicate no user is logged in
  }
};



// Import necessary models (adjust paths and names as needed)
const User = require('../models/User'); // Assuming you have a User model
const Assessment = require('../models/Assessment'); // If teachers create assessments
const Result = require('../models/Submission'); // If students have results/attempts

/**
@desc    Delete user account and associated data
@route   DELETE /api/users/me  (or a similar route like /api/account/delete)
@access  Private (User must be logged in)
 */
exports.deleteAccount = async (req, res, next) => {
    // 1. Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const userId = req.user._id; // Or req.user.id depending on your setup

    try {
        // --- Important Design Decision: Handle Associated Data ---
        // Decide what to do with data created by or related to this user.
        // Option A: Delete associated data (Common for account deletion)
        // Option B: Orphan data (Set user ID fields to null) - Less common for deletion

        // Example: Option A - Delete associated data
        const user = await User.findById(userId); // Fetch user to check role if needed
        if (!user) {
            // Should not happen if req.user exists, but good practice
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'teacher') {
            // Delete assessments created by this teacher
            const deleteAssessmentsResult = await Assessment.deleteMany({ teacherId: userId });
            console.log(`Deleted ${deleteAssessmentsResult.deletedCount} assessments for teacher ${userId}`);
            // You might also need to delete results associated with these assessments
            // This can get complex - consider implications carefully
        } else if (user.role === 'student') {
            // Delete results/attempts made by this student
            const deleteResultsResult = await Result.deleteMany({ studentId: userId });
            console.log(`Deleted ${deleteResultsResult.deletedCount} results for student ${userId}`);
        }
        // Add cleanup for any other related data models...

        // 2. Delete the user document from the database
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            // Again, unlikely if the previous check passed, but handle it.
            return res.status(404).json({ message: 'User not found during deletion attempt' });
        }

        console.log(`Successfully deleted user account: ${userId}`);

        // 3. Log the user out completely (similar to your logout logic)
        req.logout(function(logoutErr) {
            if (logoutErr) {
                console.error("Logout error after account deletion:", logoutErr);
                // Even if logout fails, the account is deleted. Decide how critical this is.
                // You might still want to proceed with session destruction.
                // return next(logoutErr); // Or just log it and continue
            }

            req.session.destroy((sessionErr) => {
                if (sessionErr) {
                    console.error("Session destruction error after account deletion:", sessionErr);
                    // Log the error, but the main goal (deletion) is done.
                }
                res.clearCookie('connect.sid', { path: '/' }); // Adjust cookie options if needed

                // 4. Send success response
                return res.status(200).json({ message: 'Account successfully deleted' });
            });
        });

    } catch (err) {
        console.error("Error deleting account:", err);
        // Pass error to the Express error handler
        next(err);
    }
};