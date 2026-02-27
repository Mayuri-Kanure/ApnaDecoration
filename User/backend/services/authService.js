const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Import constants directly since utils are in Shared Resources
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VENDOR: 'vendor',
  DELIVERY: 'delivery'
};

const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
};

const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'apna_decoration_secure_key',
  EXPIRE: process.env.JWT_EXPIRE || '7d',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'apna_decoration_refresh_key'
};

class AuthService {
  // Generate JWT token
  static generateToken(userId, role = 'user') {
    return jwt.sign(
      { userId, role },
      JWT_CONFIG.SECRET,
      { expiresIn: JWT_CONFIG.EXPIRE }
    );
  }

  // Generate refresh token
  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      JWT_CONFIG.REFRESH_SECRET,
      { expiresIn: '30d' }
    );
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_CONFIG.SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  static async register(userData) {
    const { name, email, password, phone, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    // Hash password
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create new user
    const user = new User({
      username: email.split('@')[0], // Use email prefix as username
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || USER_ROLES.USER
    });

    await user.save();

    // Generate tokens
    const token = this.generateToken(user._id, user.role);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token,
      refreshToken
    };
  }

  // Login user
  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const token = this.generateToken(user._id, user.role);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token,
      refreshToken
    };
  }

  // Validate user input
  static validateUserData(userData) {
    const { name, email, password, phone } = userData;
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email is required');
    }

    if (!password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    if (!phone || !/^[+]?[\d\s-()]{10,}$/.test(phone)) {
      errors.push('Valid phone number is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = AuthService;
