const axios = require("axios");
const {
  getMessaging,
  isAdminReady,
  stringifyData,
} = require("../config/firebaseAdmin");
const DeviceToken = require("../models/DeviceToken");

class PushNotificationService {
  constructor() {
    this.provider = process.env.PUSH_PROVIDER || "firebase";
    this.firebaseServerKey =
      process.env.FIREBASE_SERVER_KEY || "demo_firebase_key";
    this.oneSignalAppId = process.env.ONESIGNAL_APP_ID || "demo_app_id";
    this.oneSignalApiKey = process.env.ONESIGNAL_API_KEY || "demo_api_key";
    this.baseURL = "https://fcm.googleapis.com/fcm/send";
  }

  isLegacyKeyReady() {
    const key = this.firebaseServerKey;
    return Boolean(key && key !== "demo_firebase_key" && key.length > 20);
  }

  isFirebaseReady() {
    return isAdminReady() || this.isLegacyKeyReady();
  }

  useMock() {
    return process.env.PUSH_MOCK === "true" || !this.isFirebaseReady();
  }

  // Utility: Break token arrays into legal FCM chunk size (500 max per request)
  chunkArray(array, size = 500) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Reactive cleanup: Remove invalid FCM tokens on immediate failure
  async cleanupInvalidTokens(failedTokens) {
    try {
      if (!failedTokens || failedTokens.length === 0) {
        return;
      }
      
      const result = await DeviceToken.deleteMany({ token: { $in: failedTokens } });
      console.log(`🧹 Reactively cleaned up ${result.deletedCount} invalid FCM tokens.`);
      return result;
    } catch (error) {
      console.error("❌ Error during reactive token cleanup:", error.message);
    }
  }

  // Extract invalid tokens from FCM response errors
  extractInvalidTokens(response, tokens) {
    const invalidTokens = [];
    try {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          // FCM error codes that indicate token is permanently invalid
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/third-party-auth-error' ||
            errorCode === 'messaging/invalid-argument'
          ) {
            invalidTokens.push(tokens[idx]);
            console.warn(`⚠️ Invalid token detected (${errorCode}): ${tokens[idx].slice(0, 12)}...`);
          }
        }
      });
    } catch (err) {
      console.error("Error extracting invalid tokens:", err.message);
    }
    return invalidTokens;
  }


  buildFcmMessage(deviceToken, notification, data = {}) {
    return {
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: stringifyData({
        ...data,
        type: data.type || "general",
        timestamp: new Date().toISOString(),
      }),
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
          color: notification.color || "#1976d2",
        },
      },
    };
  }

  async sendViaAdmin(deviceToken, notification, data = {}) {
    const messaging = getMessaging();
    if (!messaging) {
      throw new Error("Firebase Admin not configured");
    }
    const messageId = await messaging.send(
      this.buildFcmMessage(deviceToken, notification, data),
    );
    return {
      success: true,
      messageId,
      deviceCount: 1,
      provider: "firebase-admin",
    };
  }

  async sendMulticastViaAdmin(deviceTokens, notification, data = {}) {
    const messaging = getMessaging();
    if (!messaging) {
      throw new Error("Firebase Admin not configured");
    }

    const message = {
      tokens: deviceTokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: stringifyData({
        ...data,
        type: data.type || "general",
        timestamp: new Date().toISOString(),
      }),
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    
    // Reactive cleanup: Remove invalid tokens on delivery failure
    if (response.failureCount > 0) {
      const invalidTokens = this.extractInvalidTokens(response, deviceTokens);
      if (invalidTokens.length > 0) {
        await this.cleanupInvalidTokens(invalidTokens);
      }
    }
    
    return {
      success: response.failureCount === 0,
      totalSuccess: response.successCount,
      totalFailed: response.failureCount,
      provider: "firebase-admin",
      response,
    };
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

      if (this.useMock()) {
        console.log("📱 MOCK PUSH - single device:", deviceToken.slice(0, 12));
        return {
          success: true,
          messageId: `MOCK_${Date.now()}`,
          provider: "mock",
          deviceCount: 1,
        };
      }

      if (isAdminReady()) {
        const result = await this.sendViaAdmin(deviceToken, notification, data);
        console.log("✅ Push sent (Firebase Admin):", result.messageId);
        return result;
      }

      const response = await axios.post(this.baseURL, payload, {
        headers: {
          Authorization: `key=${this.firebaseServerKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Push sent (legacy FCM):", response.data);
      return {
        success: true,
        messageId: response.data.messageId,
        deviceCount: 1,
        provider: "firebase-legacy",
        response: response.data,
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
      
      // Send to devices in batches - FCM sendEachForMulticast max = 500 tokens per request
      const tokenChunks = this.chunkArray(deviceTokens, 500);
      let totalSuccess = 0;
      let totalFailed = 0;

      for (let chunkIdx = 0; chunkIdx < tokenChunks.length; chunkIdx++) {
        const chunk = tokenChunks[chunkIdx];
        
        try {
          const payload = {
            registration_ids: chunk,
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

          if (this.useMock()) {
            const mockResult = {
              success: true,
              messageId: `MOCK_BATCH_${Date.now()}_${chunkIdx}`,
              deviceCount: chunk.length,
              provider: "mock",
            };
            results.push(mockResult);
            totalSuccess += chunk.length;
          } else if (isAdminReady()) {
            const adminResult = await this.sendMulticastViaAdmin(
              chunk,
              notification,
              data,
            );
            results.push({
              success: adminResult.success,
              deviceCount: adminResult.totalSuccess,
              provider: "firebase-admin",
            });
            totalSuccess += adminResult.totalSuccess;
            totalFailed += adminResult.totalFailed;
          } else {
            const response = await axios.post(this.baseURL, payload, {
              headers: {
                Authorization: `key=${this.firebaseServerKey}`,
                "Content-Type": "application/json",
              },
            });

            const legacyResult = {
              success: response.data.success === 1,
              messageId: response.data.messageId,
              deviceCount: response.data.success || 0,
              provider: "firebase-legacy",
              response: response.data,
            };
            results.push(legacyResult);
            totalSuccess += response.data.success || 0;
            totalFailed += response.data.failure || 0;
          }
          
          // Minor delay between chunks to prevent socket thrashing
          if (chunkIdx < tokenChunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`❌ Failed to send chunk ${chunkIdx} (size: ${chunk.length}):`, error);
          results.push({
            success: false,
            error: error.message,
            deviceCount: 0,
            provider: 'firebase'
          });
          totalFailed += chunk.length;
        }
      }

      console.log(`✅ Push notification broadcast completed: ${totalSuccess}/${deviceTokens.length} successful`);
      
      return {
        success: totalFailed === 0,
        totalDevices: deviceTokens.length,
        totalSuccess,
        totalFailed,
        chunksProcessed: tokenChunks.length,
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
    
    if (token.length < 20) {
      throw new Error("Device token too short");
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

      if (this.useMock()) {
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

      if (this.useMock()) {
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
