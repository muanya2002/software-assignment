/**
 * Configuration file for the application
 */

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const OPENVERSE_API_URL = process.env.OPENVERSE_API_URL || 'https://api.openverse.org/v1';
export const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carSearchDB';

// Other config settings
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';