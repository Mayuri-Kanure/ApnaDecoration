const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  
  // Profile Image
  profileImage: {
    type: String,
    default: null
  },
  
  // Vehicle Information
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: {
      values: ['motorcycle', 'scooter', 'bicycle', 'car', 'van'],
      message: 'Vehicle type must be one of: motorcycle, scooter, bicycle, car, van'
    }
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true
  },
  drivingLicense: {
    type: String,
    trim: true,
    default: null
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    landmark: { type: String, trim: true, default: '' }
  },
  
  // Bank Details
  bankDetails: {
    bankAccount: {
      type: String,
      required: [true, 'Bank account number is required'],
      trim: true
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
    },
    bankName: {
      type: String,
      trim: true,
      default: ''
    },
    accountHolderName: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Status and Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  availability: {
    type: Boolean,
    default: true
  },
  
  // Location Tracking
  currentLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    lastUpdated: { type: Date, default: null }
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
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    relation: { type: String, trim: true, default: '' }
  },
  
  // Documents
  documents: {
    aadharCard: { type: String, default: null },
    panCard: { type: String, default: null },
    drivingLicense: { type: String, default: null },
    vehicleRC: { type: String, default: null },
    insurance: { type: String, default: null }
  },
  
  // System Fields
  deliveryBoyId: {
    type: String,
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true  // Allows multiple null values
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique delivery boy ID
deliveryBoySchema.pre('save', async function(next) {
  if (!this.deliveryBoyId) {
    try {
      const count = await this.constructor.countDocuments();
      const id = String(count + 1).padStart(5, '0');
      this.deliveryBoyId = `DB${id}`;
      this.employeeId = `EMP${id}`;
    } catch (error) {
      console.error('Error generating deliveryBoyId:', error);
      // Continue without deliveryBoyId if there's an error
    }
  }
  next();
});

// Update the updatedAt field on save
deliveryBoySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full name
deliveryBoySchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for success rate
deliveryBoySchema.virtual('successRate').get(function() {
  if (this.totalDeliveries === 0) return 0;
  return ((this.successfulDeliveries / this.totalDeliveries) * 100).toFixed(2);
});

// Indexes for better performance
deliveryBoySchema.index({ email: 1 });
deliveryBoySchema.index({ phone: 1 });
deliveryBoySchema.index({ deliveryBoyId: 1 });
deliveryBoySchema.index({ employeeId: 1 });
deliveryBoySchema.index({ status: 1 });
deliveryBoySchema.index({ availability: 1 });
deliveryBoySchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
