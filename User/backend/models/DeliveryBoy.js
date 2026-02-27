const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // Profile Information
  profileImage: {
    type: String,
    required: false
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false
  },
  address: {
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

  // Work Information
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    enum: ['delivery', 'logistics', 'operations'],
    default: 'delivery'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },

  // Performance Metrics
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
  averageDeliveryTime: {
    type: Number,
    default: 0 // in minutes
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  pendingWithdrawals: {
    type: Number,
    default: 0
  },

  // User Settings
  settings: {
    // Notification settings
    pushNotifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    orderNotifications: {
      type: Boolean,
      default: true
    },
    earningsNotifications: {
      type: Boolean,
      default: true
    },
    
    // Privacy settings
    shareLocation: {
      type: Boolean,
      default: true
    },
    showPhone: {
      type: Boolean,
      default: true
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    
    // App settings
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'gu', 'mr', 'ta', 'te', 'kn', 'ml', 'pa', 'bn', 'or', 'as']
    },
    autoAcceptOrders: {
      type: Boolean,
      default: false
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },

  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: String,
    required: false
  },
  currentCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  lastActiveTime: {
    type: Date,
    default: Date.now
  },

  // Vehicle Information
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'van', 'truck', 'car'],
    required: false
  },
  vehicleNumber: {
    type: String,
    required: false
  },
  licenseNumber: {
    type: String,
    required: false
  },
  vehicleDocuments: [{
    documentType: {
      type: String,
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Banking Information
  bankAccount: {
    accountNumber: {
      type: String,
      required: false
    },
    bankName: {
      type: String,
      required: false
    },
    ifscCode: {
      type: String,
      required: false
    },
    accountHolderName: {
      type: String,
      required: false
    }
  },

  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: false
    },
    relationship: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_leave'],
    default: 'active'
  },

  // Permissions
  permissions: {
    canHandleCashOnDelivery: {
      type: Boolean,
      default: false
    },
    canHandleFragileDeliveries: {
      type: Boolean,
      default: false
    },
    canAccessCustomerInfo: {
      type: Boolean,
      default: true
    },
    canUpdateDeliveryStatus: {
      type: Boolean,
      default: true
    }
  },

  // Working Hours
  workingHours: {
    monday: { start: String, end: String, off: Boolean },
    tuesday: { start: String, end: String, off: Boolean },
    wednesday: { start: String, end: String, off: Boolean },
    thursday: { start: String, end: String, off: Boolean },
    friday: { start: String, end: String, off: Boolean },
    saturday: { start: String, end: String, off: Boolean },
    sunday: { start: String, end: String, off: Boolean }
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
deliveryBoySchema.index({ phone: 1 });
deliveryBoySchema.index({ email: 1 });
deliveryBoySchema.index({ employeeId: 1 });
deliveryBoySchema.index({ status: 1 });
deliveryBoySchema.index({ isAvailable: 1 });
deliveryBoySchema.index({ createdAt: -1 });

// Pre-save middleware to update last active time
deliveryBoySchema.pre('save', function(next) {
  if (this.isModified('isAvailable') || this.isModified('currentLocation')) {
    this.lastActiveTime = new Date();
  }
  next();
});

// Instance method to check if delivery boy is working
deliveryBoySchema.methods.isWorking = function() {
  const now = new Date();
  const currentDay = now.getDay();
  const workingHours = this.workingHours;
  
  if (!this.isAvailable || this.status !== 'active') {
    return false;
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[currentDay];
  
  if (workingHours[currentDayName]?.off) {
    return false;
  }

  const workingHour = workingHours[currentDayName];
  if (!workingHour || !workingHour.start || !workingHour.end) {
    return true; // Default to available if no hours set
  }

  const currentTime = now.toTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const startTime = workingHour.start;
  const endTime = workingHour.end;

  return currentTime >= startTime && currentTime <= endTime;
};

// Instance method to update performance metrics
deliveryBoySchema.methods.updatePerformanceMetrics = function(deliveryStatus, deliveryTime = null) {
  this.totalDeliveries += 1;
  
  if (deliveryStatus === 'delivered') {
    this.successfulDeliveries += 1;
    if (deliveryTime) {
      const currentAvg = this.averageDeliveryTime || 0;
      this.averageDeliveryTime = ((currentAvg * (this.successfulDeliveries - 1)) + deliveryTime) / this.successfulDeliveries;
    }
  } else if (deliveryStatus === 'failed') {
    this.failedDeliveries += 1;
  }

  this.updatedAt = new Date();
  return this.save();
};

// Instance method to add rating
deliveryBoySchema.methods.addRating = function(rating) {
  const currentTotal = this.totalRatings || 0;
  const currentAvg = this.rating || 5;
  
  const newTotal = currentTotal + 1;
  const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;
  
  this.totalRatings = newTotal;
  this.rating = newAvg;
  this.updatedAt = new Date();
  
  return this.save();
};

// Static method to get available delivery boys
deliveryBoySchema.statics.getAvailableDeliveryBoys = function() {
  return this.find({
    status: 'active',
    isAvailable: true
  }).sort({ lastActiveTime: -1 });
};

// Static method to get delivery boys by location
deliveryBoySchema.statics.getDeliveryBoysByLocation = function(latitude, longitude, radius = 5) {
  return this.find({
    status: 'active',
    'currentCoordinates.latitude': {
      $gte: latitude - radius,
      $lte: latitude + radius
    },
    'currentCoordinates.longitude': {
      $gte: longitude - radius,
      $lte: longitude + radius
    }
  }).sort({ lastActiveTime: -1 });
};

// Static method to get delivery statistics
deliveryBoySchema.statics.getDeliveryBoyStatistics = function(startDate, endDate) {
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
        totalDeliveryBoys: { $sum: 1 },
        activeDeliveryBoys: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        availableDeliveryBoys: {
          $sum: { $cond: [{ $eq: ['$status', 'active'], $eq: ['$isAvailable', true] }, 1, 0] }
        },
        totalDeliveries: { $sum: '$totalDeliveries' },
        successfulDeliveries: { $sum: '$successfulDeliveries' },
        failedDeliveries: { $sum: '$failedDeliveries' },
        averageRating: { $avg: '$rating' },
        averageDeliveryTime: { $avg: '$averageDeliveryTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
