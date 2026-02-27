import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Business as BusinessIcon,
  ShoppingCart as CartIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'product_approved': <CheckIcon color="success" />,
      'product_denied': <WarningIcon color="error" />,
      'product_needs_changes': <InfoIcon color="warning" />,
      'order_update': <CartIcon color="info" />,
      'system': <BusinessIcon color="default" />
    };
    return icons[type] || <InfoIcon color="default" />;
  };

  const getNotificationColor = (priority) => {
    const colors = {
      'urgent': 'error',
      'high': 'warning',
      'medium': 'info',
      'low': 'default'
    };
    return colors[priority] || 'default';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllAsRead}
              disabled={loading}
              startIcon={<DoneAllIcon />}
              sx={{ textTransform: 'none' }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 320, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <MenuItem
                key={notification._id}
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: notification.read ? 'transparent' : '#f8fafc',
                  borderLeft: notification.read ? 'none' : '3px solid #1976d2',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.priority}
                        size="small"
                        color={getNotificationColor(notification.priority)}
                        sx={{ fontSize: '0.65rem', height: 18 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={handleMenuClose}
                sx={{ textTransform: 'none', color: '#1976d2' }}
              >
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </Box>
  );
}

export default NotificationCenter;
