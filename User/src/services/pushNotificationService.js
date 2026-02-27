import { Capacitor } from '@capacitor/core';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.notificationListeners = new Map();
    this.isNative = Capacitor.isNativePlatform();
  }

  // Initialize push notifications
  async initialize() {
    try {
      console.log('🔧 Initializing push notifications...');
      
      if (!this.isNative) {
        console.log('⚠️ Not on native platform, using web push notifications');
        return this.initializeWebPush();
      }

      // Dynamically import Capacitor plugins only on native platform
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { Device } = await import('@capacitor/device');
      
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive !== 'granted') {
        console.log('❌ Push notification permission denied');
        throw new Error('Push notification permission denied');
      }

      // Register for push notifications
      await PushNotifications.register();

      // Get device token
      const result = await PushNotifications.addListener('registration', (token) => {
        console.log('✅ Push notification token received:', token);
        this.deviceToken = token.token;
        this.sendTokenToServer(token.token);
      });

      // Handle notification errors
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ Push notification registration error:', error);
      });

      // Handle received notifications
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📱 Push notification received:', notification);
        this.handleReceivedNotification(notification);
      });

      // Handle notification action
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('📱 Push notification action performed:', notification);
        this.handleNotificationAction(notification);
      });

      this.isInitialized = true;
      console.log('✅ Push notifications initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      throw error;
    }
  }

  // Initialize web push notifications
  async initializeWebPush() {
    try {
      console.log('🔧 Initializing web push notifications...');
      
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.log('⚠️ Service workers not supported');
        return false;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('⚠️ Web push notification permission denied');
        return false;
      }

      // Create or update service worker
      const swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service worker registered:', swRegistration.scope);

      this.isInitialized = true;
      console.log('✅ Web push notifications initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing web push notifications:', error);
      return false;
    }
  }

  // Send device token to server
  async sendTokenToServer(token) {
    try {
      console.log('🔧 Sending device token to server:', token);
      
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        console.log('⚠️ No user token found, cannot register device');
        return;
      }

      let deviceInfo = {};
      if (this.isNative) {
        const { Device } = await import('@capacitor/device');
        deviceInfo = await Device.getInfo();
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com'}/api/push-notifications/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          deviceToken: token,
          platform: deviceInfo.platform || 'web',
          platformVersion: deviceInfo.osVersion || 'unknown',
          deviceModel: deviceInfo.model || 'unknown',
          appVersion: deviceInfo.appVersion || '1.0.0',
          userId: this.getUserId()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register device token');
      }

      const result = await response.json();
      console.log('✅ Device token registered successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error sending device token to server:', error);
      throw error;
    }
  }

  // Handle received notification
  handleReceivedNotification(notification) {
    try {
      console.log('🔧 Handling received notification:', notification);
      
      const notificationData = {
        title: notification.title || 'New Notification',
        body: notification.body || 'You have a new notification',
        data: notification.data || {},
        timestamp: new Date().toISOString()
      };

      // Trigger custom event for app to handle
      window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
        detail: notificationData
      }));

      // Show local notification if app is in background
      if (document.hidden) {
        this.showLocalNotification(notificationData);
      }

      // Call registered listeners
      this.notificationListeners.forEach((listener, key) => {
        try {
          listener(notificationData);
        } catch (error) {
          console.error(`❌ Error in notification listener ${key}:`, error);
        }
      });

    } catch (error) {
      console.error('❌ Error handling received notification:', error);
    }
  }

  // Handle notification action
  handleNotificationAction(notification) {
    try {
      console.log('🔧 Handling notification action:', notification);
      
      const actionData = {
        actionId: notification.actionId,
        notification: notification.notification,
        inputValue: notification.inputValue
      };

      // Trigger custom event for app to handle
      window.dispatchEvent(new CustomEvent('pushNotificationActionPerformed', {
        detail: actionData
      }));

      // Call registered listeners
      this.notificationListeners.forEach((listener, key) => {
        try {
          listener({ type: 'action', ...actionData });
        } catch (error) {
          console.error(`❌ Error in notification action listener ${key}:`, error);
        }
      });

    } catch (error) {
      console.error('❌ Error handling notification action:', error);
    }
  }

  // Show local notification
  async showLocalNotification(notification) {
    try {
      console.log('🔧 Showing local notification:', notification);
      
      if (this.isNative) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title: notification.title,
            body: notification.body,
            largeBody: notification.body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            smallIcon: 'ic_notification',
            largeIcon: 'ic_notification_large',
            data: notification.data || {}
          }]
        });
      } else {
        // Web notification
        const webNotification = new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: notification.data || {}
        });

        webNotification.onclick = () => {
          window.focus();
          webNotification.close();
        };
      }

    } catch (error) {
      console.error('❌ Error showing local notification:', error);
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic) {
    try {
      console.log('🔧 Subscribing to topic:', topic);
      
      if (!this.isInitialized) {
        throw new Error('Push notifications not initialized');
      }

      const userToken = localStorage.getItem('token');
      if (!userToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com'}/api/push-notifications/subscribe-to-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          deviceToken: this.deviceToken,
          topic: topic
        })
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to topic');
      }

      const result = await response.json();
      console.log('✅ Subscribed to topic successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
      throw error;
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic) {
    try {
      console.log('🔧 Unsubscribing from topic:', topic);
      
      if (!this.isInitialized) {
        throw new Error('Push notifications not initialized');
      }

      const userToken = localStorage.getItem('token');
      if (!userToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com'}/api/push-notifications/unsubscribe-from-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          deviceToken: this.deviceToken,
          topic: topic
        })
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from topic');
      }

      const result = await response.json();
      console.log('✅ Unsubscribed from topic successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      throw error;
    }
  }

  // Add notification listener
  addNotificationListener(key, callback) {
    this.notificationListeners.set(key, callback);
  }

  // Remove notification listener
  removeNotificationListener(key) {
    this.notificationListeners.delete(key);
  }

  // Get device token
  getDeviceToken() {
    return this.deviceToken;
  }

  // Check if initialized
  isReady() {
    return this.isInitialized;
  }

  // Get user ID from token
  getUserId() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id;
    } catch (error) {
      console.error('❌ Error getting user ID from token:', error);
      return null;
    }
  }

  // Send test notification
  async sendTestNotification() {
    try {
      console.log('🔧 Sending test notification...');
      
      if (!this.isInitialized) {
        throw new Error('Push notifications not initialized');
      }

      const notification = {
        title: 'Test Notification',
        body: 'This is a test notification from APNA Decoration',
        data: {
          type: 'test',
          timestamp: new Date().toISOString()
        }
      };

      this.handleReceivedNotification(notification);
      
      return { success: true, message: 'Test notification sent' };
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      throw error;
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      console.log('🔧 Clearing all notifications...');
      
      if (this.isNative) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.cancelAll();
      }
      
      return { success: true, message: 'All notifications cleared' };
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      throw error;
    }
  }

  // Get notification permissions status
  async getPermissionStatus() {
    try {
      if (this.isNative) {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const permission = await PushNotifications.checkPermissions();
        return {
          receive: permission.receive,
          send: permission.send
        };
      } else {
        const permission = Notification.permission;
        return {
          receive: permission,
          send: 'default'
        };
      }
    } catch (error) {
      console.error('❌ Error getting permission status:', error);
      return {
        receive: 'denied',
        send: 'denied'
      };
    }
  }
}

const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
