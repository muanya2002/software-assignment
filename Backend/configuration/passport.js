
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import  User  from '../models/user-model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debugging: Print credentials to confirm they're set
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are missing in .env");
}

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

//google strategy for authentication
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
   
}, 
 async (accessToken, refreshToken, profile, done) => {
try {
    console.log("Google profile:", profile);
    // Check if user already exists in the database
  const user = await User.findOrCreateByOAuth({
    name: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id,
  });
return done(null, user);
} catch (error) {
    console.error('OAurh DB error:', error);
    return done(error, null);
}
}));
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
        successRedirect: 'http://127.0.0.1:5500/Frontend/pages/index.html',
        failureRedirect: 'http://127.0.0.1:5500/Frontend/pages/login.html',
        failureFlash: true
    }),
    
    // Authenticate with Google
    authenticateGoogle: passport.authenticate('google', {
        scope: ['profile', 'email']
    }),
    
    // Google OAuth callback handler
    googleCallback: passport.authenticate('google', {
        successRedirect: 'http://127.0.0.1:5500/Frontend/pages/index.html',
        failureRedirect: 'http://127.0.0.1:5500/Frontend/pages/login.html',
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