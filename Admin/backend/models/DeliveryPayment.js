const mongoose = require('mongoose');

const deliveryPaymentSchema = new mongoose.Schema({
  deliveryOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryOrder',
    required: true
  },
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'wallet', 'upi'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'collected', 'verified', 'settled', 'failed'],
    default: 'pending'
  },
  collectionDate: {
    type: Date
  },
  verificationDate: {
    type: Date
  },
  settlementDate: {
    type: Date
  },
  proofImage: {
    type: String
  },
  customerSignature: {
    type: String
  },
  deliveryPhoto: {
    type: String
  },
  otp: {
    type: String
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  settledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  }
}, {
  timestamps: true
});

// Indexes for performance
deliveryPaymentSchema.index({ deliveryOrderId: 1 });
deliveryPaymentSchema.index({ deliveryBoyId: 1 });
deliveryPaymentSchema.index({ status: 1 });
deliveryPaymentSchema.index({ paymentMethod: 1 });
deliveryPaymentSchema.index({ collectionDate: 1 });

// Method to mark as collected
deliveryPaymentSchema.methods.markAsCollected = function(proofImage, notes) {
  this.status = 'collected';
  this.collectionDate = new Date();
  if (proofImage) this.proofImage = proofImage;
  if (notes) this.notes = notes;
  return this.save();
};

// Method to verify payment
deliveryPaymentSchema.methods.verifyPayment = function(verifiedBy, notes) {
  this.status = 'verified';
  this.verificationDate = new Date();
  this.verifiedBy = verifiedBy;
  if (notes) this.notes = notes;
  return this.save();
};

// Method to settle payment
deliveryPaymentSchema.methods.settlePayment = function(settledBy) {
  this.status = 'settled';
  this.settlementDate = new Date();
  this.settledBy = settledBy;
  return this.save();
};

module.exports = mongoose.model('DeliveryPayment', deliveryPaymentSchema);
