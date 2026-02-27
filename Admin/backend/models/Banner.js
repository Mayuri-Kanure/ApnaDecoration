// Shared Banner Model - Same as Admin backend
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String
  },
  bannerType: {
    type: String,
    enum: ['Main Banner', 'Footer Banner', 'Promo Banner', 'hero', 'promotion', 'announcement', 'category'],
    default: 'Main Banner'
  },
  bannerUrl: {
    type: String
  },
  resourceType: {
    type: String,
    enum: ['product', 'category', 'url']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  published: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
