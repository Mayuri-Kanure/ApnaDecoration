import apiService from './api';

const notificationService = {
  // Get all user notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await apiService.getNotifications(params);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    try {
      const response = await apiService.get('/notifications/unread');
      return response;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (id) => {
    try {
      const response = await apiService.markNotificationAsRead(id);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const response = await apiService.deleteNotification(id);
      return response;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    try {
      const response = await apiService.delete('/notifications/clear-all');
      return response;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const response = await apiService.get('/notifications/settings');
      return response;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const response = await apiService.put('/notifications/settings', settings);
      return response;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  // Subscribe to push notifications
  subscribeToPushNotifications: async (subscriptionData) => {
    try {
      const response = await apiService.post('/notifications/subscribe-push', subscriptionData);
      return response;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  },

  // Unsubscribe from push notifications
  unsubscribeFromPushNotifications: async () => {
    try {
      const response = await apiService.post('/notifications/unsubscribe-push');
      return response;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  },

  // Send notification (admin only)
  sendNotification: async (notificationData) => {
    try {
      const response = await apiService.post('/notifications/send', notificationData);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Send bulk notifications (admin only)
  sendBulkNotifications: async (bulkNotificationData) => {
    try {
      const response = await apiService.post('/notifications/send-bulk', bulkNotificationData);
      return response;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  },

  // Get notification count
  getNotificationCount: async () => {
    try {
      const response = await apiService.get('/notifications/count');
      return response;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      throw error;
    }
  },

  // Get notification by ID
  getNotification: async (id) => {
    try {
      const response = await apiService.get(`/notifications/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  // Archive notification
  archiveNotification: async (id) => {
    try {
      const response = await apiService.put(`/notifications/${id}/archive`);
      return response;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  },

  // Get archived notifications
  getArchivedNotifications: async () => {
    try {
      const response = await apiService.get('/notifications/archived');
      return response;
    } catch (error) {
      console.error('Error fetching archived notifications:', error);
      throw error;
    }
  },

  // Restore archived notification
  restoreNotification: async (id) => {
    try {
      const response = await apiService.put(`/notifications/${id}/restore`);
      return response;
    } catch (error) {
      console.error('Error restoring notification:', error);
      throw error;
    }
  },

  // Get notification types
  getNotificationTypes: async () => {
    try {
      const response = await apiService.get('/notifications/types');
      return response;
    } catch (error) {
      console.error('Error fetching notification types:', error);
      throw error;
    }
  },
};

export default notificationService;
