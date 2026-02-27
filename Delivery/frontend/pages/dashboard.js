import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Fab,
  CircularProgress
} from '@mui/material';
import {
  Person,
  LocalShipping,
  AttachMoney,
  TrendingUp,
  Assessment,
  Settings,
  AccountBalanceWallet,
  Assignment,
  Refresh,
  Notifications,
  CheckCircle,
  ShoppingCart,
  Support,
  Edit,
  Delete,
  FilterList,
  Search,
  AccessTime
} from '@mui/icons-material';

function TabPanel({ children = null, value = 0, index = 0, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

export default function DeliveryBoyDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dashboardData, setDashboardData] = useState({
    todayEarnings: 1250,
    totalDeliveries: 25,
    averageRating: 4.5,
    availableBalance: 8750,
    totalEarnings: 12500,
    weeklyEarnings: 4375,
    successfulDeliveries: 23,
    failedDeliveries: 2,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_DELIVERY_API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty data for now to see what API returns
      setDashboardData({
        todayEarnings: 0,
        totalDeliveries: 0,
        averageRating: 0,
        availableBalance: 0,
        totalEarnings: 0,
        weeklyEarnings: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1,
      p: 2
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
            Delivery Dashboard
          </Typography>
          <Typography variant="body1" color="#64748b">
            Welcome to your delivery dashboard - track your deliveries and earnings
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadDashboardData}
          disabled={loading}
          sx={{ 
            borderColor: '#2F66FF',
            color: '#2F66FF',
            '&:hover': { 
              borderColor: '#1e40af',
              backgroundColor: '#f8fafc'
            }
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Top Row - Main Statistics Card */}
      <Grid container spacing={3} sx={{ mb: 4, pr: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3, 
            boxShadow: 3, 
            bgcolor: 'white',
            border: '2px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #2F66FF20 0%, #2F66FF05 100%)',
              borderRadius: '0 0 0 100%'
            }} />
            {loading ? (
              <CircularProgress sx={{ position: 'relative', zIndex: 1 }} />
            ) : (
              <>
                <LocalShipping sx={{ fontSize: 60, color: '#2F66FF', mb: 2, position: 'relative', zIndex: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, position: 'relative', zIndex: 1 }}>
                  {dashboardData.totalDeliveries}
                </Typography>
                <Typography variant="h6" color="#64748b" sx={{ position: 'relative', zIndex: 1 }}>
                  Total Deliveries
                </Typography>
                <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>
                  All your deliveries in one place
                </Typography>
              </>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 3, 
            boxShadow: 3, 
            bgcolor: '#f0f9ff',
            border: '2px solid #bfdbfe',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <AttachMoney sx={{ fontSize: 60, color: '#2F66FF', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
              ₹{dashboardData.todayEarnings}
            </Typography>
            <Typography variant="h6" color="#64748b">
              Today's Earnings
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 3, 
            boxShadow: 3, 
            bgcolor: '#f0f9ff',
            border: '2px solid #bfdbfe',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <CheckCircle sx={{ fontSize: 60, color: '#2F66FF', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
              {dashboardData.averageRating} ⭐
            </Typography>
            <Typography variant="h6" color="#64748b">
              Average Rating
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 3, 
            boxShadow: 3, 
            bgcolor: '#f0f9ff',
            border: '2px solid #bfdbfe',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }
          }}>
            <AccountBalanceWallet sx={{ fontSize: 60, color: '#2F66FF', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
              ₹{dashboardData.availableBalance}
            </Typography>
            <Typography variant="h6" color="#64748b">
              Available Balance
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row - Performance and Quick Actions */}
      <Grid container spacing={3} sx={{ pr: 3, mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'white', border: '2px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
              Performance Overview
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                    Total Earnings
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2F66FF' }}>
                    ₹{dashboardData.totalEarnings}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                    Weekly Earnings
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2F66FF' }}>
                    ₹{dashboardData.weeklyEarnings}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                    Successful Deliveries
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#28C76F' }}>
                    {dashboardData.successfulDeliveries}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                    Failed Deliveries
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#EA5455' }}>
                    {dashboardData.failedDeliveries}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'white', border: '2px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
              Quick Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<LocalShipping />}
                fullWidth
                sx={{ 
                  p: 2,
                  backgroundColor: '#2F66FF',
                  '&:hover': { backgroundColor: '#1e40af' },
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Start New Delivery
              </Button>
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                fullWidth
                sx={{ 
                  p: 2,
                  borderColor: '#2F66FF',
                  color: '#2F66FF',
                  '&:hover': { backgroundColor: '#f0f9ff' },
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                View Orders
              </Button>
              <Button
                variant="outlined"
                startIcon={<AccountBalanceWallet />}
                fullWidth
                sx={{ 
                  p: 2,
                  borderColor: '#2F66FF',
                  color: '#2F66FF',
                  '&:hover': { backgroundColor: '#f0f9ff' },
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                View Earnings
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Grid container spacing={3} sx={{ pr: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, bgcolor: 'white', border: '2px solid #e2e8f0' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="dashboard tabs"
                sx={{
                  '& .MuiTab-root': {
                    color: '#64748b',
                    minHeight: 64,
                    fontWeight: 500,
                    textTransform: 'none'
                  },
                  '& .MuiTab-root.Mui-selected': {
                    color: '#2F66FF',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#2F66FF',
                    height: 3
                  }
                }}
              >
                <Tab icon={<Assessment />} label="Overview" />
                <Tab icon={<Assignment />} label="Recent Orders" />
                <Tab icon={<AccountBalanceWallet />} label="Earnings" />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#1e293b' }}>
                <Assessment sx={{ mr: 1, color: '#2F66FF' }} />
                Performance Overview
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                Your delivery performance metrics and earnings breakdown.
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                      Success Rate
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#28C76F' }}>
                      {dashboardData.totalDeliveries > 0 ? ((dashboardData.successfulDeliveries / dashboardData.totalDeliveries) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                      Average Delivery Time
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2F66FF' }}>
                      25 mins
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                      Total Distance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2F66FF' }}>
                      125 km
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                      Customer Rating
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: (dashboardData.averageRating || 0) >= 4 ? '#28C76F' : '#FF9F43' }}>
                      {(dashboardData.averageRating || 0).toFixed(1)} ⭐
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Recent Orders Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#1e293b' }}>
                <Assignment sx={{ mr: 1, color: '#2F66FF' }} />
                Recent Orders
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                View your recent delivery orders and their status.
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Order history will be available here. For now, please check the Orders page.
              </Alert>
            </TabPanel>

            {/* Earnings Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#1e293b' }}>
                <AccountBalanceWallet sx={{ mr: 1, color: '#2F66FF' }} />
                Earnings Summary
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                View your earnings history and withdrawal requests.
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Detailed earnings will be available here. For now, please check the Earnings page.
              </Alert>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#2F66FF',
          '&:hover': { backgroundColor: '#1e40af' }
        }}
        onClick={() => window.location.reload()}
      >
        <Refresh />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
