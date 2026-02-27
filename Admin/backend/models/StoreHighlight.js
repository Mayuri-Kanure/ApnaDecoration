const mongoose = require('mongoose');

const storeHighlightSchema = new mongoose.Schema({
  featureType: {
    type: String,
    required: true,
    enum: ['delivery', 'payment', 'return', 'authentic'],
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  icon: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get default titles
storeHighlightSchema.statics.getDefaultTitles = function() {
  return {
    delivery: 'Fast Delivery all across the country',
    payment: 'Safe Payment Gateway',
    return: 'Easy Return Policy',
    authentic: '100% Authentic Products'
  };
};

// Static method to get descriptions
storeHighlightSchema.statics.getDescriptions = function() {
  return {
    delivery: 'Enable/disable delivery information display on customer pages',
    payment: 'Show/hide secure payment badges and information',
    return: 'Display return policy details to customers',
    authentic: 'Show authenticity guarantees to customers'
  };
};

module.exports = mongoose.model('StoreHighlight', storeHighlightSchema);
