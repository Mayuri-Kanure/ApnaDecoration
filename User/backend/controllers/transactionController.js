const transactionService = require('../services/transactionService');
const { validationResult } = require('express-validator');

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    console.log('📝 Creating transaction request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
      amount,
      method,
      metadata
    } = req.body;

    const transactionData = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
      userId: req.user.userId,
      amount,
      method,
      metadata
    };

    const transaction = await transactionService.createTransaction(transactionData);
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create transaction'
    });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await transactionService.getTransactionById(id);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Transaction not found'
    });
  }
};

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder
    };

    const result = await transactionService.getTransactionsByUserId(req.user.userId, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transactions'
    });
  }
};

// Get all transactions (admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      search
    };

    const result = await transactionService.getAllTransactions(options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error fetching all transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transactions'
    });
  }
};

// Get transactions by order ID
exports.getTransactionsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const transactions = await transactionService.getTransactionsByOrderId(orderId);
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('❌ Error fetching order transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order transactions'
    });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, metadata } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const transaction = await transactionService.updateTransactionStatus(id, status, metadata);
    
    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update transaction status'
    });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required'
      });
    }

    const transaction = await transactionService.processRefund(id, refundAmount, refundReason);
    
    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
};

// Get transaction statistics
exports.getTransactionStatistics = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      userId
    } = req.query;

    const options = {
      startDate,
      endDate,
      userId
    };

    const stats = await transactionService.getTransactionStatistics(options);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting transaction statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get transaction statistics'
    });
  }
};

// Get payment methods breakdown
exports.getPaymentMethodsBreakdown = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      userId
    } = req.query;

    const options = {
      startDate,
      endDate,
      userId
    };

    const breakdown = await transactionService.getPaymentMethodsBreakdown(options);
    
    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('❌ Error getting payment methods breakdown:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment methods breakdown'
    });
  }
};
