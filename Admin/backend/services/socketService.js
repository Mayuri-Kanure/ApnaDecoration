const socketIO = require('socket.io');

/**
 * Socket.io server setup with real-time event handling
 */
class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map of userId -> socket connection
    this.connectedDeliveryBoys = new Map(); // Map of deliveryBoyId -> socket connection
    this.connectedAdmins = new Map(); // Map of adminId -> socket connection
    this.connectedVendors = new Map(); // Map of vendorId -> socket connection
  }

  /**
   * Initialize Socket.io server
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
          'https://*.apnadecoration.com',
        ],
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });

    // Middleware to authenticate socket connections
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;
      const userType = socket.handshake.auth.userType; // admin, user, vendor, delivery_boy

      if (!token || !userId) {
        return next(new Error('Authentication failed'));
      }

      socket.userId = userId;
      socket.userType = userType;
      socket.token = token;
      next();
    });

    // Connection event
    this.io.on('connection', (socket) => {
      console.log(`✅ User connected: ${socket.userId} (${socket.userType}) - Socket ID: ${socket.id}`);

      // Register user based on type
      this.registerUser(socket);

      // Event: New order received
      socket.on('new-order', (orderData) => {
        this.handleNewOrder(socket, orderData);
      });

      // Event: Order status updated
      socket.on('order-status-update', (data) => {
        this.handleOrderStatusUpdate(socket, data);
      });

      // Event: Real-time location update (for delivery boys)
      socket.on('location-update', (locationData) => {
        this.handleLocationUpdate(socket, locationData);
      });

      // Event: Notification sent
      socket.on('send-notification', (notificationData) => {
        this.handleNotification(socket, notificationData);
      });

      // Event: Vendor application updated
      socket.on('vendor-application-update', (data) => {
        this.handleVendorApplicationUpdate(socket, data);
      });

      // Event: Inventory alert
      socket.on('inventory-alert', (data) => {
        this.handleInventoryAlert(socket, data);
      });

      // Event: Chat message
      socket.on('chat-message', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Event: Typing indicator
      socket.on('typing', (data) => {
        this.handleTypingIndicator(socket, data);
      });

      // Disconnect event
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.userId}:`, error);
      });
    });

    console.log('✅ Socket.io initialized successfully');
    return this.io;
  }

  /**
   * Register connected user based on type
   */
  registerUser(socket) {
    switch (socket.userType) {
      case 'admin':
        this.connectedAdmins.set(socket.userId, socket);
        socket.join('admins');
        break;
      case 'user':
        this.connectedUsers.set(socket.userId, socket);
        socket.join(`user_${socket.userId}`);
        break;
      case 'vendor':
        this.connectedVendors.set(socket.userId, socket);
        socket.join(`vendor_${socket.userId}`);
        break;
      case 'delivery_boy':
        this.connectedDeliveryBoys.set(socket.userId, socket);
        socket.join(`delivery_boy_${socket.userId}`);
        break;
    }
  }

  /**
   * Handle new order creation
   */
  handleNewOrder(socket, orderData) {
    console.log('📦 New order received:', orderData.orderId);

    // Notify all admins
    this.io.to('admins').emit('new-order-notification', {
      orderId: orderData.orderId,
      customerId: orderData.customerId,
      totalAmount: orderData.totalAmount,
      items: orderData.items,
      createdAt: new Date().toISOString(),
    });

    // Notify relevant vendors if applicable
    if (orderData.vendorId) {
      this.io.to(`vendor_${orderData.vendorId}`).emit('vendor-new-order', {
        orderId: orderData.orderId,
        items: orderData.items,
        createdAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle order status updates
   */
  handleOrderStatusUpdate(socket, data) {
    const { orderId, status, userId } = data;
    console.log(`📊 Order ${orderId} status updated to: ${status}`);

    // Notify customer
    this.io.to(`user_${userId}`).emit('order-status-changed', {
      orderId,
      status,
      updatedAt: new Date().toISOString(),
    });

    // Notify admins
    this.io.to('admins').emit('admin-order-update', {
      orderId,
      status,
      updatedAt: new Date().toISOString(),
    });

    // Notify relevant delivery boy if status is out for delivery
    if (status === 'out_for_delivery' && data.deliveryBoyId) {
      this.io.to(`delivery_boy_${data.deliveryBoyId}`).emit('delivery-assignment', {
        orderId,
        deliveryAddress: data.deliveryAddress,
        customerPhone: data.customerPhone,
      });
    }
  }

  /**
   * Handle real-time location updates from delivery boys
   */
  handleLocationUpdate(socket, locationData) {
    const { orderId, latitude, longitude, accuracy } = locationData;

    // Broadcast location to all connected users tracking this order
    this.io.emit('delivery-location-update', {
      orderId,
      latitude,
      longitude,
      accuracy,
      updatedAt: new Date().toISOString(),
    });

    console.log(`📍 Location update for order ${orderId}: (${latitude}, ${longitude})`);
  }

  /**
   * Handle notifications
   */
  handleNotification(socket, notificationData) {
    const { recipientId, title, message, type } = notificationData;
    console.log(`🔔 Notification to ${recipientId}: ${title}`);

    if (recipientId === 'all') {
      // Broadcast to all connected users
      this.io.emit('notification', {
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Send to specific user
      this.io.to(`user_${recipientId}`).emit('notification', {
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle vendor application updates
   */
  handleVendorApplicationUpdate(socket, data) {
    const { vendorId, status } = data;
    console.log(`🏪 Vendor ${vendorId} application status: ${status}`);

    this.io.to(`vendor_${vendorId}`).emit('vendor-application-status', {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Handle inventory alerts
   */
  handleInventoryAlert(socket, data) {
    const { productId, stock, vendorId } = data;
    console.log(`⚠️ Inventory alert for product ${productId}: ${stock} units left`);

    // Notify vendor
    if (vendorId) {
      this.io.to(`vendor_${vendorId}`).emit('low-stock-alert', {
        productId,
        stock,
        alertedAt: new Date().toISOString(),
      });
    }

    // Notify admins
    this.io.to('admins').emit('inventory-alert', {
      productId,
      stock,
      vendorId,
      alertedAt: new Date().toISOString(),
    });
  }

  /**
   * Handle chat messages
   */
  handleChatMessage(socket, data) {
    const { conversationId, message, recipientId, messageType = 'text' } = data;
    console.log(`💬 Chat message in ${conversationId}: ${message.substring(0, 50)}`);

    // Emit message to recipient
    this.io.to(`user_${recipientId}`).emit('new-chat-message', {
      conversationId,
      senderId: socket.userId,
      senderName: socket.userName,
      senderType: socket.userType,
      message,
      messageType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle typing indicator
   */
  handleTypingIndicator(socket, data) {
    const { conversationId, recipientId, isTyping } = data;
    const typingStatus = isTyping ? 'typing' : 'stopped';
    console.log(`✏️ ${socket.userId} ${typingStatus} in conversation ${conversationId}`);

    // Emit typing status to recipient
    this.io.to(`user_${recipientId}`).emit('user-typing', {
      conversationId,
      userId: socket.userId,
      isTyping,
    });
  }

  /**
   * Handle user disconnection
   */
  handleDisconnect(socket) {
    console.log(`❌ User disconnected: ${socket.userId} - Socket ID: ${socket.id}`);

    this.connectedUsers.delete(socket.userId);
    this.connectedAdmins.delete(socket.userId);
    this.connectedVendors.delete(socket.userId);
    this.connectedDeliveryBoys.delete(socket.userId);
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  /**
   * Emit event to all admins
   */
  emitToAdmins(event, data) {
    this.io.to('admins').emit(event, data);
  }

  /**
   * Emit event to specific vendor
   */
  emitToVendor(vendorId, event, data) {
    this.io.to(`vendor_${vendorId}`).emit(event, data);
  }

  /**
   * Emit event to specific delivery boy
   */
  emitToDeliveryBoy(deliveryBoyId, event, data) {
    this.io.to(`delivery_boy_${deliveryBoyId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Get connected users count
   */
  getConnectionStats() {
    return {
      totalUsers: this.connectedUsers.size,
      totalAdmins: this.connectedAdmins.size,
      totalVendors: this.connectedVendors.size,
      totalDeliveryBoys: this.connectedDeliveryBoys.size,
      totalConnected: 
        this.connectedUsers.size +
        this.connectedAdmins.size +
        this.connectedVendors.size +
        this.connectedDeliveryBoys.size,
    };
  }
}

module.exports = new SocketService();
