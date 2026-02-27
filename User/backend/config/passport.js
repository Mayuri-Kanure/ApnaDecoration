const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5002/api/auth/google/callback',
  scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = profile.id;
        user.avatar = profile.photos[0]?.value || user.avatar;
        await user.save();
      }
      return done(null, user);
    } else {
      // Create new user
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0]?.value || '',
        password: 'google-oauth-' + Math.random().toString(36).slice(-8), // Random password for Google users
        role: 'user',
        status: 'active'
      });

      await newUser.save();
      return done(null, newUser);
    }
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
