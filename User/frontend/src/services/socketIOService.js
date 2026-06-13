import io from 'socket.io-client';

class SocketIOServiceUser {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(url, userId, userType, token) {
    if (this.socket?.connected) {
      console.warn('Socket already connected');
      return this.socket;
    }

    console.log(`🔌 Connecting to Socket.io: ${url}`);

    // User frontend connects to admin backend's socket server
    this.socket = io(url, {
      auth: {
        userId,
        userType: 'user', // Always user for this frontend
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`✅ Socket.io connected - ID: ${this.socket.id}`);
      this.emit('connected', { socketId: this.socket.id, userId });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('❌ Socket.io disconnected');
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.emit('error', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);
    this.socket.on(event, callback);
  }

  emit(event, data) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.emit(event, data);
  }

  once(event, callback) {
    if (!this.socket) return;
    this.socket.once(event, callback);
  }

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

  isConnectedToServer() {
    return this.isConnected && this.socket?.connected;
  }

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

export default new SocketIOServiceUser();
