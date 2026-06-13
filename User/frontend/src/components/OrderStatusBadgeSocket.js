import React, { useState, useEffect } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Real-time notification badge for users
 */
function OrderStatusBadgeSocket() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastStatus, setLastStatus] = useState('');

  useEffect(() => {
    setIsConnected(socketIOService.isConnectedToServer());

    const handleOrderStatusChange = (data) => {
      console.log('📦 Order status update via Socket:', data);
      setNotificationCount((prev) => prev + 1);
      setLastStatus(data.status);
    };

    const handleNotification = (data) => {
      console.log('🔔 Notification via Socket:', data);
      setNotificationCount((prev) => prev + 1);
    };

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    socketIOService.on('order-status-changed', handleOrderStatusChange);
    socketIOService.on('notification', handleNotification);
    socketIOService.on('connected', handleConnected);
    socketIOService.on('disconnected', handleDisconnected);

    return () => {
      socketIOService.off('order-status-changed', handleOrderStatusChange);
      socketIOService.off('notification', handleNotification);
      socketIOService.off('connected', handleConnected);
      socketIOService.off('disconnected', handleDisconnected);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: isConnected ? '#e3f2fd' : '#fff3e0',
        borderRadius: '8px',
        border: `1px solid ${isConnected ? '#1976d2' : '#ff9800'}`,
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#4caf50' : '#ff9800',
          animation: isConnected && notificationCount > 0 ? 'pulse 1.5s infinite' : 'none',
        }}
      />
      <span style={{ fontSize: '12px', color: '#666' }}>
        {isConnected ? 'Live' : 'Offline'} • Updates: {notificationCount}
      </span>
      {lastStatus && (
        <span style={{ fontSize: '12px', color: '#1976d2', fontWeight: 'bold' }}>
          {lastStatus}
        </span>
      )}
    </div>
  );
}

export default OrderStatusBadgeSocket;
