const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true
  },
  shopName: {
    type: String,
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  businessType: {
    type: String,
    enum: ['individual', 'company'],
    default: 'individual'
  },
  gstNumber: String,
  panNumber: String,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  commissionRate: {
    type: Number,
    default: 10 // 10% commission
  },
  documents: {
    gstCertificate: String,
    panCard: String,
    bankStatement: String,
    addressProof: String
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate vendor ID before saving
vendorSchema.pre('save', async function(next) {
  if (!this.vendorId) {
    const count = await this.constructor.countDocuments();
    this.vendorId = `VEN-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better performance
vendorSchema.index({ vendorId: 1 });
// Email index is already defined as unique in the schema field
vendorSchema.index({ status: 1 });
vendorSchema.index({ verificationStatus: 1 });
vendorSchema.index({ shopName: 1 });

// Method to check if vendor is verified
vendorSchema.methods.isVerified = function() {
  return this.verificationStatus === 'verified';
};

// Method to check if vendor is active
vendorSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Method to get vendor statistics
vendorSchema.methods.getStats = function() {
  return {
    totalProducts: this.totalProducts,
    totalOrders: this.totalOrders,
    totalRevenue: this.totalRevenue,
    rating: this.rating,
    commissionRate: this.commissionRate
  };
};

module.exports = mongoose.model('Vendor', vendorSchema);
