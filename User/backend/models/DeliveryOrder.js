const mongoose = require('mongoose');

const deliveryOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy'
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  vendorPhone: {
    type: String,
    required: true
  },
  vendorAddress: {
    type: String,
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pinCode: String,
    country: { type: String, default: 'India' }
  },
  pickupAddress: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  orderAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  estimatedTime: {
    type: String,
    required: true
  },
  actualDeliveryTime: {
    type: String
  },
  deliveryInstructions: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'rejected', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'wallet'],
    default: 'online'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  assignedDate: {
    type: Date
  },
  acceptedDate: {
    type: Date
  },
  pickedUpDate: {
    type: Date
  },
  deliveredDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  deliveryBoyLocation: {
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
  customerLocation: {
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
  vendorLocation: {
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
  tracking: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: String,
    location: {
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
    note: String
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  },
  customerFeedback: {
    type: String
  },
  deliveryBoyEarnings: {
    type: Number,
    default: 0
  },
  vendorEarnings: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  notes: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'noteModel'
    },
    noteModel: {
      type: String,
      enum: ['User', 'Vendor', 'DeliveryBoy']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate order ID before saving
deliveryOrderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await this.constructor.countDocuments();
    this.orderId = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Method to update order status
deliveryOrderSchema.methods.updateStatus = function(status, location, note) {
  this.status = status;
  
  // Update timestamps based on status
  switch (status) {
    case 'assigned':
      this.assignedDate = new Date();
      break;
    case 'accepted':
      this.acceptedDate = new Date();
      break;
    case 'picked_up':
      this.pickedUpDate = new Date();
      break;
    case 'delivered':
      this.deliveredDate = new Date();
      this.completedDate = new Date();
      break;
    case 'cancelled':
    case 'failed':
      this.completedDate = new Date();
      break;
  }

  // Add tracking entry
  this.tracking.push({
    timestamp: new Date(),
    status,
    location: location || this.deliveryBoyLocation,
    note
  });

  return this.save();
};

// Method to calculate earnings
deliveryOrderSchema.methods.calculateEarnings = function() {
  // Calculate delivery boy earnings (70% of delivery fee)
  this.deliveryBoyEarnings = this.deliveryFee * 0.7;
  
  // Calculate vendor earnings (order amount minus platform fee)
  this.platformFee = this.orderAmount * 0.05; // 5% platform fee
  this.vendorEarnings = this.orderAmount - this.platformFee;
  
  return this.save();
};

// Indexes for better performance
deliveryOrderSchema.index({ orderId: 1 });
deliveryOrderSchema.index({ customerId: 1 });
deliveryOrderSchema.index({ vendorId: 1 });
deliveryOrderSchema.index({ deliveryBoyId: 1 });
deliveryOrderSchema.index({ status: 1 });
deliveryOrderSchema.index({ priority: 1 });
deliveryOrderSchema.index({ orderDate: 1 });
deliveryOrderSchema.index({ deliveryBoyLocation: '2dsphere' });
deliveryOrderSchema.index({ customerLocation: '2dsphere' });
deliveryOrderSchema.index({ vendorLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryOrder', deliveryOrderSchema);
