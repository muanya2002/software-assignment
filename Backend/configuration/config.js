
// Configuration variables
import dotenv from 'dotenv';
dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Database configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carSearchDB';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

// API URLs
export const OPENVERSE_API_URL = process.env.OPENVERSE_API_URL || 'https://api.openverse.org';
export const client_id = process.env.OPENVERSE_CLIENT_ID || 'YOUR_CLIENT_ID';
export const client_secret = process.env.OPENVERSE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
export const grant_type = process.env.grant_type || 'client_credentials';

// Google OAuth configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

// CORS configuration
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';