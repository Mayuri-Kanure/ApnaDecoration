const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'],
    required: true
  },
  brand: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  last4: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  expiryMonth: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  expiryYear: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  cardholderName: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  upiId: {
    type: String,
    required: function() {
      return this.type === 'upi';
    }
  },
  provider: {
    type: String,
    required: function() {
      return this.type === 'upi';
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
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
});

// Update the updatedAt field on save - DISABLED TEMPORARILY
// paymentMethodSchema.pre('save', function(next, options) {
//   this.updatedAt = new Date();
//   next();
// });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
