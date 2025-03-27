const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth-route.js');
const searchRoutes = require('./routes/search-routes.js');
const favoritesRoutes = require('./routes/fav-routes.js');

// Load environment variables
dotenv.config();

// Import route handlers
const authRoutes = require('./routes/auth-route.js');
const carRoutes = require('./routes/car-route.js');
const favoriteRoutes = require('./routes/fav-routes.js');

const app = express();
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'car-search-secret',
    resave: false,
    saveUninitialized: false
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-search', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Passport Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/oauth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user based on Google profile
        const { User } = require('./models/user-model.js');
        
        let user = await User.findOne({ 'oauth.googleId': profile.id });
        
        if (!user) {
            user = new User({
                fullName: profile.displayName,
                email: profile.emails[0].value,
                oauth: {
                    googleId: profile.id
                }
            });
            await user.save();
        }
        
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { User } = require('./models/user-model.js');
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/favorites', favoritesRoutes);

// Static file serving from public directory
app.use(express.static('public'));

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});