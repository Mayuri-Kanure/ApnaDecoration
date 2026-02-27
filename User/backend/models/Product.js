const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Unified fields for both Admin and User
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Admin compatibility field
  product_name_en: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Admin compatibility field
  description_en: {
    type: String
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
  // Admin compatibility field
  category_id: {
    type: String
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  // Admin specific fields
  product_type: {
    type: String,
    default: 'general'
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: {
    type: Number,
    default: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual to ensure name field is populated from product_name_en if needed
productSchema.pre('save', function(next) {
  if (!this.name && this.product_name_en) {
    this.name = this.product_name_en;
  }
  if (!this.description && this.description_en) {
    this.description = this.description_en;
  }
  if (!this.sku) {
    this.sku = 'PRD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text', product_name_en: 'text', description_en: 'text' });

module.exports = mongoose.model('Product', productSchema);
