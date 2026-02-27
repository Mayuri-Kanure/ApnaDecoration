const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const router = express.Router();

// Register vendor
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isMobilePhone().withMessage('Valid phone number required'),
  body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name required'),
  body('businessType').isIn(['individual', 'company']).withMessage('Valid business type required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, businessName, businessType, address } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor with this email or phone already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create vendor
    const vendor = new Vendor({
      name,
      email,
      password: hashedPassword,
      phone,
      businessName,
      businessType,
      address,
      status: 'pending', // Requires admin approval
      createdAt: new Date()
    });

    await vendor.save();

    // Generate JWT token
    const token = jwt.sign(
      { vendorId: vendor._id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Vendor registration successful. Awaiting admin approval.',
      data: {
        token,
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          businessName: vendor.businessName,
          status: vendor.status
        }
      }
    });

  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login vendor
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find vendor
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if vendor is approved
    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Account is ${vendor.status}. Please contact admin.`
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { vendorId: vendor._id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          businessName: vendor.businessName,
          status: vendor.status
        }
      }
    });

  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get vendor profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendor = await Vendor.findById(decoded.vendorId).select('-password');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: { vendor }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Logout vendor
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
