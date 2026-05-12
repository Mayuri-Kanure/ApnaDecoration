import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  LocalShipping,
  Assignment,
  AttachMoney,
  AccountBalanceWallet,
  Notifications,
  Settings,
  Person,
  Logout,
  Menu as MenuIcon,
  LocationOn,
  Star,
  Timeline,
  Work,
  GpsFixed,
  OnlinePrediction,
  Phone,
  Email,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import deliveryApi from '../src/services/deliveryApi';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Available Orders', icon: <Assignment />, path: '/orders/available' },
  { text: 'Assigned Orders', icon: <LocalShipping />, path: '/orders/assigned' },
  { text: 'Completed Deliveries', icon: <Assignment />, path: '/orders/completed' },
  { text: 'Live Tracking', icon: <GpsFixed />, path: '/tracking' },
  { text: 'Earnings', icon: <AttachMoney />, path: '/earnings' },
  { text: 'Withdrawals', icon: <AccountBalanceWallet />, path: '/withdrawal' },
  { text: 'Ratings', icon: <Star />, path: '/ratings' },
  { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
  { text: 'Profile', icon: <Person />, path: '/profile' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

function EnhancedDeliveryLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await deliveryApi.getProfile();
      if (response.success) {
        setProfile(response.data);
        setIsOnline(response.data.availability);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await deliveryApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
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

  const handleLogout = async () => {
    try {
      await deliveryApi.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
    }
  };

  const toggleAvailability = async () => {
    try {
      const newAvailability = !isOnline;
      await deliveryApi.updateAvailability(newAvailability);
      setIsOnline(newAvailability);
      if (profile) {
        setProfile({ ...profile, availability: newAvailability });
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <LocalShipping sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Delivery Partner
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      {/* Profile Section */}
      {profile && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={profile.profileImage}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {profile.firstName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {profile.deliveryBoyId}
              </Typography>
            </Box>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={isOnline}
                onChange={toggleAvailability}
                size="small"
                color="success"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <OnlinePrediction
                  sx={{
                    fontSize: 16,
                    mr: 0.5,
                    color: isOnline ? 'success.main' : 'error.main'
                  }}
                />
                <Typography variant="caption">
                  {isOnline ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            }
          />
          
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              label={`${profile.totalDeliveries || 0} Deliveries`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`⭐ ${profile.averageRating?.toFixed(1) || '0.0'}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      )}
      
      <Divider />
      
      <List sx={{ px: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : 'action.hover',
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? 'primary.contrastText' : 'inherit',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.text === 'Notifications' ? (
                  <Badge badgeContent={unreadCount} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItem>
          );
        })}
      </List>
      
      <Divider />
      
      <List sx={{ px: 1, py: 1 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'error.contrastText',
            },
            '& .MuiListItemIcon-root': {
              color: 'inherit',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => router.pathname === item.path)?.text || 'Dashboard'}
          </Typography>

          {/* Quick Stats */}
          {profile && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mr: 2 }}>
              <Tooltip title="Today's Earnings">
                <Chip
                  icon={<AttachMoney />}
                  label={`₹${profile.todayEarnings || 0}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Tooltip>
              <Tooltip title="Active Orders">
                <Chip
                  icon={<LocalShipping />}
                  label={`${profile.activeOrders || 0}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
            </Box>
          )}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={() => handleNavigation('/notifications')}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Tooltip title="Profile">
            <IconButton
              color="inherit"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              <Avatar
                src={profile?.profileImage}
                sx={{ width: 32, height: 32 }}
              >
                {profile?.firstName?.[0]}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
              },
            }}
          >
            <MenuItem onClick={() => { handleNavigation('/profile'); handleMenuClose(); }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleNavigation('/settings'); handleMenuClose(); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default EnhancedDeliveryLayout;
