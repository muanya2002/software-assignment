import User  from '../models/user-model.js';
import pkg from 'bcryptjs';
const { hash, genSalt, compare } = pkg;
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../configuration/config.js';


export function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
}

class AuthController {
    static async registerUser(req, res) {
        try {
            const { fullName, email, password } = req.body;

            // Check if user already exists
            const existingUser = await findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User already exists' 
                });
            }

            // Hash password
            const salt = await genSalt(10);
            const hashedPassword = await hash(password, salt);

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
            const isMatch = await compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            let token;
if(this.loginUser)
             token = jwt.sign(
                { userId: user._id, email: user.email },
                JWT_SECRET,
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
        const user = req.user;

            // Generate JWT token
             token = jwt.sign(
                { userId: req.user._id, email: req.user.email },
               JWT_SECRET,
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


export default AuthController;