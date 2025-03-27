import { verify } from 'jsonwebtoken';
import { User } from '../models/user-model';

/**
 * Middleware for optional authentication
 * Sets req.user if token is valid, but doesn't block request if not authenticated
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = verify(token, process.env.JWT_SECRET || 'car-search-jwt-secret');
                const user = await User.findById(decoded.userId);
                
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // If token is invalid, just continue without setting req.user
                console.warn('Invalid token in optional auth:', error);
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        console.error('Optional auth error:', error);
        next();
    }
};

export default optionalAuth;