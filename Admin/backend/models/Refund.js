const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  orderId: {
    type: String,
    required: true,
    trim: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  processedBy: {
    type: String,
    default: ''
  },
  processedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
refundSchema.index({ status: 1 });
refundSchema.index({ orderId: 1 });
refundSchema.index({ requestDate: -1 });

module.exports = mongoose.model('Refund', refundSchema);
