const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'shipping', 'promotion', 'product_arrival', 'order_delivered', 'order_processing', 'payment_received'],
    default: 'order'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: 'View Details'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Delivery Verification Fields
  fcmMessageId: {
    type: String,
    default: null,
    index: true,
    description: 'Firebase Cloud Messaging message ID for tracking'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'unread', 'expired'],
    default: 'pending',
    index: true,
    description: 'Current delivery status of the notification'
  },
  deviceToken: {
    type: String,
    default: null,
    description: 'Device token this notification was sent to'
  },
  sentAt: {
    type: Date,
    default: null,
    description: 'Timestamp when notification was sent via FCM'
  },
  deliveredAt: {
    type: Date,
    default: null,
    description: 'Timestamp when device confirmed receipt'
  },
  readAt: {
    type: Date,
    default: null,
    description: 'Timestamp when user read the notification'
  },
  failureReason: {
    type: String,
    default: null,
    description: 'Error message if delivery failed'
  },
  deliveryAttempts: {
    type: Number,
    default: 0,
    description: 'Number of times delivery was attempted'
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3,
    description: 'Number of retry attempts (max 3)'
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'unknown'],
    default: 'unknown',
    description: 'Platform this notification was sent to'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, deliveryStatus: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ fcmMessageId: 1 });
notificationSchema.index({ deliveryStatus: 1, sentAt: 1 });

// Update the updatedAt field on save
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Mark as read and set readAt timestamp
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.deliveryStatus = 'delivered'; // Mark as delivered if read
  return this.save();
};

// Mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.deliveryStatus = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Mark as failed
notificationSchema.methods.markAsFailed = function(reason) {
  this.deliveryStatus = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Static method to get delivery stats for admin
notificationSchema.statics.getDeliveryStats = async function(filter = {}) {
  const stats = await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$deliveryStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    unread: 0,
    expired: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('Notification', notificationSchema);
