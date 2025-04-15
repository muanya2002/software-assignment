import express from 'express';
import { static as serveStatic } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {passportConfig} from '../Backend/configuration/passport.js';
import session from 'express-session';
import passport from 'passport';
import { JWT_SECRET, OPENVERSE_API_URL } from '../Backend/configuration/config.js';
import { config } from 'dotenv';


import authRoutes from './routes/auth-route.js';
import searchRoutes from './routes/search-routes.js';    
import favoritesRoutes from './routes/fav-routes.js';
import carRoutes from './routes/car-route.js';
import openverseRoutes from './routes/openverse-routes.js';

// Load environment variables
config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://127.0.1:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passportConfig.initialize());
app.use(passportConfig.session());

// MongoDB connection
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carSearchDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/openverse', openverseRoutes);
app.use('/api/cars', carRoutes);

app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
app.get('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: '../Frontend/pages/login.html' ,
    session: false
}), (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}/pages/index.html?token=${token}`);
});

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
