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
    ref: 'Customer',
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

// Generate review ID before saving
customerReviewSchema.pre('save', async function(next) {
  if (!this.reviewId) {
    const count = await this.constructor.countDocuments();
    this.reviewId = `REV-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better performance
customerReviewSchema.index({ productId: 1, createdAt: -1 });
customerReviewSchema.index({ customerId: 1, createdAt: -1 });
customerReviewSchema.index({ rating: 1 });
customerReviewSchema.index({ status: 1 });
customerReviewSchema.index({ reviewId: 1 });

module.exports = mongoose.model('CustomerReview', customerReviewSchema);
