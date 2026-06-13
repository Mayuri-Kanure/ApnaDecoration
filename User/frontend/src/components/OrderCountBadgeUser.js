import React from 'react';
import { Badge, IconButton, Tooltip, Box } from '@mui/material';
import { ShoppingCart as OrdersIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import usePendingOrdersCountUser from '../hooks/usePendingOrdersCountUser';

/**
 * User Panel Real-time Order Count Badge Component
 */
export const OrderCountBadgeUser = () => {
  const navigate = useNavigate();
  const { pendingOrdersCount, error } = usePendingOrdersCountUser(60000);

  const handleNavigateToOrders = () => {
    navigate('/admin/dashboard');
  };

  return (
    <Tooltip title={`${pendingOrdersCount} pending orders`}>
      <IconButton
        color="inherit"
        onClick={handleNavigateToOrders}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge
          badgeContent={pendingOrdersCount > 0 ? pendingOrdersCount : 0}
          color="error"
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#ea5455',
              color: '#ea5455',
              boxShadow: `0 0 0 2px white`,
              animation: pendingOrdersCount > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 2px white, 0 0 0 8px rgba(234, 84, 85, 0.3)',
                },
                '100%': {
                  boxShadow: '0 0 0 2px white, 0 0 0 16px rgba(234, 84, 85, 0)',
                },
              },
            },
          }}
        >
          <OrdersIcon sx={{ fontSize: 24 }} />
        </Badge>

        {/* Error indicator */}
        {error && (
          <Box
            sx={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#FFC107',
              bottom: 0,
              right: 0,
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default OrderCountBadgeUser;
