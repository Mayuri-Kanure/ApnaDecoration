const axios = require('axios');

class PushNotificationService {
  constructor() {
    // Push notification provider configuration
    this.provider = process.env.PUSH_PROVIDER || 'firebase';
    this.firebaseServerKey = process.env.FIREBASE_SERVER_KEY || 'demo_firebase_key';
    this.oneSignalAppId = process.env.ONESIGNAL_APP_ID || 'demo_app_id';
    this.oneSignalApiKey = process.env.ONESIGNAL_API_KEY || 'demo_api_key';
    this.baseURL = 'https://fcm.googleapis.com/fcm/send';
  }

  // Send push notification to single device
  async sendToDevice(deviceToken, notification, data = {}) {
    try {
      console.log('🔧 Sending push notification to device:', { deviceToken, notification });

      const payload = {
        to: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icon.png',
          badge: notification.badge || '/badge.png',
          sound: notification.sound || 'default',
          click_action: notification.clickAction || '/',
          priority: notification.priority || 'high'
        },
        data: {
          ...data,
          type: data.type || 'general',
          timestamp: new Date().toISOString()
        },
        android: {
          priority: notification.priority || 'high',
          notification: {
              sound: notification.sound || 'default',
              icon: notification.icon || '/icon.png',
              color: notification.color || '#1976d2'
          }
        },
        ios: {
          badge: notification.badge || '1',
          sound: notification.sound || 'default'
        }
      };

      // Mock implementation for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 MOCK PUSH NOTIFICATION - Single Device:', {
          to: deviceToken,
          notification: payload.notification,
          data: payload.data,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          messageId: `MOCK_${Date.now()}`,
          provider: 'mock',
          deviceCount: 1,
          message: 'Push notification sent successfully (development mode)'
        };
      }

      // Real Firebase implementation
      const response = await axios.post(this.baseURL, payload, {
        headers: {
          'Authorization': `key=${this.firebaseServerKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Push notification sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messageId,
        deviceCount: 1,
        provider: 'firebase',
        response: response.data
      };
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw new Error(error.message || 'Failed to send push notification');
    }
  }

  // Send push notification to multiple devices
  async sendToMultipleDevices(deviceTokens, notification, data = {}) {
    try {
      console.log('🔧 Sending push notification to multiple devices:', { 
        deviceCount: deviceTokens.length, 
        notification 
      });

      if (!deviceTokens || deviceTokens.length === 0) {
        throw new Error('No device tokens provided');
      }

      const results = [];
      
      // Send to devices in batches (Firebase supports up to 1000 tokens per request)
      const batchSize = 1000;
      for (let i = 0; i < deviceTokens.length; i += batchSize) {
        const batch = deviceTokens.slice(i, i + batchSize);
        
        try {
          const payload = {
            registration_ids: batch,
            notification: {
              title: notification.title,
              body: notification.body,
              icon: notification.icon || '/icon.png',
              badge: notification.badge || '/badge.png',
              sound: notification.sound || 'default',
              click_action: notification.clickAction || '/'
            },
            data: {
              ...data,
              type: data.type || 'general',
              timestamp: new Date().toISOString()
            }
          };

          // Mock implementation for development
          if (process.env.NODE_ENV === 'development') {
            console.log('📱 MOCK PUSH NOTIFICATION - Batch:', {
              registration_ids: batch,
              notification: payload.notification,
              data: payload.data,
              timestamp: new Date().toISOString()
            });
            
            results.push({
              success: true,
              messageId: `MOCK_BATCH_${Date.now()}_${i}`,
              deviceCount: batch.length,
              provider: 'mock'
            });
          } else {
            // Real Firebase implementation
            const response = await axios.post(this.baseURL, payload, {
              headers: {
                'Authorization': `key=${this.firebaseServerKey}`,
                'Content-Type': 'application/json'
              }
            });

            results.push({
              success: response.data.success === 1,
              messageId: response.data.messageId,
              deviceCount: response.data.success || 0,
              provider: 'firebase',
              response: response.data
            });
          }
        } catch (error) {
          console.error(`❌ Failed to send batch ${i}:`, error);
          results.push({
            success: false,
            error: error.message,
            deviceCount: batch.length,
            provider: 'firebase'
          });
        }
      }

      const totalSuccess = results.reduce((sum, result) => sum + (result.success ? result.deviceCount : 0), 0);
      const totalFailed = deviceTokens.length - totalSuccess;

      console.log(`✅ Push notification batch completed: ${totalSuccess}/${deviceTokens.length} successful`);
      
      return {
        success: true,
        totalDevices: deviceTokens.length,
        totalSuccess,
        totalFailed,
        results: results
      };
    } catch (error) {
      console.error('❌ Error sending push notifications to multiple devices:', error);
      throw new Error(error.message || 'Failed to send push notifications');
    }
  }

  // Send order status update notification
  async sendOrderUpdate(deviceToken, orderData, status, customerName = '') {
    try {
      const notification = this.generateOrderUpdateNotification(orderData, status, customerName);
      const data = {
        type: 'order_update',
        orderId: orderData._id || orderData.orderId,
        status: status,
        timestamp: new Date().toISOString()
      };

      return await this.sendToDevice(deviceToken, notification, data);
    } catch (error) {
      console.error('❌ Error sending order update push notification:', error);
      throw error;
    }
  }

  // Send payment confirmation notification
  async sendPaymentConfirmation(deviceToken, paymentData, customerName = '') {
    try {
      const notification = this.generatePaymentConfirmationNotification(paymentData, customerName);
      const data = {
        type: 'payment_confirmation',
        paymentId: paymentData._id || paymentData.transactionId,
        amount: paymentData.amount,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      return await this.sendToDevice(deviceToken, notification, data);
    } catch (error) {
      console.error('❌ Error sending payment confirmation push notification:', error);
      throw error;
    }
  }

  // Send delivery update notification
  async sendDeliveryUpdate(deviceToken, orderData, deliveryStatus, customerName = '') {
    try {
      const notification = this.generateDeliveryUpdateNotification(orderData, deliveryStatus, customerName);
      const data = {
        type: 'delivery_update',
        orderId: orderData._id || orderData.orderId,
        deliveryStatus: deliveryStatus,
        timestamp: new Date().toISOString()
      };

      return await this.sendToDevice(deviceToken, notification, data);
    } catch (error) {
      console.error('❌ Error sending delivery update push notification:', error);
      throw error;
    }
  }

  // Send promotional notification
  async sendPromotionalNotification(deviceTokens, title, message, data = {}) {
    try {
      const notification = {
        title: title,
        body: message,
        icon: '/promotional-icon.png',
        clickAction: '/promotions',
        priority: 'high'
      };

      const notificationData = {
        type: 'promotional',
        ...data,
        timestamp: new Date().toISOString()
      };

      return await this.sendToMultipleDevices(deviceTokens, notification, notificationData);
    } catch (error) {
      console.error('❌ Error sending promotional push notification:', error);
      throw error;
    }
  }

  // Generate order update notification
  generateOrderUpdateNotification(orderData, status, customerName) {
    const orderId = orderData._id?.slice(-8) || orderData.orderId?.slice(-8) || 'N/A';
    const greeting = customerName ? `Hi ${customerName},` : 'Hi,';
    
    const statusMessages = {
      'confirmed': {
        title: 'Order Confirmed! 🎉',
        body: `${greeting} Your order #${orderId} has been confirmed and is being prepared.`
      },
      'processing': {
        title: 'Order Processing 🔄',
        body: `${greeting} Your order #${orderId} is now being processed.`
      },
      'shipped': {
        title: 'Order Shipped! 📦',
        body: `${greeting} Your order #${orderId} has been shipped! Track your package.`
      },
      'delivered': {
        title: 'Order Delivered! ✅',
        body: `${greeting} Your order #${orderId} has been delivered successfully!`
      },
      'cancelled': {
        title: 'Order Cancelled ❌',
        body: `${greeting} Your order #${orderId} has been cancelled.`
      },
      'returned': {
        title: 'Order Returned 🔄',
        body: `${greeting} Your return for order #${orderId} has been processed.`
      }
    };

    return statusMessages[status] || {
      title: 'Order Update',
      body: `${greeting} Your order #${orderId} status has been updated to ${status}.`
    };
  }

  // Generate payment confirmation notification
  generatePaymentConfirmationNotification(paymentData, customerName) {
    const amount = paymentData.amount || 0;
    const transactionId = paymentData.transactionId?.slice(-8) || paymentData._id?.slice(-8) || 'N/A';
    const greeting = customerName ? `Hi ${customerName},` : 'Hi,';
    
    return {
      title: 'Payment Successful! 💳',
      body: `${greeting} Payment of ₹${amount.toFixed(2)} received successfully! Transaction ID: ${transactionId}.`,
      icon: '/payment-success-icon.png'
    };
  }

  // Generate delivery update notification
  generateDeliveryUpdateNotification(orderData, deliveryStatus, customerName) {
    const orderId = orderData._id?.slice(-8) || orderData.orderId?.slice(-8) || 'N/A';
    const greeting = customerName ? `Hi ${customerName},` : 'Hi,';
    
    const deliveryMessages = {
      'picked_up': {
        title: 'Order Picked Up 🚚',
        body: `${greeting} Your order #${orderId} has been picked up by our delivery partner.`
      },
      'in_transit': {
        title: 'Order In Transit 🚛',
        body: `${greeting} Your order #${orderId} is in transit and will reach you soon.`
      },
      'out_for_delivery': {
        title: 'Out for Delivery! 📦',
        body: `${greeting} Your order #${orderId} is out for delivery! Expect it today.`
      },
      'delivered': {
        title: 'Order Delivered! ✅',
        body: `${greeting} Your order #${orderId} has been delivered successfully!`
      },
      'failed': {
        title: 'Delivery Attempt Failed ❌',
        body: `${greeting} Delivery attempt failed for order #${orderId}. We will try again tomorrow.`
      },
      'rescheduled': {
        title: 'Delivery Rescheduled 📅',
        body: `${greeting} Delivery for order #${orderId} has been rescheduled.`
      }
    };

    return deliveryMessages[deliveryStatus] || {
      title: 'Delivery Update',
      body: `${greeting} Delivery update for order #${orderId}: ${deliveryStatus}`
    };
  }

  // Validate device token
  validateDeviceToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid device token');
    }
    
    // Basic validation for Firebase tokens
    if (token.length < 100) {
      throw new Error('Device token too short');
    }
    
    return token;
  }

  // Subscribe device to topic
  async subscribeToTopic(deviceToken, topic) {
    try {
      console.log('🔧 Subscribing device to topic:', { deviceToken, topic });

      const payload = {
        to: deviceToken,
        data: {
          operation: 'add',
          topic: topic
        }
      };

      // Mock implementation for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 MOCK TOPIC SUBSCRIPTION:', {
          to: deviceToken,
          data: payload.data,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          topic: topic,
          deviceToken: deviceToken,
          message: 'Device subscribed to topic successfully (development mode)'
        };
      }

      // Real Firebase implementation
      const response = await axios.post(this.baseURL, payload, {
        headers: {
          'Authorization': `key=${this.firebaseServerKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Device subscribed to topic successfully:', response.data);
      return {
        success: true,
        topic: topic,
        deviceToken: deviceToken,
        response: response.data
      };
    } catch (error) {
      console.error('❌ Error subscribing device to topic:', error);
      throw new Error(error.message || 'Failed to subscribe device to topic');
    }
  }

  // Send notification to topic
  async sendToTopic(topic, notification, data = {}) {
    try {
      console.log('🔧 Sending push notification to topic:', { topic, notification });

      const payload = {
        to: `/topics/${topic}`,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icon.png',
          badge: notification.badge || '/badge.png',
          sound: notification.sound || 'default',
          click_action: notification.clickAction || '/'
        },
        data: {
          ...data,
          type: data.type || 'general',
          timestamp: new Date().toISOString()
        }
      };

      // Mock implementation for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 MOCK TOPIC NOTIFICATION:', {
          to: `/topics/${topic}`,
          notification: payload.notification,
          data: payload.data,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          messageId: `MOCK_TOPIC_${Date.now()}`,
          topic: topic,
          provider: 'mock',
          message: 'Topic notification sent successfully (development mode)'
        };
      }

      // Real Firebase implementation
      const response = await axios.post(this.baseURL, payload, {
        headers: {
          'Authorization': `key=${this.firebaseServerKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Topic notification sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messageId,
        topic: topic,
        provider: 'firebase',
        response: response.data
      };
    } catch (error) {
      console.error('❌ Error sending topic notification:', error);
      throw new Error(error.message || 'Failed to send topic notification');
    }
  }
}

module.exports = new PushNotificationService();
