const mongoose = require('mongoose');

const customerReviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
    unique: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    default: '/api/placeholder/50/50'
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  reply: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  helpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
customerReviewSchema.index({ productId: 1, createdAt: -1 });
customerReviewSchema.index({ customerId: 1, createdAt: -1 });
customerReviewSchema.index({ rating: 1 });
customerReviewSchema.index({ status: 1 });
customerReviewSchema.index({ reviewId: 1 });

module.exports = mongoose.model('CustomerReview', customerReviewSchema);
