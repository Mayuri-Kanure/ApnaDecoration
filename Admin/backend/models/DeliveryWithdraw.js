const mongoose = require('mongoose');

const deliveryWithdrawSchema = new mongoose.Schema({
  withdrawId: {
    type: String,
    required: true,
    unique: true
  },
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    required: true
  },
  deliveryName: {
    type: String,
    required: true
  },
  deliveryEmail: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  withdrawMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'paypal', 'paytm', 'phonepe', 'cash'],
    required: true
  },
  methodDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String,
    paypalEmail: String,
    paytmNumber: String,
    phonepeNumber: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  transactionId: String,
  processingFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  notes: String,
  documents: [{
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate withdraw ID before saving
deliveryWithdrawSchema.pre('save', async function(next) {
  if (!this.withdrawId) {
    const count = await this.constructor.countDocuments();
    this.withdrawId = `DW-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Calculate net amount if processing fee is set
  if (this.processingFee && this.amount) {
    this.netAmount = this.amount - this.processingFee;
  }
  
  next();
});

// Indexes for better performance
deliveryWithdrawSchema.index({ withdrawId: 1 });
deliveryWithdrawSchema.index({ deliveryId: 1 });
deliveryWithdrawSchema.index({ status: 1 });
deliveryWithdrawSchema.index({ requestedAt: -1 });
deliveryWithdrawSchema.index({ withdrawMethod: 1 });

// Method to approve withdraw
deliveryWithdrawSchema.methods.approve = function(approvedBy, transactionId) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.processedAt = new Date();
  this.transactionId = transactionId;
  return this.save();
};

// Method to reject withdraw
deliveryWithdrawSchema.methods.reject = function(rejectedBy, reason) {
  this.status = 'rejected';
  this.rejectedBy = rejectedBy;
  this.processedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Method to complete withdraw
deliveryWithdrawSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to check if withdraw can be processed
deliveryWithdrawSchema.methods.canBeProcessed = function() {
  return this.status === 'approved';
};

module.exports = mongoose.model('DeliveryWithdraw', deliveryWithdrawSchema);
