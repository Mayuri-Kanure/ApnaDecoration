const { Notification } = require('../models');

const notificationController = {
  // Get all notifications
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to last 50 notifications
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { isRead: true, updatedAt: new Date() },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (req, res) => {
    try {
      await Notification.updateMany(
        { userId: req.user.userId, isRead: false },
        { isRead: true, updatedAt: new Date() }
      );
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read'
      });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOneAndDelete({ 
        _id: id, 
        userId: req.user.userId 
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
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
        error: 'Failed to delete notification'
      });
    }
  },

  // Get notification settings
  getNotificationSettings: async (req, res) => {
    try {
      // For now, return default settings
      // In a real app, this would be stored in User model
      const defaultSettings = {
        email: true,
        sms: false,
        push: false
      };
      
      res.json({
        success: true,
        data: defaultSettings
      });
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notification settings'
      });
    }
  },

  // Update notification settings
  updateNotificationSettings: async (req, res) => {
    try {
      const { email, sms, push } = req.body;
      
      // For now, just return success
      // In a real app, this would update User model
      const updatedSettings = {
        email: email !== undefined ? email : true,
        sms: sms !== undefined ? sms : false,
        push: push !== undefined ? push : false
      };
      
      console.log('🔔 Notification settings updated:', updatedSettings);
      
      res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification settings'
      });
    }
  }
};

module.exports = notificationController;
