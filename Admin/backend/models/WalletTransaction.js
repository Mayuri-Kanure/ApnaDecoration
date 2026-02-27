const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  reference: {
    type: String,
    // Reference to order, refund, etc.
  },
  category: {
    type: String,
    enum: ['order', 'refund', 'bonus', 'withdrawal', 'fee', 'other'],
    default: 'other'
  },
  balance: {
    type: Number,
    // Balance after this transaction
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
