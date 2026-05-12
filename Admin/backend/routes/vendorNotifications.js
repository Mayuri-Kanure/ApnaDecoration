const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Mock notifications data for vendor
const getMockNotifications = (vendorId) => {
  return [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'You have received a new order for Kids Birthday Party Decoration Kit',
      time: '2 hours ago',
      read: false,
      color: '#28C76F',
      icon: 'order'
    },
    {
      id: 2,
      type: 'product',
      title: 'Product Approved',
      message: 'Your product Kids Birthday Party Decoration Kit has been approved',
      time: '1 day ago',
      read: false,
      color: '#2F66FF',
      icon: 'inventory'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Processed',
      message: 'Payment of ₹2,499 has been processed for your order',
      time: '2 days ago',
      read: true,
      color: '#10B981',
      icon: 'payment'
    },
    {
      id: 4,
      type: 'review',
      title: 'New Review',
      message: 'Customer left a 5-star review for your product',
      time: '3 days ago',
      read: true,
      color: '#F59E0B',
      icon: 'review'
    },
    {
      id: 5,
      type: 'system',
      title: 'Low Stock Alert',
      message: 'Your product Kids Birthday Party Decoration Kit is running low on stock',
      time: '1 week ago',
      read: true,
      color: '#EA5455',
      icon: 'warning'
    }
  ];
};

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`🔔 Vendor Notifications Route: ${req.method} ${req.originalUrl}`);
  console.log('User from auth:', req.user?.id, req.user?.email);
  next();
});

// GET vendor notifications
router.get('/', auth, async (req, res) => {
  try {
    console.log('📬 Fetching vendor notifications for user:', req.user?.id);
    
    const notifications = getMockNotifications(req.user?.id);
    
    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      notifications: notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('❌ Error fetching vendor notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📖 Marking notification ${id} as read for user:`, req.user?.id);
    
    // In real implementation, update notification in database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    console.log('📖 Marking all notifications as read for user:', req.user?.id);
    
    // In real implementation, update all notifications for this user
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting notification ${id} for user:`, req.user?.id);
    
    // In real implementation, delete notification from database
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

module.exports = router;
