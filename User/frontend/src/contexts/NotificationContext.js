import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
      });
    }
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
      });
    }
  };

  const showNotification = (title, options = {}) => {
    const id = Date.now().toString();
    const notification = {
      id,
      title,
      message: options.message || '',
      type: options.type || 'info',
      timestamp: new Date(),
      read: false
    };

    // Add to in-app notifications
    setNotifications(prev => [notification, ...prev]);

    // Show browser notification if permission granted
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        body: options.message,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false
      });
    }

    return id;
  };

  const showOrderNotification = (order, status) => {
    const statusMessages = {
      confirmed: {
        title: 'Order Confirmed! 🎉',
        message: `Your order ${order.orderNumber} has been confirmed and is being prepared.`,
        type: 'success'
      },
      processing: {
        title: 'Order Processing 📦',
        message: `Your order ${order.orderNumber} is now being processed.`,
        type: 'info'
      },
      shipped: {
        title: 'Order Shipped 🚚',
        message: `Your order ${order.orderNumber} has been shipped and is on its way!`,
        type: 'info'
      },
      delivered: {
        title: 'Order Delivered ✅',
        message: `Your order ${order.orderNumber} has been delivered successfully!`,
        type: 'success'
      },
      cancelled: {
        title: 'Order Cancelled ❌',
        message: `Your order ${order.orderNumber} has been cancelled.`,
        type: 'error'
      }
    };

    const notificationConfig = statusMessages[status];
    if (notificationConfig) {
      return showNotification(notificationConfig.title, {
        message: notificationConfig.message,
        type: notificationConfig.type,
        tag: `order-${order._id}`,
        requireInteraction: status === 'delivered'
      });
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    permission,
    showNotification,
    showOrderNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {permission === 'default' && (
        <button onClick={requestNotificationPermission}>
          Enable Notifications
        </button>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
