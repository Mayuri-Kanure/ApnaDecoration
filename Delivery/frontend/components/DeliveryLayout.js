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
} from "@mui/icons-material";

const drawerWidth = 280;

function DeliveryLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Delivery boy data
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

  // FIX FOR STATIC EXPORT
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("deliveryBoyToken");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    loadDeliveryBoyData();
  }, [mounted]);

  const loadDeliveryBoyData = async () => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await axios.get(`${DELIVERY_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      {/* Navigation */}
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
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* TOP BAR */}
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
              }}
            >
              Delivery Portal
            </Typography>
          </Box>

          {/* PROFILE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "block" },
                color: "#64748b",
              }}
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
            >
              <MenuItem onClick={handleProfileClick}>
                <ProfileIcon sx={{ mr: 1 }} />
                Profile
              </MenuItem>

              <MenuItem onClick={handleSettingsClick}>
                <SettingsIcon sx={{ mr: 1 }} />
                Settings
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
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
          open
          sx={{
            display: { xs: "none", md: "block" },

            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#1e293b",
              borderRight: "1px solid rgba(255,255,255,0.12)",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },

          minHeight: "100%",

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
