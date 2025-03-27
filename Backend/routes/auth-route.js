const express = require('express');
const passport = require('passport');
const AuthController = require('../controllers/auth-controller');
const router = express.Router();
const openverseApi = require('../api service/openverse-api');

// Local Registration Route
router.post('/register', AuthController.registerUser);

// Local Login Route
router.post('/login', AuthController.loginUser);

// Google OAuth Routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    AuthController.googleOAuthLogin
);

// Logout Route
router.get('/logout', (req, res) => {
    req.logout();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Protected Route Example
router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }
    
    res.json({
        success: true,
        user: {
            id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email
        }
    });
});

router.get('/openverse/search', openverseApi.search);
router.get('/openverse/car/:id', openverseApi.getCarDetails);

module.exports = router;