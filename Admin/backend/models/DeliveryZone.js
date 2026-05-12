const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  center: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  radius: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  deliveryBoys: [{
    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryBoy'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  workingHours: {
    start: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Start time must be in HH:MM format'
      }
    },
    end: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format'
      }
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    }]
  },
  restrictions: {
    maxOrdersPerBoy: {
      type: Number,
      default: 10
    },
    maxDistance: {
      type: Number,
      default: 15
    },
    weatherRestrictions: [{
      type: String,
      enum: ['rain', 'snow', 'heat', 'fog', 'storm']
    }]
  }
}, {
  timestamps: true
});

// Indexes for performance
deliveryZoneSchema.index({ code: 1 });
deliveryZoneSchema.index({ isActive: 1 });
deliveryZoneSchema.index({ priority: 1 });
deliveryZoneSchema.index({ boundaries: '2dsphere' });
deliveryZoneSchema.index({ center: '2dsphere' });

// Static method to find zones by location
deliveryZoneSchema.statics.findZonesByLocation = function(longitude, latitude) {
  return this.find({
    isActive: true,
    boundaries: {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }
    }
  }).sort({ priority: 1 });
};

// Method to add delivery boy to zone
deliveryZoneSchema.methods.addDeliveryBoy = function(deliveryBoyId) {
  this.deliveryBoys.push({
    deliveryBoyId,
    assignedDate: new Date(),
    isActive: true
  });
  return this.save();
};

// Method to remove delivery boy from zone
deliveryZoneSchema.methods.removeDeliveryBoy = function(deliveryBoyId) {
  this.deliveryBoys = this.deliveryBoys.filter(
    boy => boy.deliveryBoyId.toString() !== deliveryBoyId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
