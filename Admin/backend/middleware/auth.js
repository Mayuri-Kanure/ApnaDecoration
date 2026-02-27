const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', { clockTolerance: 60 });
    
    console.log('Token verified successfully:', decoded);
    
    // Fetch actual user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Set user info from database
    req.userId = user._id;
    req.user = {
      id: user._id,
      _id: user._id,
      userId: user._id,
      role: user.role,
      isActive: user.isActive,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    next();
  } catch (error) {
    // Handle different types of authentication errors
    if (error.name === 'TokenExpiredError') {
      console.log('🔐 Token expired at:', error.expiredAt);
      return res.status(401).json({ 
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    } else if (error.name === 'JsonWebTokenError') {
      console.log('🔐 Invalid token provided');
      return res.status(401).json({ 
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ 
        message: 'Authentication failed.',
        code: 'AUTH_ERROR'
      });
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Authorize middleware - User role:', req.user?.role);
    console.log('🔐 Required roles:', roles);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ 
        message: 'Access denied. User not authenticated.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ User role not authorized. User role:', req.user.role, 'Required:', roles);
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    console.log('✅ User authorized:', req.user.role);
    next();
  };
};

module.exports = { auth, authorize };
