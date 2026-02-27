const { PaymentMethod } = require('../models');

// Validation helpers
const validatePaymentData = (data) => {
  const errors = [];
  
  // UPI validation
  if (data.type === 'upi' && (!data.upiId || !data.upiId.includes('@'))) {
    errors.push('Valid UPI ID required');
  }
  
  // Card validation
  if ((data.type === 'credit_card' || data.type === 'debit_card') && (!data.cardNumber || data.cardNumber.length < 13)) {
    errors.push('Valid card number required');
  }
  
  // Expiry validation
  if ((data.type === 'credit_card' || data.type === 'debit_card') && (!data.expiryMonth || !data.expiryYear)) {
    errors.push('Expiry date required');
  }
  
  // Wallet validation
  if (data.type === 'wallet' && !data.walletType) {
    errors.push('Wallet type required');
  }
  
  return errors;
};

// Brand detection function
const detectCardBrand = (cardNumber) => {
  if (!cardNumber) return 'Card';
  
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'Amex';
  if (/^6[0-9]/.test(number)) return 'Discover';
  if (/^3[0-9]/.test(number)) return 'Diners Club';
  if (/^3[0-9]/.test(number)) return 'JCB';
  if (/^3[0-9]/.test(number)) return 'RuPay';
  
  return 'Card';
};

const paymentMethodController = {
  // Get all payment methods (EXCLUDE SOFT DELETED)
  getPaymentMethods: async (req, res) => {
    try {
      const paymentMethods = await PaymentMethod.find({ 
        userId: req.user.userId,
        isActive: true,
        deletedAt: null
      }).sort({ isDefault: -1, createdAt: -1 });
      
      res.json({
        success: true,
        data: paymentMethods
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment methods'
      });
    }
  },

  // Get payment method by ID
  getPaymentMethod: async (req, res) => {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findOne({ 
        _id: id, 
        userId: req.user.userId 
      });
      
      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }
      
      res.json({
        success: true,
        data: paymentMethod
      });
    } catch (error) {
      console.error('Error fetching payment method:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment method'
      });
    }
  },

  // Create new payment method
  createPaymentMethod: async (req, res) => {
    try {
      console.log('🔍 Payment method request data:', req.body);
      
      // Validate input
      const validationErrors = validatePaymentData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
      }
      
      const paymentData = {
        ...req.body,
        userId: req.user.userId
      };
      console.log('🔍 Processed payment data:', paymentData);
      
      // Handle card number masking if provided
      if (paymentData.cardNumber) {
        paymentData.last4 = paymentData.cardNumber.slice(-4);
        delete paymentData.cardNumber;
      }
      
      // Handle provider field - only required for UPI
      if (paymentData.type === 'credit_card' || paymentData.type === 'debit_card') {
        delete paymentData.provider;
      }
      
      // Handle brand field for cards
      if ((paymentData.type === 'credit_card' || paymentData.type === 'debit_card') && !paymentData.brand) {
        paymentData.brand = detectCardBrand(paymentData.cardNumber);
      }
      
      // Fix field name mismatch
      if (paymentData.holderName && !paymentData.cardholderName) {
        paymentData.cardholderName = paymentData.holderName;
        delete paymentData.holderName;
      }
      
      const paymentMethod = new PaymentMethod(paymentData);
      await paymentMethod.save();
      
      res.status(201).json({
        success: true,
        message: 'Payment method created successfully',
        data: paymentMethod
      });
    } catch (error) {
      console.error('Error creating payment method:', error);
      console.error('Validation error details:', error.errors);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment method',
        details: error.message
      });
    }
  },

  // Update payment method
  updatePaymentMethod: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const paymentMethod = await PaymentMethod.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        updateData,
        { new: true }
      );
      
      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Payment method updated successfully',
        data: paymentMethod
      });
    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update payment method'
      });
    }
  },

  // Delete payment method (SOFT DELETE)
  deletePaymentMethod: async (req, res) => {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { isActive: false, deletedAt: new Date() },
        { new: true }
      );
      
      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Payment method deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete payment method'
      });
    }
  },

  // Set default payment method (ATOMIC TRANSACTION)
  setDefaultPaymentMethod: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Start atomic transaction
      const session = await PaymentMethod.startSession();
      session.startTransaction();
      
      try {
        // Unset all other payment methods for this user
        await PaymentMethod.updateMany(
          { userId: req.user.userId },
          { isDefault: false },
          { session }
        );
        
        // Set the selected payment method as default
        const paymentMethod = await PaymentMethod.findOneAndUpdate(
          { _id: id, userId: req.user.userId },
          { isDefault: true },
          { new: true, session }
        );
        
        if (!paymentMethod) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            success: false,
            message: 'Payment method not found'
          });
        }
        
        await session.commitTransaction();
        session.endSession();
        
        res.json({
          success: true,
          message: 'Default payment method set successfully',
          data: paymentMethod
        });
      } catch (transactionError) {
        await session.abortTransaction();
        session.endSession();
        throw transactionError;
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set default payment method'
      });
    }
  },
};

module.exports = paymentMethodController;
