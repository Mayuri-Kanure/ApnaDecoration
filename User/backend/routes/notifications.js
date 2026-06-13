const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');
const notificationDeliveryController = require('../controllers/notificationDeliveryController');
const emailService = require('../services/emailService');

const router = express.Router();

// Debug route to test if routes are loaded
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Notification routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Specific routes (should come before param routes)
// Handle preflight requests for all notification routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600');
  res.sendStatus(200);
});

// Get notification settings (protected)
router.get('/settings', authMiddleware, notificationController.getNotificationSettings);

// Update notification settings (protected)
router.put('/settings', authMiddleware, notificationController.updateNotificationSettings);

// Push device registration (mobile)
router.post('/subscribe-push', authMiddleware, notificationController.subscribeToPush);
router.post('/unsubscribe-push', authMiddleware, notificationController.unsubscribeFromPush);

// Mark all notifications as read (protected) - MUST be before /:id routes
router.put('/read-all', authMiddleware, notificationController.markAllNotificationsAsRead);

// Clear all notifications
router.delete('/clear-all', authMiddleware, async (req, res) => {
  try {
    const { Notification } = require('../models');
    const result = await Notification.deleteMany({ userId: req.user.userId });
    res.json({
      success: true,
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear notifications'
    });
  }
});

// Delivery Verification Routes
// Verify notification delivery from device
router.post('/verify-delivery', authMiddleware, notificationDeliveryController.verifyDelivery);

// Mark notification as read with delivery receipt
router.put('/delivery/:id/mark-read', authMiddleware, notificationDeliveryController.markAsReadWithReceipt);

// Report delivery failure
router.post('/report-failure', authMiddleware, notificationDeliveryController.reportDeliveryFailure);

// Get notifications with delivery status
router.get('/with-status', authMiddleware, notificationDeliveryController.getNotificationsWithStatus);

// Get delivery statistics (admin only)
router.get('/stats/delivery', authMiddleware, notificationDeliveryController.getDeliveryStats);

// Cleanup expired notifications
router.post('/cleanup-expired', authMiddleware, notificationDeliveryController.cleanupExpiredNotifications);


// Parametric routes (should come after specific routes)
// Get all notifications (protected)
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark notification as read (protected)
router.put('/:id/read', authMiddleware, notificationController.markNotificationAsRead);

// Delete notification (protected)
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// Send order confirmation email (protected)
router.post('/send-order-confirmation', authMiddleware, async (req, res) => {
  try {
    const { orderId, customerEmail } = req.body;
    
    if (!orderId || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and customer email are required'
      });
    }

    // Get order details
    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const result = await emailService.sendOrderConfirmation(order, customerEmail);
    
    res.json({
      success: true,
      message: 'Order confirmation email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send order confirmation email'
    });
  }
});

// Send payment confirmation email (protected)
router.post('/send-payment-confirmation', authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;
    
    if (!orderId || !paymentDetails) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and payment details are required'
      });
    }

    // Get order details
    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const result = await emailService.sendPaymentConfirmation(order, paymentDetails);
    
    res.json({
      success: true,
      message: 'Payment confirmation email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send payment confirmation email'
    });
  }
});

// Send order status update email (protected)
router.post('/send-order-status-update', authMiddleware, async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    
    if (!orderId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and new status are required'
      });
    }

    // Get order details
    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const result = await emailService.sendOrderStatusUpdate(order, newStatus);
    
    res.json({
      success: true,
      message: 'Order status update email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending order status update email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send order status update email'
    });
  }
});

// Send welcome email (protected)
router.post('/send-welcome-email', authMiddleware, async (req, res) => {
  try {
    const { user } = req.body;
    
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: 'User with email is required'
      });
    }

    const result = await emailService.sendWelcomeEmail(user);
    
    res.json({
      success: true,
      message: 'Welcome email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send welcome email'
    });
  }
});

module.exports = router;
