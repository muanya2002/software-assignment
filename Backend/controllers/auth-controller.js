import User from '../models/user-model.js';
import pkg from 'bcrypt';
const { hash, genSalt, compare } = pkg;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_SECRET } from '../configuration/config.js';
dotenv.config();
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
            const existingUser = await User.findOne({ email });
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
           return res.status(500).json({ 
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

        const token = jwt.sign(
            { userId: user_id, email: user.email },
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
   
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Google login failed' 
            });
        }
        const user = req.user;

        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
    
        // ✅ Redirect to your frontend with user info and token
        res.redirect(`http://127.0.0.1:5500/Frontend/pages/index.html?token=${token}&userId=${user._id}`);
      } catch (error) {
        console.error('Google OAuth login error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error during OAuth login',
        });
      
    }
}

export default AuthController;