const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

// Index for efficient queries
wishlistSchema.index({ customer: 1 });
wishlistSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
