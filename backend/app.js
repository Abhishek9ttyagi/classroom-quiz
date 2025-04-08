// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Passport Config (needs to be required AFTER models are potentially loaded if they interact)
require('./config/passport-setup'); // Setup Passport strategy

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---

// CORS Middleware - Allow requests from frontend
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow frontend origin
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // Allow cookies/session info to be sent
}));

// Body Parser Middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

// Session Middleware (before Passport session)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({ // Store session in MongoDB
       mongoUrl: process.env.MONGO_URI,
       collectionName: 'sessions' // Optional: specify collection name
     }),
    cookie: {
      // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevent client-side JS access
      maxAge: 1000 * 60 * 60 * 24 // 1 day session expiry
    }
  })
);

// Passport Middleware (Initialize Passport and restore authentication state, if any, from the session)
app.use(passport.initialize());
app.use(passport.session()); // Use session for persistent logins


// --- Routes ---
app.get('/', (req, res) => {
     res.send(`MERN Quiz API Running on Port ${PORT}... User: ${req.user ? req.user.displayName : 'Guest'}`);
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));

// --- Simple Error Handling ---
 app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        // Optionally include stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));