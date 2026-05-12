const mongoose = require('mongoose');

const deliveryNotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['DeliveryBoy', 'Customer', 'Admin']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['new_order', 'order_assigned', 'order_accepted', 'order_picked_up', 'in_transit', 'delivered', 'cancelled', 'failed', 'payment_collected', 'earning_updated', 'system_alert', 'emergency']
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  data: {
    deliveryOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryOrder'
    },
    amount: Number,
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
    eta: Date,
    metadata: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isPushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: {
    type: Date
  },
  isSMSSent: {
    type: Boolean,
    default: false
  },
  smsSentAt: {
    type: Date
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes for performance
deliveryNotificationSchema.index({ recipientId: 1, recipientType: 1 });
deliveryNotificationSchema.index({ isRead: 1 });
deliveryNotificationSchema.index({ type: 1 });
deliveryNotificationSchema.index({ priority: 1 });
deliveryNotificationSchema.index({ createdAt: -1 });
deliveryNotificationSchema.index({ expiresAt: 1 });

// Static method to get unread notifications
deliveryNotificationSchema.statics.getUnreadNotifications = function(recipientId, recipientType) {
  return this.find({
    recipientId,
    recipientType,
    isRead: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Method to mark as read
deliveryNotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark push as sent
deliveryNotificationSchema.methods.markPushSent = function() {
  this.isPushSent = true;
  this.pushSentAt = new Date();
  return this.save();
};

// Static method to cleanup expired notifications
deliveryNotificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('DeliveryNotification', deliveryNotificationSchema);
