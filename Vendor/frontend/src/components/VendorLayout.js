import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as ProductIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Receipt as OrdersIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const VendorLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();

  // Use real vendor data from auth context
  const vendorData = {
    name: user?.name || user?.username || 'Vendor',
    email: user?.email || 'vendor@example.com',
    shopName: user?.shopName || user?.businessName || 'Vendor Shop'
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      text: 'My Products',
      icon: <ProductIcon />,
      path: '/products'
    },
    {
      text: 'Orders',
      icon: <OrdersIcon />,
      path: '/orders'
    },
    {
      text: 'Add Product',
      icon: <AddIcon />,
      path: '/products/add'
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile'
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Vendor Portal
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {vendorData.shopName}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

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
              backgroundColor: location.pathname === item.path ? 'rgba(47, 102, 255, 0.2)' : 'transparent',
              color: location.pathname === item.path ? '#2F66FF' : 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#2F66FF' : 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? '#2F66FF' : 'white'
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />

      {/* Vendor Info */}
      <Box sx={{ p: 2 }}>
        <Paper sx={{ 
          p: 2, 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Vendor Info
          </Typography>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.8)" display="block">
            {vendorData.name}
          </Typography>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.8)" display="block">
            {vendorData.email}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 1200
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Vendor Portal
            </Typography>
          </Box>
          
          {/* Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#64748b' }}>
              {vendorData.name}
            </Typography>
            <IconButton
              onClick={handleMenuClick}
              sx={{ p: 0 }}
            >
              <Avatar sx={{ 
                backgroundColor: '#2F66FF', 
                width: 40, 
                height: 40,
                fontSize: '16px',
                fontWeight: 600
              }}>
                {vendorData.name.charAt(0).toUpperCase()}
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
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0'
                }
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" sx={{ color: '#64748b' }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: '#1e293b' }}>Profile</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: '#64748b' }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: '#1e293b' }}>Logout</Typography>
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
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
              color: 'white'
            },
          }}
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
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        <Toolbar /> {/* Spacer for app bar */}
        <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default VendorLayout;
