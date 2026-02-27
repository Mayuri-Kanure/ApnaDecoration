const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    default: '+1'
  },
  address: {
    type: String,
    required: true
  },
  identityType: {
    type: String,
    enum: ['passport', 'driving_license', 'national_id', 'other'],
    default: 'passport'
  },
  identityNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  deliverymanImage: {
    type: String,
    required: true
  },
  identityImage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  successfulDeliveries: {
    type: Number,
    default: 0
  },
  failedDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate delivery ID before saving
deliverySchema.pre('save', async function(next) {
  if (!this.deliveryId) {
    const count = await this.constructor.countDocuments();
    this.deliveryId = `DL-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better performance
deliverySchema.index({ deliveryId: 1 });
// Email index is already defined as unique in the schema field
deliverySchema.index({ phone: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ isAvailable: 1 });

// Method to update delivery statistics
deliverySchema.methods.updateStats = function(successful) {
  this.totalDeliveries += 1;
  if (successful) {
    this.successfulDeliveries += 1;
  } else {
    this.failedDeliveries += 1;
  }
  this.lastActive = new Date();
  return this.save();
};

// Method to update rating
deliverySchema.methods.updateRating = function(newRating) {
  const totalRatingPoints = this.rating * this.totalRatings;
  this.totalRatings += 1;
  this.rating = (totalRatingPoints + newRating) / this.totalRatings;
  return this.save();
};

// Method to check if delivery man is available
deliverySchema.methods.isCurrentlyAvailable = function() {
  return this.status === 'active' && this.isAvailable;
};

module.exports = mongoose.model('DeliveryMan', deliverySchema, 'deliverymen');
