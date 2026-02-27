const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// GET all notifications for user
router.get('/', auth, notificationController.getUserNotifications);

// GET unread notifications count
router.get('/unread-count', auth, notificationController.getUnreadCount);

// MARK notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// MARK all notifications as read for user
router.put('/mark-all-read', auth, notificationController.markAllAsRead);

// CREATE notification (admin only)
router.post('/', auth, notificationController.createNotification);

// BROADCAST notification to all users (admin only) - temporarily disabled auth for testing
router.post('/broadcast', notificationController.broadcastNotification);

// DELETE notification
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
