import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { LocalShipping as DeliveryIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import socketIOService from '../services/socketIOService';

/**
 * Real-time delivery assignment count badge (Next.js)
 */
function OrderCountBadgeDeliverySocket() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(socketIOService.isConnectedToServer());

    const handleDeliveryAssignment = (data) => {
      console.log('🚚 New delivery assignment via Socket:', data);
      setPendingCount((prev) => prev + 1);
    };

    const handleConnected = () => {
      console.log('✅ Delivery Socket.io connected');
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      console.log('❌ Delivery Socket.io disconnected');
      setIsConnected(false);
    };

    socketIOService.on('delivery-assignment', handleDeliveryAssignment);
    socketIOService.on('connected', handleConnected);
    socketIOService.on('disconnected', handleDisconnected);

    return () => {
      socketIOService.off('delivery-assignment', handleDeliveryAssignment);
      socketIOService.off('connected', handleConnected);
      socketIOService.off('disconnected', handleDisconnected);
    };
  }, []);

  return (
    <Tooltip title={isConnected ? 'Live deliveries' : 'Connecting...'}>
      <IconButton
        onClick={() => router.push('/orders')}
        sx={{
          position: 'relative',
          opacity: isConnected ? 1 : 0.6,
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
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.2)' },
                '100%': { transform: 'scale(1)' },
              },
            },
          }}
        >
          <DeliveryIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

export default OrderCountBadgeDeliverySocket;
