import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Select,
  FormControl,
  Badge,
  Button,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon,
  ShoppingCart as CartIcon,
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useProfile } from '../contexts/ProfileContext';

const drawerWidth = 280;

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { profileData } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const collapsedWidth = 70;

  const getAppBarWidth = () => {
    if (sidebarCollapsed) {
      return { sm: `calc(100% - ${collapsedWidth}px)` };
    }
    return { sm: `calc(100% - ${drawerWidth}px)` };
  };

  const getAppBarMargin = () => {
    if (sidebarCollapsed) {
      return { sm: `${collapsedWidth}px` };
    }
    return { sm: `${drawerWidth}px` };
  };

  const getMainWidth = () => {
    if (sidebarCollapsed) {
      return { sm: `calc(100% - ${collapsedWidth}px)` };
    }
    return { sm: `calc(100% - ${drawerWidth}px)` };
  };

  const getMainMargin = () => {
    if (sidebarCollapsed) {
      return { sm: `${collapsedWidth}px` };
    }
    return { sm: `${drawerWidth}px` };
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box component="nav">
          <Sidebar 
            drawerWidth={drawerWidth}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            onSidebarCollapse={handleSidebarCollapse}
          />
        </Box>
        <AppBar
          position="fixed"
          sx={{
            width: getAppBarWidth(),
            ml: getAppBarMargin(),
            bgcolor: '#1e293b',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'width 0.3s ease, margin-left 0.3s ease'
          }}
        >
          <Toolbar sx={{ minHeight: 80 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }} />

            {/* Language Selector */}
            <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
              <Select
                value="en"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
                startAdornment={<LanguageIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>

            {/* Notification Icon */}
            <Tooltip title="3 new notifications">
              <IconButton 
                sx={{ 
                  mr: 2, 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Cart Icon */}
            <Tooltip title="5 items in cart">
              <IconButton 
                sx={{ 
                  mr: 2, 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Badge badgeContent={5} color="success">
                  <CartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Avatar & Menu */}
            <Button
              onClick={handleMenuClick}
              sx={{
                color: 'white',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6' }} src={profileData.profilePhoto}>
                {!profileData.profilePhoto && (profileData.fullName?.charAt(0) || 'A')}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2 }}>
                  {profileData.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Administrator
                </Typography>
              </Box>
              <ExpandMoreIcon />
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: { mt: 1, minWidth: 200 }
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <Typography variant="body2">{profileData.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileClick}>Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: getMainWidth(),
            ml: getMainMargin(),
            minHeight: '100vh',
            transition: 'width 0.3s ease, margin-left 0.3s ease'
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;