const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');

class TransactionService {
  // Create transaction record
  async createTransaction(transactionData) {
    try {
      console.log('🔧 Creating transaction:', transactionData);
      
      const transaction = new Transaction({
        transactionId: transactionData.transactionId || `TXN_${Date.now()}`,
        razorpayOrderId: transactionData.razorpayOrderId,
        razorpayPaymentId: transactionData.razorpayPaymentId,
        razorpaySignature: transactionData.razorpaySignature,
        orderId: transactionData.orderId,
        userId: transactionData.userId,
        amount: transactionData.amount,
        currency: transactionData.currency || 'INR',
        method: transactionData.method || 'razorpay',
        status: transactionData.status || 'pending',
        metadata: transactionData.metadata || {}
      });

      const savedTransaction = await transaction.save();
      console.log('✅ Transaction created:', savedTransaction);
      return savedTransaction;
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw new Error(error.message || 'Failed to create transaction');
    }
  }

  // Get transaction by ID
  async getTransactionById(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId)
        .populate('orderId')
        .populate('userId', 'firstName lastName email');
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      return transaction;
    } catch (error) {
      console.error('❌ Error fetching transaction:', error);
      throw new Error(error.message || 'Failed to fetch transaction');
    }
  }

  // Get transactions by user ID
  async getTransactionsByUserId(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = { userId };
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const transactions = await Transaction.find(query)
        .populate('orderId')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(query);

      return {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw new Error(error.message || 'Failed to fetch transactions');
    }
  }

  // Get transactions by order ID
  async getTransactionsByOrderId(orderId) {
    try {
      const transactions = await Transaction.find({ orderId })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      return transactions;
    } catch (error) {
      console.error('❌ Error fetching order transactions:', error);
      throw new Error(error.message || 'Failed to fetch order transactions');
    }
  }

  // Get all transactions (admin)
  async getAllTransactions(options = {}) {
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
      } = options;

      // Build query
      const query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Search functionality
      if (search) {
        query.$or = [
          { transactionId: { $regex: search, $options: 'i' } },
          { razorpayOrderId: { $regex: search, $options: 'i' } },
          { razorpayPaymentId: { $regex: search, $options: 'i' } }
        ];
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const transactions = await Transaction.find(query)
        .populate('orderId')
        .populate('userId', 'firstName lastName email')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(query);

      return {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error fetching all transactions:', error);
      throw new Error(error.message || 'Failed to fetch transactions');
    }
  }

  // Update transaction status
  async updateTransactionStatus(transactionId, status, metadata = {}) {
    try {
      const updateData = {
        status,
        updatedAt: new Date(),
        ...metadata
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      if (status === 'refunded') {
        updateData.refundedAt = new Date();
      }

      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        updateData,
        { new: true }
      );

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (error) {
      console.error('❌ Error updating transaction status:', error);
      throw new Error(error.message || 'Failed to update transaction status');
    }
  }

  // Process refund
  async processRefund(transactionId, refundAmount, refundReason = '') {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Only completed transactions can be refunded');
      }

      if (refundAmount > transaction.amount) {
        throw new Error('Refund amount cannot exceed transaction amount');
      }

      // Update transaction with refund information
      const refundData = {
        refundId: `REF_${Date.now()}`,
        refundAmount,
        refundReason,
        refundStatus: 'initiated',
        status: 'refunded',
        updatedAt: new Date(),
        refundedAt: new Date()
      };

      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        refundData,
        { new: true }
      );

      console.log('✅ Refund processed:', updatedTransaction);
      return updatedTransaction;
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      throw new Error(error.message || 'Failed to process refund');
    }
  }

  // Get transaction statistics
  async getTransactionStatistics(options = {}) {
    try {
      const {
        startDate,
        endDate,
        userId
      } = options;

      // Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        if (startDate) {
          dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.$lte = new Date(endDate);
        }
      }

      // Build query
      const query = {};
      if (userId) {
        query.userId = userId;
      }
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      // Aggregate statistics
      const stats = await Transaction.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalRefunded: { $sum: '$refundAmount' }
          }
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: '$count' },
            pendingCount: {
              $sum: {
                $cond: [
                  { if: { $eq: ['$status', 'pending'] }, then: 1, else: 0 }
                ]
              }
            },
            processingCount: {
              $sum: {
                $cond: [
                  { if: { $eq: ['$status', 'processing'] }, then: 1, else: 0 }
                ]
              }
            },
            completedCount: {
              $sum: {
                $cond: [
                  { if: { $eq: ['$status', 'completed'] }, then: 1, else: 0 }
                ]
              }
            },
            failedCount: {
              $sum: {
                $cond: [
                  { if: { $eq: ['$status', 'failed'] }, then: 1, else: 0 }
                ]
              }
            },
            refundedCount: {
              $sum: {
                $cond: [
                  { if: { $eq: ['$status', 'refunded'] }, then: 1, else: 0 }
                ]
              }
            },
            totalRevenue: { $sum: '$amount' },
            totalRefunded: { $sum: '$refundAmount' },
            netRevenue: { $subtract: ['$totalAmount', '$totalRefunded'] }
          }
        }
      ]);

      return stats[0] || {
        totalTransactions: 0,
        pendingCount: 0,
        processingCount: 0,
        completedCount: 0,
        failedCount: 0,
        refundedCount: 0,
        totalRevenue: 0,
        totalRefunded: 0,
        netRevenue: 0
      };
    } catch (error) {
      console.error('❌ Error getting transaction statistics:', error);
      throw new Error(error.message || 'Failed to get transaction statistics');
    }
  }

  // Get payment methods breakdown
  async getPaymentMethodsBreakdown(options = {}) {
    try {
      const {
        startDate,
        endDate,
        userId
      } = options;

      // Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        if (startDate) {
          dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.$lte = new Date(endDate);
        }
      }

      // Build query
      const query = {};
      if (userId) {
        query.userId = userId;
      }
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      const breakdown = await Transaction.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: '$method',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            successCount: {
              $sum: {
                $cond: [
                  { if: { $in: ['$status', ['completed', 'refunded']] }, then: 1, else: 0 }
                ]
              }
            },
            totalRefunded: { $sum: '$refundAmount' }
          }
        },
        {
          $sort: { totalAmount: -1 }
        }
      ]);

      return breakdown;
    } catch (error) {
      console.error('❌ Error getting payment methods breakdown:', error);
      throw new Error(error.message || 'Failed to get payment methods breakdown');
    }
  }
}

module.exports = new TransactionService();
