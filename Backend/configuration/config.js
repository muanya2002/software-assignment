

export const OPENVERSE_API_URL = "https://api.openverse.engineering/v1";
export const OPENVERSE_CLIENT_ID = "your-client-id";
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = 'development';
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carSearchDB';
export const JWT_SECRET = process.env.JWT_SECRET || 'car-search-jwt-secret';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/oauth/google/callback';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
