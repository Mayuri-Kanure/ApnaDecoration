const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  company: {
    type: String,
    default: ''
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

customerSchema.virtual('displayName').get(function() {
  return this.company || this.fullName;
});

module.exports = mongoose.model('Customer', customerSchema);
