const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  businessType: {
    type: String,
    enum: ['individual', 'company'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  documents: {
    panCard: String,
    gstin: String,
    addressProof: String,
    businessProof: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String
  },
  commission: {
    type: Number,
    default: 10 // 10% commission
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ phone: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ businessName: 1 });

// Update the updatedAt field before saving
vendorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
vendorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
vendorSchema.methods.toPublicJSON = function() {
  const vendor = this.toObject();
  delete vendor.password;
  delete vendor.documents;
  delete vendor.bankDetails;
  return vendor;
};

module.exports = mongoose.model('Vendor', vendorSchema);
