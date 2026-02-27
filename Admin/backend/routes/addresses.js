const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateAddress = [
  body('street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('city')
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  handleValidationErrors
];

// Get all addresses for a user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new address
router.post('/', auth, async (req, res) => {
  try {
    console.log('🏠 Add address request received:', req.body);
    console.log('👤 User ID:', req.user.userId);
    
    // Run validation manually
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { street, city, state, pincode, country, type, isDefault } = req.body;
    
    console.log('📋 Address data:', { street, city, state, pincode, country, type, isDefault });
    
    // If setting as default, unset other default addresses
    if (isDefault) {
      console.log('⭐ Setting as default address');
      await Address.updateMany(
        { userId: req.user.userId },
        { isDefault: false }
      );
    }
    
    const address = new Address({
      userId: req.user.userId,
      street,
      city,
      state,
      pincode,
      country: country || 'India',
      type: type || 'home',
      isDefault: isDefault || false
    });
    
    console.log('💾 Saving address to database...');
    await address.save();
    console.log('✅ Address saved successfully:', address);
    
    res.status(201).json(address);
  } catch (error) {
    console.error('💥 Add address error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update address
router.put('/:id', auth, validateAddress, async (req, res) => {
  try {
    const { street, city, state, pincode, country, type, isDefault } = req.body;
    
    // If setting as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.userId },
        { isDefault: false }
      );
    }
    
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { street, city, state, pincode, country: country || 'India', type: type || 'home', isDefault: isDefault || false },
      { new: true }
    );
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set default address
router.patch('/:id/default', auth, async (req, res) => {
  try {
    // Unset all default addresses for this user
    await Address.updateMany(
      { userId: req.user.userId },
      { isDefault: false }
    );
    
    // Set selected address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isDefault: true },
      { new: true }
    );
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
