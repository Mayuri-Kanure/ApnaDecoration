import { useState, useEffect, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Hook for real-time order status updates for users
 */
export const useLiveOrderStatusUser = () => {
  const [orderUpdates, setOrderUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleOrderStatusChanged = useCallback((data) => {
    const { orderId, status, updatedAt } = data;
    console.log(`📦 Your order ${orderId} status: ${status}`);

    // Add to updates
    setOrderUpdates((prev) => {
      const exists = prev.find((u) => u.orderId === orderId);
      if (exists) {
        return prev.map((u) =>
          u.orderId === orderId ? { ...u, status, updatedAt } : u
        );
      }
      return [{ orderId, status, updatedAt, timestamp: new Date().toISOString() }, ...prev];
    });

    // Create notification
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      processing: 'Your order is being processed',
      packed: 'Your order is packed and ready to ship',
      shipped: 'Your order is on the way!',
      out_for_delivery: 'Your order is out for delivery',
      delivered: 'Your order has been delivered 🎉',
      cancelled: 'Your order has been cancelled',
    };

    setNotifications((prev) => [
      {
        id: `${orderId}_${Date.now()}`,
        orderId,
        message: statusMessages[status] || `Order status updated to ${status}`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);

    setLastUpdate(new Date().toISOString());
  }, []);

  const handleGeneralNotification = useCallback((data) => {
    const { title, message, type = 'info' } = data;
    console.log(`🔔 Notification: ${title}`);

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const handleDeliveryLocationUpdate = useCallback((data) => {
    const { orderId, latitude, longitude } = data;
    console.log(`📍 Delivery location for ${orderId}: ${latitude}, ${longitude}`);
    setLastUpdate(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (!socketIOService.socket) {
      console.warn('Socket.io not initialized');
      return;
    }

    socketIOService.on('order-status-changed', handleOrderStatusChanged);
    socketIOService.on('notification', handleGeneralNotification);
    socketIOService.on('delivery-location-update', handleDeliveryLocationUpdate);

    console.log('✅ Live order status listeners registered');

    return () => {
      socketIOService.off('order-status-changed', handleOrderStatusChanged);
      socketIOService.off('notification', handleGeneralNotification);
      socketIOService.off('delivery-location-update', handleDeliveryLocationUpdate);
    };
  }, [handleOrderStatusChanged, handleGeneralNotification, handleDeliveryLocationUpdate]);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return {
    orderUpdates,
    notifications,
    lastUpdate,
    markNotificationAsRead,
    clearNotification,
    getUnreadCount,
  };
};

export default useLiveOrderStatusUser;
