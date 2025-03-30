
import express, { json, urlencoded } from 'express';
import { static as serveStatic } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import {passportConfig} from '../Backend/configuration/passport.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import { JWT_SECRET, OPENVERSE_API_URL } from '../Backend/configuration/config.js';
console.log(JWT_SECRET, OPENVERSE_API_URL);
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();

// MongoDB connection
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carSearchDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Passport Google OAuth strategy
passportConfig.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http:localhost:3000/auth/google/callback',
    passReqToCallback: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user based on Google profile
        const { User } = require('./models/user-model.js').default;
        
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
        const { User } = require('./models/user-model.js').default;
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

app.use(serveStatic('public'));

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