const PaymentMethod = require('../models/PaymentMethod');
const { validationResult, body } = require('express-validator');

// Validation rules
const validatePaymentMethod = [
  // Common validation for all payment types
  body('type')
    .isIn(['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'])
    .withMessage('Invalid payment method type'),
  body('provider')
    .notEmpty()
    .withMessage('Provider is required'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  
  // Credit/Debit card specific validation
  body('last4')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty()
    .withMessage('Last 4 digits are required for credit/debit cards')
    .isLength({ min: 4, max: 4 })
    .withMessage('Last 4 digits must be exactly 4 digits'),
  body('cardholderName')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty()
    .withMessage('Cardholder name is required for credit/debit cards'),
  body('expiryMonth')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty()
    .withMessage('Expiry month is required for credit/debit cards')
    .isLength({ min: 2, max: 2 })
    .withMessage('Expiry month must be 2 digits'),
  body('expiryYear')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty()
    .withMessage('Expiry year is required for credit/debit cards')
    .isLength({ min: 4, max: 4 })
    .withMessage('Expiry year must be 4 digits'),
  
  // UPI specific validation
  body('upiId')
    .if(body('type').equals('upi'))
    .notEmpty()
    .withMessage('UPI ID is required for UPI payments')
    .isLength({ min: 5, max: 50 })
    .withMessage('UPI ID must be 5-50 characters'),
];

// Get all payment methods for a user
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ 
      userId: req.user.userId,
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 });

    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment method by ID
exports.getPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add new payment method
exports.createPaymentMethod = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const paymentData = {
      ...req.body,
      userId: req.user.userId
    };

    // If setting as default, unset other defaults
    if (paymentData.isDefault) {
      await PaymentMethod.updateMany(
        { userId: req.user.userId },
        { isDefault: false }
      );
    }

    // Handle card number masking if provided
    if (paymentData.cardNumber) {
      paymentData.last4 = paymentData.cardNumber.slice(-4);
      // Don't store full card number in database
      delete paymentData.cardNumber;
    }

    const newPaymentMethod = await PaymentMethod.create(paymentData);
    res.status(201).json(newPaymentMethod);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = { ...req.body };
    
    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await PaymentMethod.updateMany(
        { userId: req.user.userId },
        { isDefault: false }
      );
    }

    // Handle card number masking if provided
    if (updateData.cardNumber) {
      updateData.last4 = updateData.cardNumber.slice(-4);
      delete updateData.cardNumber;
    }

    const updatedPaymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true }
    );

    if (!updatedPaymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json(updatedPaymentMethod);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const deletedPaymentMethod = await PaymentMethod.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deletedPaymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set default payment method
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    // Unset all defaults for this user
    await PaymentMethod.updateMany(
      { userId: req.user.userId },
      { isDefault: false }
    );

    // Set selected as default
    const updatedPaymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isDefault: true },
      { new: true }
    );

    if (!updatedPaymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json(updatedPaymentMethod);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  validatePaymentMethod,
  getPaymentMethods: exports.getPaymentMethods,
  getPaymentMethod: exports.getPaymentMethod,
  createPaymentMethod: exports.createPaymentMethod,
  updatePaymentMethod: exports.updatePaymentMethod,
  deletePaymentMethod: exports.deletePaymentMethod,
  setDefaultPaymentMethod: exports.setDefaultPaymentMethod
};
