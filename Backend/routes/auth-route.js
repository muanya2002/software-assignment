import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../configuration/config.js';
import AuthController from '../controllers/auth-controller.js';
const router = express.Router();
;
// Import User model
import User from '../models/user-model.js';
import passport from 'passport';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging in'
    });
  }
});

// Google OAuth login route
router.get('/auth/google', passport.authenticate('google', {
  // This will be handled by Passport middleware
scope:['profile' , 'email']
}));

// Google OAuth callback route
router.get('/auth/google/callback', 
  passport.authenticate('google' , {failureRedirect: '/login' }),
  AuthController.googleOAuthLogin

  // This will be handled by Passport middleware
);

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Check auth status route
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      isLoggedIn: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email
      }
    });
  }
  
  res.json({
    success: true,
    isLoggedIn: false
  });
});

export default router;