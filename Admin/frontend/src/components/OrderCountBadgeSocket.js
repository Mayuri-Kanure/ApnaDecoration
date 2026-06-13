import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import socketIOService from '../services/socketIOService';
import '../styles/OrderCountBadge.css';

/**
 * Real-time order count badge using Socket.io
 * Replaces polling-based badge with instant WebSocket updates
 */
function OrderCountBadgeSocket() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check socket connection
    const checkConnection = () => {
      setIsConnected(socketIOService.isConnectedToServer());
    };

    checkConnection();

    // Handle new order notification
    const handleNewOrder = (data) => {
      console.log('📦 New order via Socket.io:', data);
      setPendingCount((prev) => prev + 1);
    };

    // Handle connection event
    const handleConnected = () => {
      console.log('✅ Socket.io connected to server');
      setIsConnected(true);
    };

    // Handle disconnection event
    const handleDisconnected = () => {
      console.log('❌ Socket.io disconnected');
      setIsConnected(false);
    };

    // Register listeners
    socketIOService.on('new-order-notification', handleNewOrder);
    socketIOService.on('connected', handleConnected);
    socketIOService.on('disconnected', handleDisconnected);

    return () => {
      socketIOService.off('new-order-notification', handleNewOrder);
      socketIOService.off('connected', handleConnected);
      socketIOService.off('disconnected', handleDisconnected);
    };
  }, []);

  return (
    <Tooltip title={isConnected ? 'Live orders' : 'Connecting...'}>
      <IconButton
        onClick={() => navigate('/orders')}
        sx={{
          position: 'relative',
          opacity: isConnected ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Badge
          badgeContent={pendingCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              animation:
                pendingCount > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
        {!isConnected && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'orange',
              animation: 'blink 1s infinite',
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default OrderCountBadgeSocket;
