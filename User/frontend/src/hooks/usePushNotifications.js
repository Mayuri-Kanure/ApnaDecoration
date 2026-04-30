import { useState, useEffect, useCallback } from 'react';
import pushNotificationService from '../services/pushNotificationService';

export const usePushNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [deviceToken, setDeviceToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize push notifications
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await pushNotificationService.initialize();
      
      if (success) {
        setIsInitialized(true);
        setDeviceToken(pushNotificationService.getDeviceToken());
        
        // Get permission status
        const status = await pushNotificationService.getPermissionStatus();
        setPermissionStatus(status.receive);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to topic
  const subscribeToTopic = useCallback(async (topic) => {
    try {
      setError(null);
      
      if (!isInitialized) {
        throw new Error('Push notifications not initialized');
      }

      const result = await pushNotificationService.subscribeToTopic(topic);
      return result;
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
      setError(error.message);
      throw error;
    }
  }, [isInitialized]);

  // Unsubscribe from topic
  const unsubscribeFromTopic = useCallback(async (topic) => {
    try {
      setError(null);
      
      if (!isInitialized) {
        throw new Error('Push notifications not initialized');
      }

      const result = await pushNotificationService.unsubscribeFromTopic(topic);
      return result;
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      setError(error.message);
      throw error;
    }
  }, [isInitialized]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    try {
      setError(null);
      
      if (!isInitialized) {
        throw new Error('Push notifications not initialized');
      }

      const result = await pushNotificationService.sendTestNotification();
      return result;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      setError(error.message);
      throw error;
    }
  }, [isInitialized]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      setError(null);
      
      const result = await pushNotificationService.clearAllNotifications();
      setNotifications([]);
      return result;
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Get permission status
  const getPermissionStatus = useCallback(async () => {
    try {
      const status = await pushNotificationService.getPermissionStatus();
      setPermissionStatus(status.receive);
      return status;
    } catch (error) {
      console.error('❌ Error getting permission status:', error);
      setError(error.message);
      return { receive: 'denied', send: 'denied' };
    }
  }, []);

  // Setup notification listeners
  useEffect(() => {
    // Listen for push notifications
    const handlePushNotification = (event) => {
      console.log('📱 Push notification received in hook:', event.detail);
      
      const notification = {
        id: Date.now(),
        ...event.detail,
        read: false,
        timestamp: new Date()
      };
      
      setNotifications(prev => [notification, ...prev]);
    };

    // Listen for notification actions
    const handleNotificationAction = (event) => {
      console.log('📱 Push notification action in hook:', event.detail);
      
      // Handle different actions
      const { actionId, notification: notificationData } = event.detail;
      
      if (actionId === 'view_order') {
        // Navigate to order details
        window.location.href = `/orders/${notificationData.data.orderId}`;
      } else if (actionId === 'view_product') {
        // Navigate to product details
        window.location.href = `/products/${notificationData.data.productId}`;
      } else if (actionId === 'view_cart') {
        // Navigate to cart
        window.location.href = '/cart';
      }
    };

    window.addEventListener('pushNotificationReceived', handlePushNotification);
    window.addEventListener('pushNotificationActionPerformed', handleNotificationAction);

    return () => {
      window.removeEventListener('pushNotificationReceived', handlePushNotification);
      window.removeEventListener('pushNotificationActionPerformed', handleNotificationAction);
    };
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    isInitialized,
    permissionStatus,
    deviceToken,
    notifications,
    isLoading,
    error,
    unreadCount,

    // Methods
    initialize,
    subscribeToTopic,
    unsubscribeFromTopic,
    sendTestNotification,
    clearAllNotifications,
    getPermissionStatus,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications
  };
};
