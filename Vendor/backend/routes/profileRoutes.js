const express = require('express');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const auth = require('../middleware/auth');
const router = express.Router();

// Get vendor profile
router.get('/', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId).select('-password');
    
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

// Update vendor profile
router.put('/', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('businessName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Business name required'),
  body('address').optional().isObject().withMessage('Address must be an object')
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

    const vendorId = req.vendorId;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.email;
    delete updates.status;
    delete updates.commission;
    delete updates.totalSales;
    delete updates.totalEarnings;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Update bank details
router.put('/bank-details', auth, [
  body('accountNumber').notEmpty().withMessage('Account number required'),
  body('ifscCode').notEmpty().withMessage('IFSC code required'),
  body('accountHolderName').notEmpty().withMessage('Account holder name required'),
  body('bankName').notEmpty().withMessage('Bank name required')
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

    const vendorId = req.vendorId;
    const { accountNumber, ifscCode, accountHolderName, bankName } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        bankDetails: {
          accountNumber,
          ifscCode,
          accountHolderName,
          bankName
        },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bank details',
      error: error.message
    });
  }
});

// Update documents
router.put('/documents', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const documents = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        documents,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Documents updated successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Update documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update documents',
      error: error.message
    });
  }
});

// Get earnings summary
router.get('/earnings', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const vendor = await Vendor.findById(vendorId).select('totalEarnings totalSales commission rating reviewCount');

    res.json({
      success: true,
      data: {
        totalEarnings: vendor.totalEarnings || 0,
        totalSales: vendor.totalSales || 0,
        commission: vendor.commission || 10,
        rating: vendor.rating || 0,
        reviewCount: vendor.reviewCount || 0
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings',
      error: error.message
    });
  }
});

module.exports = router;
