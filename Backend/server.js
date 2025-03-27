
import express, { json, urlencoded } from 'express';
import { static as serveStatic } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import { initialize, session as _session, use, serializeUser, deserializeUser } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import { JWT_SECRET, OPENVERSE_API_URL } from '../Backend/configuration/config.js';
console.log(JWT_SECRET, OPENVERSE_API_URL);
import authRoutes from './routes/auth-route.js';
import searchRoutes from './routes/search-routes.js';
import favoritesRoutes from './routes/fav-routes.js';

// Load environment variables
config();

// Import route handlers
import authRoutes from './routes/auth-route.js';
import carRoutes from './routes/car-route.js';
import favoriteRoutes from './routes/fav-routes.js';

const app = express();
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'car-search-secret',
    resave: false,
    saveUninitialized: false
}));

// Passport initialization
app.use(initialize());
app.use(_session());

// MongoDB connection
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-search', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Passport Google OAuth strategy
use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/oauth/google/callback'
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
serializeUser((user, done) => {
    done(null, user.id);
});

deserializeUser(async (id, done) => {
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