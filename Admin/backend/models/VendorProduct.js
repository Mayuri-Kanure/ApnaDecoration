const mongoose = require('mongoose');

const vendorProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  images: [{
    type: String
  }],
  thumbnail: {
    type: String
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deniedAt: {
    type: Date
  },
  deniedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  denialReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VendorProduct', vendorProductSchema);
