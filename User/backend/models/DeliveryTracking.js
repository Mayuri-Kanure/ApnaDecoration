const mongoose = require('mongoose');

const deliveryTrackingSchema = new mongoose.Schema({
  // Order information
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Delivery boy information
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy',
    required: false
  },

  // Tracking information
  trackingNumber: {
    type: String,
    required: true
  },

  // Current status
  currentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },

  // Estimated delivery time
  estimatedDeliveryTime: {
    type: Date,
    required: false
  },

  // Actual delivery time
  actualDeliveryTime: {
    type: Date,
    required: false
  },

  // Delivery address
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },

  // Tracking history
  trackingHistory: [{
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      required: false
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    description: {
      type: String,
      required: false
    },
    updatedBy: {
      type: String,
      required: false // 'system', 'delivery_boy', 'admin'
    }
  }],

  // Delivery instructions
  deliveryInstructions: {
    type: String,
    required: false
  },

  // Contact information
  contactPhone: {
    type: String,
    required: true
  },

  contactEmail: {
    type: String,
    required: false
  },

  // Package information
  packageInfo: {
    weight: { type: Number, required: false }, // in kg
    dimensions: {
      length: { type: Number }, // in cm
      width: { type: Number }, // in cm
      height: { type: Number } // in cm
    },
    description: { type: String, required: false }
  },

  // Delivery fees
  deliveryFee: {
    type: Number,
    required: false,
    default: 0
  },

  // Delivery priority
  priority: {
    type: String,
    enum: ['standard', 'express', 'urgent'],
    default: 'standard'
  },

  // Notes
  notes: {
    type: String,
    required: false
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
deliveryTrackingSchema.index({ orderId: 1, createdAt: -1 });
deliveryTrackingSchema.index({ customerId: 1, createdAt: -1 });
deliveryTrackingSchema.index({ deliveryBoyId: 1, createdAt: -1 });
deliveryTrackingSchema.index({ currentStatus: 1, createdAt: -1 });
deliveryTrackingSchema.index({ trackingNumber: 1 }, { unique: true });

// Pre-save middleware to update tracking history
deliveryTrackingSchema.pre('save', function(next) {
  if (this.isModified('currentStatus')) {
    // Add current status to tracking history
    this.trackingHistory.push({
      status: this.currentStatus,
      timestamp: new Date(),
      description: this.getStatusDescription(this.currentStatus),
      updatedBy: 'system'
    });
  }
  next();
});

// Instance method to get status description
deliveryTrackingSchema.methods.getStatusDescription = function(status) {
  const descriptions = {
    'pending': 'Order received and pending confirmation',
    'confirmed': 'Order confirmed and being prepared for delivery',
    'picked_up': 'Package picked up by delivery partner',
    'in_transit': 'Package is in transit to delivery location',
    'out_for_delivery': 'Package is out for delivery today',
    'delivered': 'Package successfully delivered',
    'failed': 'Delivery attempt failed, will retry',
    'returned': 'Package returned to sender'
  };
  
  return descriptions[status] || status;
};

// Instance method to add tracking update
deliveryTrackingSchema.methods.addTrackingUpdate = function(status, location, description, updatedBy = 'system') {
  this.trackingHistory.push({
    status,
    timestamp: new Date(),
    location,
    description: description || this.getStatusDescription(status),
    updatedBy
  });
  
  this.currentStatus = status;
  this.updatedAt = new Date();
  
  // Set actual delivery time when delivered
  if (status === 'delivered') {
    this.actualDeliveryTime = new Date();
  }
  
  return this.save();
};

// Static method to get delivery statistics
deliveryTrackingSchema.statics.getDeliveryStatistics = function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.createdAt.$lte = new Date(endDate);
    }
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'pending'] }, 1, 0] }
        },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'confirmed'] }, 1, 0] }
        },
        pickedUpCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'picked_up'] }, 1, 0] }
        },
        inTransitCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'in_transit'] }, 1, 0] }
        },
        outForDeliveryCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'out_for_delivery'] }, 1, 0] }
        },
        deliveredCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'delivered'] }, 1, 0] }
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'failed'] }, 1, 0] }
        },
        returnedCount: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'returned'] }, 1, 0] }
        },
        averageDeliveryTime: {
          $avg: {
            $cond: [
              { $eq: ['$currentStatus', 'delivered'] },
              { $subtract: ['$actualDeliveryTime', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);
