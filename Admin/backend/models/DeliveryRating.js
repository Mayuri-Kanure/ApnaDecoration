const mongoose = require('mongoose');

const deliveryRatingSchema = new mongoose.Schema({
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
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    deliverySpeed: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    behavior: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    serviceQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  review: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    enum: ['on_time', 'professional', 'friendly', 'careful', 'fast', 'communicative', 'rude', 'late', 'damaged']
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  responseFromDeliveryBoy: {
    type: String,
    maxlength: 500
  },
  responseDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
deliveryRatingSchema.index({ deliveryOrderId: 1 });
deliveryRatingSchema.index({ deliveryBoyId: 1 });
deliveryRatingSchema.index({ customerId: 1 });
deliveryRatingSchema.index({ 'rating.overall': -1 });
deliveryRatingSchema.index({ isVerified: 1 });

// Static method to get average rating for delivery boy
deliveryRatingSchema.statics.getAverageRating = async function(deliveryBoyId) {
  const result = await this.aggregate([
    { $match: { deliveryBoyId: new mongoose.Types.ObjectId(deliveryBoyId), isVerified: true } },
    {
      $group: {
        _id: '$deliveryBoyId',
        avgSpeed: { $avg: '$rating.deliverySpeed' },
        avgBehavior: { $avg: '$rating.behavior' },
        avgServiceQuality: { $avg: '$rating.serviceQuality' },
        avgOverall: { $avg: '$rating.overall' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || {
    avgSpeed: 0,
    avgBehavior: 0,
    avgServiceQuality: 0,
    avgOverall: 0,
    totalRatings: 0
  };
};

// Method to add delivery boy response
deliveryRatingSchema.methods.addDeliveryBoyResponse = function(response) {
  this.responseFromDeliveryBoy = response;
  this.responseDate = new Date();
  return this.save();
};

module.exports = mongoose.model('DeliveryRating', deliveryRatingSchema);
