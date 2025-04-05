// backend/config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id); // Store user id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Attach user object to req.user
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', // Matches route
      passReqToCallback: true, // Allows passing req to the callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // --- Role Handling ---
        // Get the role stored temporarily in the session during the initial redirect
        const role = req.session.authRole;
        if (!role || (role !== 'teacher' && role !== 'student')) {
            // If role is missing or invalid, return an error
            return done(new Error('Role selection is required for signup.'), null);
        }
        delete req.session.authRole; // Clean up the temporary role

        // --- User Check/Creation ---
        let currentUser = await User.findOne({ googleId: profile.id });

        if (currentUser) {
          // User exists
           if (currentUser.role !== role) {
              // Prevent role change on subsequent logins
              return done(new Error(`You previously logged in as a ${currentUser.role}. Cannot switch roles.`), null);
            }
          console.log('User already exists:', currentUser.displayName);
          done(null, currentUser); // Login existing user
        } else {
          // If it's a new user, create them
          const newUser = await new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value, // Assuming primary email
            role: role, // Assign the role selected during login initiation
          }).save();
          console.log('New user created:', newUser.displayName, 'as', newUser.role);
          done(null, newUser); // Login new user
        }
      } catch (err) {
        console.error("Error during Google OAuth:", err);
        done(err, null);
      }
    }
  )
);
