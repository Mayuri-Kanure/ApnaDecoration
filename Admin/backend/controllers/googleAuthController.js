const { google } = require('googleapis');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
);

// Get Google OAuth URL
exports.getGoogleAuthUrl = (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: crypto.randomBytes(32).toString('hex'), // CSRF protection
      prompt: 'consent'
    });

    res.json({ authUrl: url });
  } catch (error) {
    console.error('Google Auth URL error:', error);
    res.status(500).json({ message: 'Failed to generate Google auth URL' });
  }
};

// Handle Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.email) {
      return res.status(400).json({ message: 'Failed to get user email from Google' });
    }

    // Find or create user in database
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.id }
      ]
    });

    if (!user) {
      // Create new user from Google data
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        avatar: googleUser.picture,
        authProvider: 'google',
        role: 'user',
        isActive: true,
        isEmailVerified: googleUser.verified_email || true,
        lastLogin: new Date()
      });

      await user.save();
      console.log('New Google user created:', user.email);
    } else {
      // Update existing user with Google data
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.authProvider = 'google';
      }
      
      user.avatar = googleUser.picture;
      user.lastLogin = new Date();
      
      if (!user.isEmailVerified && googleUser.verified_email) {
        user.isEmailVerified = true;
      }

      await user.save();
      console.log('Google user updated:', user.email);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        authProvider: 'google'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set token in HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data and token
    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// Handle Google login from frontend (token-based)
exports.googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      verified_email: payload.email_verified
    };

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.id }
      ]
    });

    if (!user) {
      // Create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        avatar: googleUser.picture,
        authProvider: 'google',
        role: 'user',
        isActive: true,
        isEmailVerified: googleUser.verified_email,
        lastLogin: new Date()
      });

      await user.save();
    } else {
      // Update existing user
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.authProvider = 'google';
      }
      
      user.avatar = googleUser.picture;
      user.lastLogin = new Date();
      
      if (!user.isEmailVerified && googleUser.verified_email) {
        user.isEmailVerified = true;
      }

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        authProvider: 'google'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
};

// Link Google account to existing user
exports.linkGoogleAccount = async (req, res) => {
  try {
    const { googleToken } = req.body;
    const userId = req.user._id;

    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    // Check if Google account is already linked to another user
    const existingUser = await User.findOne({ googleId: googleUser.id });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'Google account is already linked to another user' });
    }

    // Update user with Google info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.googleId = googleUser.id;
    user.avatar = googleUser.picture;
    
    if (!user.authProvider || user.authProvider === 'local') {
      user.authProvider = 'hybrid'; // Both local and Google auth
    }

    await user.save();

    res.json({
      success: true,
      message: 'Google account linked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({ message: 'Failed to link Google account' });
  }
};

// Unlink Google account
exports.unlinkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.googleId) {
      return res.status(400).json({ message: 'No Google account linked' });
    }

    // Check if user has password (for local auth)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'Cannot unlink Google account. Please set a password first.' 
      });
    }

    user.googleId = null;
    if (user.authProvider === 'google') {
      user.authProvider = 'local';
    } else if (user.authProvider === 'hybrid') {
      user.authProvider = 'local';
    }

    await user.save();

    res.json({
      success: true,
      message: 'Google account unlinked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('Unlink Google account error:', error);
    res.status(500).json({ message: 'Failed to unlink Google account' });
  }
};
