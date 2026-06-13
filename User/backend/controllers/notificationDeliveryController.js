const { Notification } = require("../models");

/**
 * Notification Delivery Verification Controller
 * 
 * Handles frontend apps confirming receipt and reading of push notifications
 * Enables delivery tracking and analytics
 */

/**
 * Verify notification delivery
 * Called by frontend when FCM notification arrives on device
 * 
 * POST /api/notifications/verify-delivery
 * Body: { notificationId, deviceStatus, platform }
 */
exports.verifyDelivery = async (req, res) => {
  try {
    const { notificationId, deviceStatus, platform } = req.body;
    const userId = req.user._id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'notificationId is required'
      });
    }

    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: userId // Verify ownership
      },
      {
        deliveryStatus: deviceStatus || 'delivered',
        deliveredAt: new Date(),
        platform: platform || 'unknown'
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    console.log(`✅ Delivery verified for notification ${notificationId}`);
    res.json({
      success: true,
      message: 'Delivery verified successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error verifying delivery:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify delivery'
    });
  }
};

/**
 * Mark notification as read with delivery receipt
 * Called when user opens/reads a notification
 * 
 * PUT /api/notifications/:id/mark-read
 */
exports.markAsReadWithReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId: userId
      },
      {
        isRead: true,
        readAt: new Date(),
        deliveryStatus: 'delivered'
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    console.log(`✅ Notification marked as read: ${id}`);
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark as read'
    });
  }
};

/**
 * Get delivery stats for admin dashboard
 * Shows breakdown of notification delivery status
 * 
 * GET /api/notifications/stats/delivery
 */
exports.getDeliveryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let filter = {};
    
    // Optional date filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const stats = await Notification.getDeliveryStats(filter);

    res.json({
      success: true,
      data: stats,
      summary: {
        deliveryRate: stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(2) + '%' : '0%',
        failureRate: stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(2) + '%' : '0%',
        pendingRate: stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    console.error('Error getting delivery stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stats'
    });
  }
};

/**
 * Report failed notification delivery
 * Called by frontend when notification fails to arrive
 * 
 * POST /api/notifications/report-failure
 * Body: { notificationId, errorCode, errorMessage }
 */
exports.reportDeliveryFailure = async (req, res) => {
  try {
    const { notificationId, errorCode, errorMessage } = req.body;
    const userId = req.user._id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'notificationId is required'
      });
    }

    const failureReason = `[${errorCode || 'UNKNOWN'}] ${errorMessage || 'Delivery failed on device'}`;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: userId
      },
      {
        deliveryStatus: 'failed',
        failureReason: failureReason,
        deliveryAttempts: (await Notification.findById(notificationId))?.deliveryAttempts + 1 || 1
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    console.warn(`⚠️ Delivery failure reported: ${notificationId} - ${failureReason}`);
    
    res.json({
      success: true,
      message: 'Delivery failure recorded',
      data: notification
    });
  } catch (error) {
    console.error('Error reporting delivery failure:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to report failure'
    });
  }
};

/**
 * Get notifications with delivery status
 * Returns user's notifications with full delivery tracking info
 * 
 * GET /api/notifications/with-status
 */
exports.getNotificationsWithStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 50, skip = 0 } = req.query;

    let query = { userId };
    if (status) {
      query.deliveryStatus = status;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notifications'
    });
  }
};

/**
 * Cleanup expired notifications
 * Called periodically to remove old notifications that failed delivery
 * 
 * POST /api/notifications/cleanup-expired
 */
exports.cleanupExpiredNotifications = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete notifications that are failed and older than 30 days
    const result = await Notification.deleteMany({
      deliveryStatus: 'failed',
      createdAt: { $lt: thirtyDaysAgo }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} expired failed notifications`);

    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} expired notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cleanup notifications'
    });
  }
};
