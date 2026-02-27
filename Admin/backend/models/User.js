const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false, // Made optional for Google users
    unique: true,
    sparse: true, // Allow multiple null values
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
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false, // Made optional for Google users
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
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
    enum: ['admin', 'manager', 'staff', 'user', 'vendor', 'delivery'],
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
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
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

module.exports = mongoose.model('User', userSchema);
