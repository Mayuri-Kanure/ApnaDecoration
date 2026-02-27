import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Chip,
  IconButton,
  FormControl,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Inventory as ProductsIcon,
  Store as StoreIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as TaxIcon,
  Pending as PendingIcon,
  CheckCircle as ConfirmedIcon,
  LocalMall as PackagingIcon,
  DeliveryDining as DeliveryIcon,
  Cancel as CanceledIcon,
  AssignmentReturn as ReturnedIcon,
  Error as FailedIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  Star as StarIcon,
  Person as PersonIcon,
  ShoppingBasket as CartIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderTimeRange, setOrderTimeRange] = useState('thisYear');
  const [earningTimeRange, setEarningTimeRange] = useState('thisYear');

  useEffect(() => {
    fetchDashboardData();
  }, [orderTimeRange, earningTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching dashboard data with token:', token ? 'Token present' : 'No token');
      console.log('🔍 API URL:', `${API_BASE_URL}/analytics/dashboard`);
      console.log('🔍 Params:', { orderTimeRange, earningTimeRange });
      
      const response = await axios.get(`${API_BASE_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { orderTimeRange, earningTimeRange }
      });
      
      console.log('🔍 Dashboard response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      // Set minimal default values when API fails
      setStats({
        totalOrders: 0,
        ordersThisMonth: 0,
        ordersLastMonth: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        totalCustomers: 0,
        customersThisMonth: 0,
        totalProducts: 0,
        lowStockCount: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        orderBreakdown: {
          pending: 0,
          confirmed: 0,
          packaging: 0,
          delivered: 0,
          canceled: 0,
          returned: 0,
          outForDelivery: 0,
          failedToDeliver: 0
        },
        adminWallet: {
          inHouseEarning: 0,
          commissionEarned: 0,
          deliveryChargeEarned: 0,
          totalTaxCollected: 0,
          pendingAmount: 0
        },
        orderStatistics: {
          inhouse: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          vendor: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        userOverview: {
          totalCustomers: 0,
          totalVendors: 0,
          totalDeliveryMen: 0,
          totalUsers: 0
        },
        earningStatistics: {
          inhouse: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          vendor: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          commission: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        topCustomers: [],
        popularStores: [],
        topSellingStore: {
          name: 'No data',
          revenue: 0.00
        },
        popularProducts: [],
        topSellingProducts: [],
        topDeliveryMan: {
          name: 'No data',
          delivered: 0,
          avatar: 'ND'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setOrderTimeRange(newTimeRange);
    }
  };

  const handleEarningTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setEarningTimeRange(newTimeRange);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  
  const orderStatusCards = [
    { title: 'Pending', count: stats?.pendingOrders || 0, color: '#00CFE8', icon: <PendingIcon /> },
    { title: 'Processing', count: stats?.processingOrders || 0, color: '#FF9F43', icon: <PackagingIcon /> },
    { title: 'Delivered', count: stats?.completedOrders || 0, color: '#28C76F', icon: <DeliveryIcon /> },
    { title: 'Canceled', count: stats?.cancelledOrders || 0, color: '#EA5455', icon: <CanceledIcon /> }
  ];

  const walletCards = [
    { title: 'In-House Earning', amount: stats?.adminWallet?.inHouseEarning || 0, icon: <MoneyIcon />, color: '#2F66FF' },
    { title: 'Commission Earned', amount: stats?.adminWallet?.commissionEarned || 0, icon: <TrendingUpIcon />, color: '#28C76F' },
    { title: 'Delivery Charge Earned', amount: stats?.adminWallet?.deliveryChargeEarned || 0, icon: <ShippingIcon />, color: '#00CFE8' },
    { title: 'Total Tax Collected', amount: stats?.adminWallet?.totalTaxCollected || 0, icon: <TaxIcon />, color: '#FF9F43' },
    { title: 'Pending Amount', amount: stats?.adminWallet?.pendingAmount || 0, icon: <WalletIcon />, color: '#EA5455' }
  ];

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', p: 3 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            mb: 1
          }}
        >
          Welcome APNA DECORATION
        </Typography>
        <Typography variant="h6" color="#64748b">
          Monitor your business analytics and statistics.
        </Typography>
      </Box>

      {/* Business Analytics Section */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Business Analytics</Typography>
        
        {/* Top Row - 4 Big Statistic Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: 'white' }}>
              <OrdersIcon sx={{ fontSize: 40, color: '#2F66FF', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {stats?.totalOrders || 0}
              </Typography>
              <Typography variant="body2" color="#64748b">Total Orders</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: 'white' }}>
              <StoreIcon sx={{ fontSize: 40, color: '#28C76F', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {stats?.totalStores || 0}
              </Typography>
              <Typography variant="body2" color="#64748b">Total Stores</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: 'white' }}>
              <ProductsIcon sx={{ fontSize: 40, color: '#FF9F43', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {stats?.totalProducts || 0}
              </Typography>
              <Typography variant="body2" color="#64748b">Total Products</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: 'white' }}>
              <CustomersIcon sx={{ fontSize: 40, color: '#00CFE8', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {stats?.totalCustomers || 0}
              </Typography>
              <Typography variant="body2" color="#64748b">Total Customers</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Second Row - Order Breakdown Cards */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Order Breakdown</Typography>
          <Grid container spacing={2}>
            {orderStatusCards.map((status, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ color: status.color, mr: 1 }}>
                      {status.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {status.title}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: status.color }}>
                    {status.count}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>

      {/* Admin Wallet Section */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Admin Wallet</Typography>
        <Grid container spacing={3}>
          {walletCards.slice(0, 4).map((wallet, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: 'white' }}>
                <Box sx={{ color: wallet.color, mb: 1 }}>
                  {wallet.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  ₹{wallet.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="#64748b">{wallet.title}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Pending Amount Card */}
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2, bgcolor: '#FEF3C7', border: '1px solid #F59E0B' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <WalletIcon sx={{ fontSize: 40, color: '#F59E0B', mr: 3 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#92400E' }}>
                      ₹{(walletCards[4].amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="body2" color="#78350F">
                      Pending Amount
                    </Typography>
                  </Box>
                </Box>
                <Button variant="contained" sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }}>
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Card>

      {/* NEW: Additional Dashboard Sections */}
      {/* Top Customer Section */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Top Customers</Typography>
        <Grid container spacing={2}>
          {stats?.topCustomers?.map((customer, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 1, bgcolor: 'white', cursor: 'pointer', '&:hover': { boxShadow: 2 } }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: '#2F66FF', width: 48, height: 48 }}>
                  {customer.avatar}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {customer.name}
                </Typography>
                <Typography variant="caption" color="#64748B">
                  Orders: {customer.orders}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Most Popular Stores & Top Selling Store */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <StoreIcon sx={{ fontSize: 24, color: '#2F66FF', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Most Popular Stores</Typography>
            </Box>
            {stats?.popularStores?.length > 0 ? (
              <Grid container spacing={2}>
                {stats.popularStores.map((store, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, bgcolor: 'white' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{store.name}</Typography>
                      <Typography variant="caption" color="#64748B">{store.orders} orders</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <StoreIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="body2" color="#64748B">No popular stores data available</Typography>
              </Box>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <StoreIcon sx={{ fontSize: 24, color: '#28C76F', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Top Selling Store</Typography>
            </Box>
            <Box textAlign="center">
              <StoreIcon sx={{ fontSize: 48, color: '#28C76F', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {stats?.topSellingStore?.name || 'Whole Seler'}
              </Typography>
              <Typography variant="body2" color="#64748B">
                ₹{stats?.topSellingStore?.revenue?.toFixed(2) || '0.00'}
              </Typography>
              <IconButton sx={{ mt: 1, color: '#28C76F' }}>
                <CartIcon />
              </IconButton>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Most Popular Products & Top Selling Products */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <ProductsIcon sx={{ fontSize: 24, color: '#FF9F43', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Most Popular Products</Typography>
            </Box>
            <Grid container spacing={2}>
              {stats?.popularProducts?.map((product, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, bgcolor: 'white' }}>
                    <Box sx={{ width: 60, height: 60, bgcolor: '#F3F4F6', borderRadius: 1, mb: 1, mx: 'auto' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      {product.name}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                      <StarIcon sx={{ fontSize: 16, color: '#FF9F43', mr: 0.5 }} />
                      <Typography variant="caption">
                        {product.rating} ({product.reviews} reviews)
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <TrendingUpIcon sx={{ fontSize: 24, color: '#2F66FF', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Top Selling Products</Typography>
            </Box>
            <List>
              {stats?.topSellingProducts?.map((product, index) => (
                <ListItem key={index} divider>
                  <ListItemAvatar>
                    <Box sx={{ width: 40, height: 40, bgcolor: '#F3F4F6', borderRadius: 1 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={`Sold: ${product.sold}`}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2F66FF' }}>
                    {product.sold}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Top Delivery Man */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <DeliveryIcon sx={{ fontSize: 24, color: '#00CFE8', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Top Delivery Man</Typography>
            </Box>
            <Box textAlign="center">
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#00CFE8' }}>
                {stats?.topDeliveryMan?.avatar || 'SS'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {stats?.topDeliveryMan?.name || 'shivansh sw'}
              </Typography>
              <Typography variant="body2" color="#64748B">
                Orders delivered: {stats?.topDeliveryMan?.delivered || 0}
              </Typography>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <PieChartIcon sx={{ fontSize: 24, color: '#2F66FF', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>User Overview</Typography>
            </Box>
            
            {/* Donut Chart Placeholder */}
            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', borderRadius: 2, border: '2px dashed #E2E8F0' }}>
              <Box textAlign="center">
                <Box sx={{ width: 120, height: 120, bgcolor: '#E2E8F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Typography variant="h6" color="#64748B" sx={{ fontWeight: 700 }}>
                    {stats?.userOverview?.totalUsers || 0}
                  </Typography>
                </Box>
                <Typography variant="body2" color="#94A3B8" sx={{ mb: 2 }}>
                  Total User
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <Box sx={{ width: 12, height: 12, bgcolor: '#2F66FF', mr: 1, borderRadius: 1 }} />
                    <Typography variant="caption">Total Customer ({stats?.userOverview?.totalCustomers || 0})</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <Box sx={{ width: 12, height: 12, bgcolor: '#FF9F43', mr: 1, borderRadius: 1 }} />
                    <Typography variant="caption">Total Vendor ({stats?.userOverview?.totalVendors || 0})</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <Box sx={{ width: 12, height: 12, bgcolor: '#1E40AF', mr: 1, borderRadius: 1 }} />
                    <Typography variant="caption">Total Delivery Man ({stats?.userOverview?.totalDeliveryMen || 0})</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
