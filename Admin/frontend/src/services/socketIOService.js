import io from 'socket.io-client';

class SocketIOService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.io server
   * @param {string} url - Socket.io server URL
   * @param {string} userId - Current user ID
   * @param {string} userType - User type (admin, user, vendor, delivery_boy)
   * @param {string} token - Authentication token
   */
  connect(url, userId, userType, token) {
    if (this.socket?.connected) {
      console.warn('Socket already connected');
      return this.socket;
    }

    console.log(`🔌 Connecting to Socket.io: ${url}`);

    this.socket = io(url, {
      auth: {
        userId,
        userType,
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`✅ Socket.io connected - ID: ${this.socket.id}`);
      this.emit('connected', { socketId: this.socket.id, userId, userType });
    });

    // Disconnect event
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('❌ Socket.io disconnected');
      this.emit('disconnected');
    });

    // Error event
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.emit('error', error);
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('Socket.io disconnected');
    }
  }

  /**
   * Listen for event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not initialized. Call connect() first.');
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);
    this.socket.on(event, callback);
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.socket) {
      console.error('Socket not initialized. Call connect() first.');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen for event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    if (!this.socket) {
      console.error('Socket not initialized. Call connect() first.');
      return;
    }

    this.socket.once(event, callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.removeAllListeners(event);
    }

    if (this.listeners.has(event)) {
      this.listeners.delete(event);
    }
  }

  /**
   * Send new order notification
   */
  sendNewOrder(orderData) {
    this.emit('new-order', orderData);
  }

  /**
   * Send order status update
   */
  sendOrderStatusUpdate(orderId, status, additionalData = {}) {
    this.emit('order-status-update', {
      orderId,
      status,
      ...additionalData,
    });
  }

  /**
   * Send location update (for delivery boys)
   */
  sendLocationUpdate(orderId, latitude, longitude, accuracy = null) {
    this.emit('location-update', {
      orderId,
      latitude,
      longitude,
      accuracy,
    });
  }

  /**
   * Send notification
   */
  sendNotification(recipientId, title, message, type = 'info') {
    this.emit('send-notification', {
      recipientId,
      title,
      message,
      type,
    });
  }

  /**
   * Send vendor application update
   */
  sendVendorApplicationUpdate(vendorId, status) {
    this.emit('vendor-application-update', {
      vendorId,
      status,
    });
  }

  /**
   * Send inventory alert
   */
  sendInventoryAlert(productId, stock, vendorId = null) {
    this.emit('inventory-alert', {
      productId,
      stock,
      vendorId,
    });
  }

  /**
   * Check if connected
   */
  isConnectedToServer() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Clean up all listeners
   */
  cleanup() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
    }
  }
}

// Export singleton instance
export default new SocketIOService();
