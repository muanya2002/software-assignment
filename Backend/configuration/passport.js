/**
 * Passport configuration
 */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

// Export passport for use in server.js
export const passportConfig = passport;

// You would normally import your User model here
// For example:
// import { User } from '../models/user-model.js';

// Local strategy for email/password login
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // This is a placeholder - you would fetch your user from the database
      // For example:
      // const user = await User.findOne({ email });
      
      // For testing, we'll use a dummy user
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        fullName: 'Test User'
      };
      
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      
      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));