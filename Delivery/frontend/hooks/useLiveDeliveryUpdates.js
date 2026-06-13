import { useState, useEffect, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Hook for real-time delivery assignments and updates (Next.js)
 */
export const useLiveDeliveryUpdates = () => {
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleDeliveryAssignment = useCallback((data) => {
    console.log('📍 New delivery assignment via Socket:', data);
    setDeliveryTasks((prev) => {
      const exists = prev.find((t) => t.orderId === data.orderId);
      if (exists) return prev;
      return [{ ...data, isNew: true, status: 'assigned' }, ...prev];
    });
    setUnreadCount((prev) => prev + 1);
    setLastUpdate(new Date().toISOString());
  }, []);

  const handleDeliveryLocationUpdate = useCallback((data) => {
    console.log('📡 Location update for order:', data.orderId);
    // Emit event for map component to listen
    setLastUpdate(new Date().toISOString());
  }, []);

  const handleOrderStatusUpdate = useCallback((data) => {
    const { orderId, status } = data;
    console.log(`🚚 Delivery order ${orderId} status: ${status}`);

    setDeliveryTasks((prev) =>
      prev.map((task) =>
        task.orderId === orderId ? { ...task, status, isUpdated: true } : task
      )
    );
    setLastUpdate(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (!socketIOService.socket) {
      console.warn('Socket.io not initialized');
      return;
    }

    socketIOService.on('delivery-assignment', handleDeliveryAssignment);
    socketIOService.on('delivery-location-update', handleDeliveryLocationUpdate);
    socketIOService.on('order-status-changed', handleOrderStatusUpdate);

    console.log('✅ Live delivery update listeners registered');

    return () => {
      socketIOService.off('delivery-assignment', handleDeliveryAssignment);
      socketIOService.off('delivery-location-update', handleDeliveryLocationUpdate);
      socketIOService.off('order-status-changed', handleOrderStatusUpdate);
    };
  }, [handleDeliveryAssignment, handleDeliveryLocationUpdate, handleOrderStatusUpdate]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
    setDeliveryTasks((prev) =>
      prev.map((task) => ({ ...task, isNew: false, isUpdated: false }))
    );
  }, []);

  const completeDelivery = useCallback((orderId, status) => {
    socketIOService.emit('order-status-update', {
      orderId,
      status,
    });

    setDeliveryTasks((prev) =>
      prev.map((task) =>
        task.orderId === orderId ? { ...task, status } : task
      )
    );
  }, []);

  return {
    deliveryTasks,
    unreadCount,
    lastUpdate,
    markAsRead,
    completeDelivery,
  };
};

export default useLiveDeliveryUpdates;
