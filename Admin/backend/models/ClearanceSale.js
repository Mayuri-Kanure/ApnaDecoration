const mongoose = require('mongoose');

const clearanceSaleSchema = new mongoose.Schema({
  // Inhouse Offer Settings
  inhouseOffer: {
    isActive: {
      type: Boolean,
      default: false
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage', 'product'],
      default: 'flat'
    },
    discountAmount: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    description: {
      type: String,
      default: ''
    }
  },
  
  // Vendor Offers
  vendorOffers: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vendorName: {
      type: String,
      required: true
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'flat'
    },
    discountAmount: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    },
    description: {
      type: String,
      default: ''
    }
  }],
  
  // Priority Settings
  prioritySettings: {
    useDefaultSorting: {
      type: Boolean,
      default: true
    },
    useCustomSorting: {
      type: Boolean,
      default: false
    },
    customSortOrder: [{
      field: String,
      order: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'desc'
      }
    }]
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClearanceSale', clearanceSaleSchema);
