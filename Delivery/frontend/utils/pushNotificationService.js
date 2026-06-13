import { Capacitor } from "@capacitor/core";
import { API_BASE_URL } from "../config/constants";

const AUTH_TOKEN_KEY = "deliveryBoyToken";
const FCM_STORAGE_KEY = "fcmDeliveryDeviceToken";
const PUSH_API = `${API_BASE_URL}/api/push-notifications`;

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.listenersAttached = false;
    this.deviceToken = this.getStoredToken();
    this.notificationListeners = new Map();
    this.isNative = typeof Capacitor !== "undefined" ? Capacitor.isNativePlatform() : false;
  }

  getStoredToken() {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage.getItem) {
        return localStorage.getItem(FCM_STORAGE_KEY);
      }
    } catch (error) {
      console.warn("⚠️ localStorage not available:", error.message);
    }
    return null;
  }

  setStorageItem(key, value) {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage.setItem) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn("⚠️ localStorage setItem failed:", error.message);
    }
  }

  getStorageItem(key) {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage.getItem) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn("⚠️ localStorage getItem failed:", error.message);
    }
    return null;
  }

  removeStorageItem(key) {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage.removeItem) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn("⚠️ localStorage removeItem failed:", error.message);
    }
  }

  async attachNativeListeners(PushNotifications) {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    await PushNotifications.addListener("registration", (token) => {
      const value = token?.value || token?.token;
      if (!value) return;
      console.log("✅ FCM token received");
      this.deviceToken = value;
      this.setStorageItem(FCM_STORAGE_KEY, value);
      this.sendTokenToServer(value);
    });

    await PushNotifications.addListener("registrationError", (error) => {
      console.error("❌ Push registration error:", error);
    });

    await PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        this.handleReceivedNotification({
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });
      },
    );

    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        this.handleNotificationAction(action);
      },
    );
  }

  /** @param {boolean} requestPermission - ask user (Profile toggle / enable) */
  async initialize(requestPermission = false) {
    try {
      if (!this.isNative) {
        return false;
      }

      const { PushNotifications } =
        await import("@capacitor/push-notifications");

      await this.attachNativeListeners(PushNotifications);

      let permission = await PushNotifications.checkPermissions();
      if (requestPermission && permission.receive === "prompt") {
        permission = await PushNotifications.requestPermissions();
      }

      if (permission.receive !== "granted") {
        return false;
      }

      await PushNotifications.register();
      this.isInitialized = true;

      const cached = this.getStorageItem(FCM_STORAGE_KEY);
      if (cached && this.getStorageItem(AUTH_TOKEN_KEY)) {
        this.deviceToken = cached;
        await this.sendTokenToServer(cached);
      }

      return true;
    } catch (error) {
      console.error("❌ Error initializing push notifications:", error);
      return false;
    }
  }

  async enablePush() {
    const ok = await this.initialize(true);
    if (!ok) {
      throw new Error(
        "Notification permission denied. Enable notifications in phone Settings.",
      );
    }
    return true;
  }

  async disablePush() {
    const token =
      this.deviceToken || this.getStorageItem(FCM_STORAGE_KEY);
    const userToken = this.getStorageItem(AUTH_TOKEN_KEY);

    if (token && userToken) {
      try {
        await fetch(`${PUSH_API}/unregister-device`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ deviceToken: token }),
        });
      } catch (e) {
        console.warn("unregister device failed", e);
      }
    }

    this.removeStorageItem(FCM_STORAGE_KEY);
    this.deviceToken = null;
  }

  async resumeAfterLogin() {
    if (!this.isNative || !this.getStorageItem(AUTH_TOKEN_KEY)) return;
    const permission = await this.getPermissionStatus();
    if (permission.receive === "granted") {
      await this.initialize(false);
    }
  }

  // Initialize web push notifications
  async initializeWebPush() {
    try {
      console.log("🔧 Initializing web push notifications...");

      // Check if service worker is supported
      if (!("serviceWorker" in navigator)) {
        console.log("⚠️ Service workers not supported");
        return false;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.log("⚠️ Web push notification permission denied");
        return false;
      }

      // Create or update service worker
      const swRegistration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("✅ Service worker registered:", swRegistration.scope);

      this.isInitialized = true;
      console.log("✅ Web push notifications initialized successfully");

      return true;
    } catch (error) {
      console.error("❌ Error initializing web push notifications:", error);
      return false;
    }
  }

  // Send device token to server
  async sendTokenToServer(token) {
    try {
      console.log("🔧 Sending device token to server:", token);

      const userToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!userToken) {
        console.log("⚠️ No user token found, cannot register device");
        return;
      }

      let deviceInfo = {};
      if (this.isNative) {
        const { Device } = await import("@capacitor/device");
        deviceInfo = await Device.getInfo();
      }

      const response = await fetch(
        `${PUSH_API}/register-device`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            deviceToken: token,
            platform: deviceInfo.platform || "web",
            platformVersion: deviceInfo.osVersion || "unknown",
            deviceModel: deviceInfo.model || "unknown",
            appVersion: deviceInfo.appVersion || "1.0.0",
            userId: this.getUserId(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to register device token");
      }

      const result = await response.json();
      console.log("✅ Device token registered successfully:", result);

      return result;
    } catch (error) {
      console.error("❌ Error sending device token to server:", error);
      throw error;
    }
  }

  // Handle received notification
  handleReceivedNotification(notification) {
    try {
      console.log("🔧 Handling received notification:", notification);

      const notificationData = {
        title: notification.title || "New Notification",
        body: notification.body || "You have a new notification",
        data: notification.data || {},
        timestamp: new Date().toISOString(),
      };

      // Trigger custom event for app to handle
      window.dispatchEvent(
        new CustomEvent("pushNotificationReceived", {
          detail: notificationData,
        }),
      );

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
      console.error("❌ Error handling received notification:", error);
    }
  }

  // Handle notification action
  handleNotificationAction(notification) {
    try {
      console.log("🔧 Handling notification action:", notification);

      const actionData = {
        actionId: notification.actionId,
        notification: notification.notification,
        inputValue: notification.inputValue,
      };

      // Trigger custom event for app to handle
      window.dispatchEvent(
        new CustomEvent("pushNotificationActionPerformed", {
          detail: actionData,
        }),
      );

      // Call registered listeners
      this.notificationListeners.forEach((listener, key) => {
        try {
          listener({ type: "action", ...actionData });
        } catch (error) {
          console.error(
            `❌ Error in notification action listener ${key}:`,
            error,
          );
        }
      });
    } catch (error) {
      console.error("❌ Error handling notification action:", error);
    }
  }

  // Show local notification
  async showLocalNotification(notification) {
    try {
      console.log("🔧 Showing local notification:", notification);

      if (this.isNative) {
        const { LocalNotifications } =
          await import("@capacitor/local-notifications");

        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: notification.title,
              body: notification.body,
              largeBody: notification.body,
              schedule: { at: new Date(Date.now() + 1000) },
              sound: "default",
              smallIcon: "ic_notification",
              largeIcon: "ic_notification_large",
              data: notification.data || {},
            },
          ],
        });
      } else {
        // Web notification
        const webNotification = new Notification(notification.title, {
          body: notification.body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: notification.data || {},
        });

        webNotification.onclick = () => {
          window.focus();
          webNotification.close();
        };
      }
    } catch (error) {
      console.error("❌ Error showing local notification:", error);
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic) {
    try {
      console.log("🔧 Subscribing to topic:", topic);

      if (!this.isInitialized) {
        throw new Error("Push notifications not initialized");
      }

      const userToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!userToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${PUSH_API}/subscribe-to-topic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            deviceToken: this.deviceToken,
            topic: topic,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to subscribe to topic");
      }

      const result = await response.json();
      console.log("✅ Subscribed to topic successfully:", result);

      return result;
    } catch (error) {
      console.error("❌ Error subscribing to topic:", error);
      throw error;
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic) {
    try {
      console.log("🔧 Unsubscribing from topic:", topic);

      if (!this.isInitialized) {
        throw new Error("Push notifications not initialized");
      }

      const userToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!userToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${PUSH_API}/unsubscribe-from-topic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            deviceToken: this.deviceToken,
            topic: topic,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to unsubscribe from topic");
      }

      const result = await response.json();
      console.log("✅ Unsubscribed from topic successfully:", result);

      return result;
    } catch (error) {
      console.error("❌ Error unsubscribing from topic:", error);
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
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id;
    } catch (error) {
      console.error("❌ Error getting user ID from token:", error);
      return null;
    }
  }

  // Send test notification
  async sendTestNotification() {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      throw new Error("Please log in first");
    }

    const response = await fetch(`${PUSH_API}/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send test push");
    }
    return data;
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      console.log("🔧 Clearing all notifications...");

      if (this.isNative) {
        const { LocalNotifications } =
          await import("@capacitor/local-notifications");
        await LocalNotifications.cancelAll();
      }

      return { success: true, message: "All notifications cleared" };
    } catch (error) {
      console.error("❌ Error clearing notifications:", error);
      throw error;
    }
  }

  // Get notification permissions status
  async getPermissionStatus() {
    try {
      if (this.isNative) {
        const { PushNotifications } =
          await import("@capacitor/push-notifications");
        const permission = await PushNotifications.checkPermissions();
        return {
          receive: permission.receive,
          send: permission.send,
        };
      } else {
        const permission = Notification.permission;
        return {
          receive: permission,
          send: "default",
        };
      }
    } catch (error) {
      console.error("❌ Error getting permission status:", error);
      return {
        receive: "denied",
        send: "denied",
      };
    }
  }
}

const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
