const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    serviceType: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    images: {
      type: [String], // Base64 or image URLs
      default: []
    },
    bannerImage: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    },
    availability: {
      type: Boolean,
      default: true
    },
    customizationAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
