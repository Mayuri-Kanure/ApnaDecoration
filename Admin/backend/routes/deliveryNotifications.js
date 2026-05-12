const express = require('express');
const router = express.Router();
const DeliveryNotification = require('../models/DeliveryNotification');
const DeliveryBoy = require('../models/DeliveryBoy');
const auth = require('../middleware/deliveryAuth');
const { body, validationResult } = require('express-validator');

// Get notifications for delivery boy
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      recipientId: req.deliveryBoy.id,
      recipientType: 'DeliveryBoy',
      expiresAt: { $gt: new Date() }
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await DeliveryNotification.find(query)
      .populate('data.deliveryOrderId', 'orderId customerName totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryNotification.countDocuments(query);
    const unreadCount = await DeliveryNotification.countDocuments({
      ...query,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await DeliveryNotification.findOne({
      _id: notificationId,
      recipientId: req.deliveryBoy.id,
      recipientType: 'DeliveryBoy'
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await DeliveryNotification.updateMany(
      {
        recipientId: req.deliveryBoy.id,
        recipientType: 'DeliveryBoy',
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await DeliveryNotification.findOneAndDelete({
      _id: notificationId,
      recipientId: req.deliveryBoy.id,
      recipientType: 'DeliveryBoy'
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await DeliveryNotification.countDocuments({
      recipientId: req.deliveryBoy.id,
      recipientType: 'DeliveryBoy',
      isRead: false,
      expiresAt: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create notification (for system/internal use)
router.post('/', [
  body('recipientId').isMongoId(),
  body('recipientType').isIn(['DeliveryBoy', 'Customer', 'Admin']),
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('message').trim().isLength({ min: 1, max: 500 }),
  body('type').isIn(['new_order', 'order_assigned', 'order_accepted', 'order_picked_up', 'in_transit', 'delivered', 'cancelled', 'failed', 'payment_collected', 'earning_updated', 'system_alert', 'emergency']),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { recipientId, recipientType, title, message, type, priority, data } = req.body;

    const notification = new DeliveryNotification({
      recipientId,
      recipientType,
      title,
      message,
      type,
      priority: priority || 'normal',
      data: data || {}
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Cleanup expired notifications (system endpoint)
router.delete('/cleanup/expired', async (req, res) => {
  try {
    const result = await DeliveryNotification.cleanupExpired();
    
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} expired notifications`
    });
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
