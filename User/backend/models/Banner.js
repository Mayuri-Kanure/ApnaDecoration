// Shared Banner Model - Same as Admin backend
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    required: true
  },
  bannerType: {
    type: String,
    enum: ['hero', 'promotion', 'announcement', 'category'],
    default: 'hero'
  },
  bannerUrl: {
    type: String,
  },
  published: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
