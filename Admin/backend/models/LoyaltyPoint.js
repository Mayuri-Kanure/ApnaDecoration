const mongoose = require('mongoose');

const loyaltyPointSchema = new mongoose.Schema({
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
    enum: ['Order Place', 'Purchase', 'Manual Adjust', 'Refund', 'Bonus', 'Redemption'],
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate transaction ID before saving
loyaltyPointSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const count = await this.constructor.countDocuments();
    this.transactionId = `LOY-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better performance
loyaltyPointSchema.index({ customerId: 1, createdAt: -1 });
loyaltyPointSchema.index({ transactionType: 1 });
loyaltyPointSchema.index({ status: 1 });
loyaltyPointSchema.index({ transactionId: 1 });
loyaltyPointSchema.index({ balance: 1 });

// Method to check if points are expired
loyaltyPointSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Method to get available points
loyaltyPointSchema.methods.getAvailablePoints = function() {
  if (this.isExpired() || this.status !== 'active') return 0;
  return this.credit - this.debit;
};

module.exports = mongoose.model('LoyaltyPoint', loyaltyPointSchema);
