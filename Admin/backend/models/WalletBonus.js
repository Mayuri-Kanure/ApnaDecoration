const mongoose = require('mongoose');

const walletBonusSchema = new mongoose.Schema({
  bonusId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  bonusType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  bonusAmount: {
    type: Number,
    required: true
  },
  minAddAmount: {
    type: Number,
    required: true
  },
  maxBonus: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: null // null for unlimited
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
walletBonusSchema.index({ status: 1, startDate: 1, endDate: 1 });
walletBonusSchema.index({ bonusId: 1 });
walletBonusSchema.index({ createdBy: 1 });

// Method to check if bonus is currently active
walletBonusSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
};

// Method to check if bonus can be used
walletBonusSchema.methods.canBeUsed = function() {
  if (!this.isActive()) return false;
  if (this.maxUsage && this.usageCount >= this.maxUsage) return false;
  return true;
};

module.exports = mongoose.model('WalletBonus', walletBonusSchema);
