const mongoose = require('mongoose');

const deliveryTrackingSchema = new mongoose.Schema({
  deliveryOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryOrder',
    required: true
  },
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy',
    required: true
  },
  locations: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    coordinates: {
      type: [Number],
      required: true
    },
    accuracy: {
      type: Number,
      default: 10
    },
    speed: {
      type: Number,
      default: 0
    },
    heading: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'],
    default: 'pending'
  },
  estimatedArrival: {
    type: Date
  },
  actualArrival: {
    type: Date
  },
  distanceRemaining: {
    type: Number,
    default: 0
  },
  durationRemaining: {
    type: Number,
    default: 0
  },
  route: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
deliveryTrackingSchema.index({ deliveryOrderId: 1 });
deliveryTrackingSchema.index({ deliveryBoyId: 1 });
deliveryTrackingSchema.index({ 'locations.timestamp': -1 });
deliveryTrackingSchema.index({ isActive: 1 });

// Static method to get active tracking for delivery boy
deliveryTrackingSchema.statics.getActiveTracking = function(deliveryBoyId) {
  return this.findOne({ 
    deliveryBoyId, 
    isActive: true 
  }).populate('deliveryOrderId');
};

// Method to add location update
deliveryTrackingSchema.methods.addLocationUpdate = function(coordinates, accuracy, speed, heading) {
  this.locations.push({
    timestamp: new Date(),
    coordinates,
    accuracy: accuracy || 10,
    speed: speed || 0,
    heading: heading || 0
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update ETA
deliveryTrackingSchema.methods.updateETA = function(estimatedArrival, distanceRemaining, durationRemaining) {
  this.estimatedArrival = estimatedArrival;
  this.distanceRemaining = distanceRemaining;
  this.durationRemaining = durationRemaining;
  return this.save();
};

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);
