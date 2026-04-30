import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { DELIVERY_API_URL } from "../config/constants";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as OrdersIcon,
  AccountBalanceWallet as EarningsIcon,
  AccountBalanceWallet as WithdrawalIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  LocalShipping as DeliveryIcon,
} from "@mui/icons-material";

const drawerWidth = 280;

function DeliveryLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  // Delivery boy data - will be fetched from API
  const [deliveryBoyData, setDeliveryBoyData] = useState({
    name: "Delivery Boy",
    email: "delivery@apnadecoration.com",
    status: "Active",
    profileImage: null,
  });

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Orders", icon: <OrdersIcon />, path: "/orders" },
    { text: "Earnings", icon: <EarningsIcon />, path: "/earnings" },
    { text: "Withdrawal", icon: <WithdrawalIcon />, path: "/withdrawal" },
    { text: "Profile", icon: <ProfileIcon />, path: "/profile" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("deliveryBoyToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Load delivery boy data
    loadDeliveryBoyData();
  }, [router]);

  const loadDeliveryBoyData = async () => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");

      // TEMP DEBUG: Log token status
      console.log(
        "🔍 Delivery Boy Token:",
        token ? "Token found" : "No token found",
      );

      if (!token) {
        console.log("🔄 No delivery boy token, redirecting to login...");
        router.push("/auth/login");
        return;
      }

      const response = await axios.get(`${DELIVERY_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiData = response.data.data || response.data;
      const mappedData = {
        name:
          `${apiData.firstName || ""} ${apiData.lastName || ""}`.trim() ||
          "Delivery Boy",
        email: apiData.email || "delivery@apnadecoration.com",
        status: apiData.status === "active" ? "Active" : "Inactive",
        profileImage: apiData.profileImage || null,
      };

      setDeliveryBoyData(mappedData);
    } catch (error) {
      console.error("Error loading delivery boy data:", error);
      // Keep default values if API fails
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push("/profile");
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    router.push("/settings");
    handleMenuClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryBoyToken");
    router.push("/auth/login");
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background:
            "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          color: "white",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          🚚 Delivery Portal
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {deliveryBoyData.name}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

      {/* Navigation Menu */}
      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              backgroundColor:
                router.pathname === item.path
                  ? "rgba(47, 102, 255, 0.2)"
                  : "transparent",
              color: router.pathname === item.path ? "#2F66FF" : "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: router.pathname === item.path ? "#2F66FF" : "white",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                "& .MuiListItemText-primary": {
                  fontWeight: router.pathname === item.path ? 600 : 400,
                  color: router.pathname === item.path ? "#2F66FF" : "white",
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", my: 2 }} />

      {/* Delivery Boy Info */}
      <Box sx={{ p: 2 }}>
        <Paper
          sx={{
            p: 2,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Delivery Info
          </Typography>
          <Typography
            variant="caption"
            color="rgba(255, 255, 255, 0.8)"
            display="block"
          >
            {deliveryBoyData.name}
          </Typography>
          <Typography
            variant="caption"
            color="rgba(255, 255, 255, 0.8)"
            display="block"
          >
            {deliveryBoyData.email}
          </Typography>
          <Typography
            variant="caption"
            color="rgba(255, 255, 255, 0.8)"
            display="block"
            sx={{ mt: 1 }}
          >
            Status:{" "}
            <span style={{ color: "#28C76F" }}>● {deliveryBoyData.status}</span>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ minHeight: "64px" }}>
          {/* LEFT SIDE - Hamburger and Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexGrow: 1,
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                whiteSpace: "nowrap",
              }}
            >
              Delivery Portal
            </Typography>
          </Box>

          {/* RIGHT SIDE - Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", sm: "block" }, color: "#64748b" }}
            >
              {deliveryBoyData.name}
            </Typography>
            <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
              <Avatar
                src={deliveryBoyData.profileImage}
                sx={{
                  backgroundColor: "#2F66FF",
                  width: 40,
                  height: 40,
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {!deliveryBoyData.profileImage &&
                  deliveryBoyData.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0",
                },
              }}
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <ProfileIcon fontSize="small" sx={{ color: "#64748b" }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: "#1e293b" }}>
                  Profile
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleSettingsClick}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" sx={{ color: "#64748b" }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: "#1e293b" }}>
                  Settings
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: "#64748b" }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: "#1e293b" }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#1e293b",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#1e293b",
              borderRight: "1px solid rgba(255, 255, 255, 0.12)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default DeliveryLayout;
