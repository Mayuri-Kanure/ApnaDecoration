const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all notifications (protected)
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark notification as read (protected)
router.put('/:id/read', authMiddleware, notificationController.markNotificationAsRead);

// Mark all notifications as read (protected)
router.put('/read-all', authMiddleware, notificationController.markAllNotificationsAsRead);

// Delete notification (protected)
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// Get notification settings (protected)
router.get('/settings', authMiddleware, notificationController.getNotificationSettings);

// Update notification settings (protected)
router.put('/settings', authMiddleware, notificationController.updateNotificationSettings);

// Debug route to test if routes are loaded
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Notification routes are working!',
    timestamp: new Date().toISOString()
  });
});

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
