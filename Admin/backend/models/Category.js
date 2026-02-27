const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1
  },
  homeCategory: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance (name already indexed by unique: true)
categorySchema.index({ priority: 1 });
categorySchema.index({ status: 1 });

module.exports = mongoose.model('Category', categorySchema);
