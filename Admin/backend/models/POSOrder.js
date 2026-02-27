const mongoose = require('mongoose');

const posOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: String,
    default: 'Walking Customer'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  productDiscount: {
    type: Number,
    default: 0
  },
  extraDiscount: {
    type: Number,
    default: 0
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    required: true
  },
  paidAmount: {
    type: Number,
    required: true
  },
  changeAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['completed', 'held', 'cancelled'],
    default: 'completed'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('POSOrder', posOrderSchema);
