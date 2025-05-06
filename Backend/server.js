import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import  '../Backend/configuration/passport.js';
import session from 'express-session';
import passport from 'passport';
import { passportConfig } from '../Backend/configuration/passport.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth-route.js';
import searchRoutes from './routes/search-routes.js';    
import favoritesRoutes from './routes/fav-routes.js';
import carRoutes from './routes/car-route.js';
import openverseRoutes from './routes/openverse-routes.js';

// Load environment variables
config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:3000',
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


// 🧩 Serve static files from correct subfolders
const frontendDir = path.join(__dirname, '../Frontend');
app.use('/css', express.static(path.join(frontendDir, 'css')));
app.use('/javascript', express.static(path.join(frontendDir, 'javascript')));
app.use('/images', express.static(path.join(frontendDir, 'images')));
app.use('/pages', express.static(path.join(frontendDir, 'pages')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/openverse', openverseRoutes);
app.use('/api/cars', carRoutes);

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



// Serve HTML files from /pages
app.get(['/', '/pages/:page'], (req, res) => {
    const page = req.params.page || 'index.html';
    const filePath = path.join(frontendDir, 'pages', page);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            res.status(404).send('Page not found');
        }
    });
});


// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
