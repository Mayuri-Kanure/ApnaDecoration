const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  credit: {
    type: Number,
    default: 0
  },
  debit: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['Add', 'Order Payment', 'Refund', 'Withdrawal', 'Penalty'],
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
walletTransactionSchema.index({ customerId: 1, createdAt: -1 });
walletTransactionSchema.index({ transactionId: 1 });
walletTransactionSchema.index({ transactionType: 1 });

module.exports = mongoose.model('Wallet', walletTransactionSchema);
