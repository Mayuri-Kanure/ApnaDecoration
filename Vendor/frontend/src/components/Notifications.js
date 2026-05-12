import React, { useState, useEffect } from "react";
import {
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ThumbUp as ThumbsUpIcon,
  ThumbDown as ThumbsDownIcon,
  Comment as CommentIcon,
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import vendorApi from "../services/vendorApi";

const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log("🔔 Notifications - Fetching real notifications from API");

      const response = await vendorApi.getVendorNotifications();
      console.log("📦 Notifications API response:", response);

      // Handle different response formats
      let notificationsData = [];
      let unreadCount = 0;

      if (response && response.success && response.notifications) {
        notificationsData = response.notifications;
        unreadCount = response.notifications.filter((n) => !n.read).length;
      } else if (response && Array.isArray(response)) {
        notificationsData = response;
        unreadCount = response.filter((n) => !n.read).length;
      } else if (response && response.data) {
        notificationsData = response.data;
        unreadCount = Array.isArray(response.data)
          ? response.data.filter((n) => !n.read).length
          : 0;
      }

      setNotifications(notificationsData);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
    handleClose();
  };

  const getNotificationIcon = (type, icon, color) => {
    const iconStyle = {
      fontSize: 20,
      color: color,
    };

    switch (type) {
      case "order":
        return <OrderIcon sx={iconStyle} />;
      case "payment":
        return <PaymentIcon sx={iconStyle} />;
      case "inventory":
        return <InventoryIcon sx={iconStyle} />;
      case "review":
        return <StarIcon sx={iconStyle} />;
      default:
        return <InfoIcon sx={iconStyle} />;
    }
  };

  const formatTime = (timeString) => {
    // Simple time formatting - in real app, use proper date formatting
    return timeString;
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          position: "relative",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount > 0 ? unreadCount : null}
          color="error"
          max={99}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 360,
            maxWidth: 400,
            maxHeight: 480,
            overflow: "auto",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead} sx={{ fontSize: 12 }}>
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="#64748b">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  p: 2,
                  borderBottom: "1px solid #f1f5f9",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                  cursor: "pointer",
                  opacity: notification.read ? 0.7 : 1,
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(
                    notification.type,
                    notification.icon,
                    notification.color,
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          fontSize: 14,
                          color: "#1e293b",
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Chip
                          label="New"
                          size="small"
                          color="primary"
                          sx={{
                            ml: 1,
                            fontSize: 10,
                            height: 18,
                            fontWeight: "bold",
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 12,
                        color: "#64748b",
                        mt: 0.5,
                      }}
                    >
                      {notification.message}
                    </Typography>
                  }
                />
                <Box
                  sx={{
                    ml: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    {formatTime(notification.time)}
                  </Typography>
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#2F66FF",
                        mt: 0.5,
                      }}
                    />
                  )}
                </Box>
              </ListItem>
            ))
          )}
        </List>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e2e8F0",
              textAlign: "center",
            }}
          >
            <Button
              variant="text"
              size="small"
              onClick={handleClose}
              sx={{ fontSize: 13 }}
            >
              View all notifications
            </Button>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default Notifications;
