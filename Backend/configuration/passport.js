import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { compare } from 'bcryptjs';
import { User } from '../models/user-model';

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Local Strategy for email/password login
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            // Find the user by email
            const user = await User.findOne({ email });
            
            // If no user is found
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            
            // Check password
            const isMatch = await compare(password, user.password);
            
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            
            // Success
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/oauth/google/callback',
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user based on Google profile
            let user = await User.findOne({ 'oauth.googleId': profile.id });
            
            if (!user) {
                // Create new user if not exists
                user = new User({
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    oauth: {
                        googleId: profile.id,
                        provider: 'google'
                    },
                    // Optional: set a random password for OAuth users
                    password: Math.random().toString(36).slice(-8)
                });
                
                await user.save();
            }
            
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Additional helper functions
export const passportConfig = {
    // Initialize Passport and set up strategies
    initialize: () => {
        return passport.initialize();
    },
    
    // Use Passport session
    session: () => {
        return passport.session();
    },
    
    // Authenticate locally
    authenticateLocal: passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    }),
    
    // Authenticate with Google
    authenticateGoogle: passport.authenticate('google', {
        scope: ['profile', 'email']
    }),
    
    // Google OAuth callback handler
    googleCallback: passport.authenticate('google', {
        successRedirect: '/dashboard',
        failureRedirect: '/login'
    }),
    
    // Middleware to check if user is authenticated
    isAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
};

export default passport;