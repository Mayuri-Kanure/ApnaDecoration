const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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

// Create compound unique index on user and product
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Drop old customer index if exists
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Drop the old customer index on startup
Wishlist.collection.dropIndex('customer_1').catch(() => {
  console.log('Old customer index does not exist or already dropped');
});

module.exports = Wishlist;
