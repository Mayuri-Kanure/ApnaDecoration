const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    console.log('🔍 Login attempt:', { email, password: '***' });

    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    console.log('🔍 Registration request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, role } = req.body;
    const userRole = role || 'vendor'; // Default to vendor if not provided
    console.log('📝 Extracted data:', { username, email, password: '***', firstName, lastName, role: userRole });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('❌ Username already taken:', username);
      return res.status(400).json({ message: 'Username already taken' });
    }

    console.log('👤 Creating new user...');
    const newUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: userRole,
      phone: '',
      isActive: true
    });
    console.log('✅ User created successfully:', newUser._id);

    const token = generateToken(newUser._id, newUser.role);
    console.log('🔑 Token generated');

    const response = {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phone: newUser.phone
      }
    };
    console.log('📤 Sending response');
    res.status(201).json(response);
  } catch (error) {
    console.error('💥 Registration error:', error);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log('getProfile called with userId:', req.userId);
    console.log('req.user:', req.user);
    
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found for ID:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      phone: updatedUser.phone,
      isActive: updatedUser.isActive,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { 
      password: hashedPassword,
      lastPasswordChange: new Date()
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle two-factor authentication
exports.toggleTwoFactor = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.userId;

    // Update user's 2FA setting
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { twoFactorEnabled: enabled },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
      twoFactorEnabled: enabled
    });
  } catch (error) {
    console.error('Toggle 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
