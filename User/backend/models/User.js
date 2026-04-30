const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false, // Made optional for Google users
    trim: true
  },
  name: {
    type: String,
    required: false, // For Google users
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false, // Made optional for Google users
    minlength: 6
  },
  googleId: {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'hybrid'],
    default: 'local'
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'user', 'vendor'],
    default: 'user'
  },
  firstName: {
    type: String,
    required: false // Made optional
  },
  lastName: {
    type: String,
    required: false // Made optional
  },
  phone: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  loginAlerts: {
    type: Boolean,
    default: true
  },
  sessionTimeout: {
    type: Boolean,
    default: true
  },
  passwordStrength: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  lastPasswordChange: {
    type: Date
  },
  // Notification Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    paymentAlerts: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    deliveryNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  // If user doesn't have a password (Google user), return false
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('addresses', {
  ref: 'Address',
  localField: '_id',
  foreignField: 'userId'
});

// Explicit indexes (single source of truth)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);
