import { useState, useEffect, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Hook for real-time order status updates
 * Listens to Socket.io events instead of polling
 */
export const useLiveOrderUpdates = () => {
  const [orders, setOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Handle new order notification
  const handleNewOrder = useCallback((orderData) => {
    console.log('📦 New order received via Socket:', orderData);
    setOrders((prevOrders) => {
      const exists = prevOrders.find((o) => o.orderId === orderData.orderId);
      if (exists) return prevOrders;
      return [{ ...orderData, isNew: true }, ...prevOrders];
    });
    setUnreadCount((prev) => prev + 1);
    setLastUpdate(new Date().toISOString());
  }, []);

  // Handle order status update
  const handleOrderStatusUpdate = useCallback((updateData) => {
    const { orderId, status, updatedAt } = updateData;
    console.log(`📊 Order ${orderId} status updated to ${status} via Socket`);

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === orderId
          ? { ...order, status, updatedAt, isUpdated: true }
          : order
      )
    );
    setLastUpdate(updatedAt || new Date().toISOString());
  }, []);

  // Listen for Socket events
  useEffect(() => {
    // Only proceed if socket is initialized
    if (!socketIOService.socket) {
      console.warn('Socket.io not initialized');
      return;
    }

    // Register event listeners
    socketIOService.on('new-order-notification', handleNewOrder);
    socketIOService.on('admin-order-update', handleOrderStatusUpdate);

    console.log('✅ Live order update listeners registered');

    // Cleanup
    return () => {
      socketIOService.off('new-order-notification', handleNewOrder);
      socketIOService.off('admin-order-update', handleOrderStatusUpdate);
    };
  }, [handleNewOrder, handleOrderStatusUpdate]);

  // Mark orders as read
  const markAsRead = useCallback(() => {
    setUnreadCount(0);
    setOrders((prevOrders) =>
      prevOrders.map((order) => ({ ...order, isNew: false, isUpdated: false }))
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((orderId) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.orderId !== orderId)
    );
  }, []);

  return {
    orders,
    unreadCount,
    lastUpdate,
    markAsRead,
    clearNotification,
  };
};

export default useLiveOrderUpdates;
