const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction identification
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    required: true
  },
  razorpaySignature: {
    type: String,
    required: true
  },

  // Order information
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  method: {
    type: String,
    required: true,
    enum: ['razorpay', 'cod', 'wallet', 'upi', 'card', 'netbanking']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },

  // Refund information
  refundId: {
    type: String
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundStatus: {
    type: String,
    enum: ['none', 'initiated', 'processing', 'completed', 'failed'],
    default: 'none'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
