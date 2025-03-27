const User = require('../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

class AuthController {
    static async registerUser(req, res) {
        try {
            const { fullName, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User already exists' 
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const newUser = new User({
                fullName,
                email,
                password: hashedPassword
            });

            await newUser.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: newUser._id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error during registration' 
            });
        }
    }

    static async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                token,
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
                message: 'Server error during login' 
            });
        }
    }

    static async googleOAuthLogin(req, res) {
        try {
            // Handle Google OAuth authentication
            // This method would be called after successful passport authentication
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication failed' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: req.user._id, email: req.user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                success: true,
                message: 'Google OAuth login successful',
                token,
                user: {
                    id: req.user._id,
                    fullName: req.user.fullName,
                    email: req.user.email
                }
            });
        } catch (error) {
            console.error('Google OAuth login error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error during OAuth login' 
            });
        }
    }
}

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = AuthController;