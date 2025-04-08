import express from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-local';
import passport from 'passport'; // Missing import
import { config } from 'dotenv';
import { JWT_SECRET, OPENVERSE_API_URL } from './configuration/config.js';
import { passportConfig } from './configuration/passport.js';

// Import routes
import authRoutes from './routes/auth-route.js'; // Make sure to add correct paths
import searchRoutes from './routes/search-routes.js'; // Changed to correct file path
import favoritesRoutes from './routes/fav-routes.js'; // Make sure to add correct paths
import openverseRoutes from './routes/openverse-routes.js'; // Added Openverse routes

// Load environment variables
config();

const app = express();

// Middleware setup (missing in original)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: JWT_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carSearchDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Passport Google OAuth strategy configuration
passportConfig.use( new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback', // Fixed URL (was missing ":")
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => { // Fixed missing req parameter
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

// Serve static files
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