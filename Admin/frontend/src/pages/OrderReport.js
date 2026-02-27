import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiService from '../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const OrderReport = () => {
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('this_year');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState([]);

  // Load order data
  const loadOrderData = async () => {
    setLoading(true);
    try {
      const response = await apiService.request('/orders', {
        params: {
          orderStatus: filterType === 'all' ? undefined : filterType,
          search: searchQuery,
          page: page,
          limit: 10
        }
      });
      
      // Update order list with real data
      setOrderData(response.orders || response.data || []);
      
      // Update stats with real data
      if (response.stats) {
        setOrderStats(response.stats.orders || orderStats);
        setRevenueStats(response.stats.revenue || revenueStats);
        setPaymentStats(response.stats.payments || paymentStats);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadOrderData();
  }, [filterType, dateFilter, searchQuery, page]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleFilter = () => {
    loadOrderData();
  };

  const handleSearch = () => {
    loadOrderData();
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  // Fallback data (will be replaced by API data)
  const [orderStats, setOrderStats] = useState({
    total: 0,
    canceled: 0,
    ongoing: 0,
    completed: 0
  });

  const [revenueStats, setRevenueStats] = useState({
    total: 0,
    due: 0,
    settled: 0
  });

  const [paymentStats, setPaymentStats] = useState([
    { name: 'Cash on Delivery', value: 0, color: '#4caf50' },
    { name: 'Card', value: 0, color: '#2196f3' },
    { name: 'UPI', value: 0, color: '#ff9800' },
    { name: 'Net Banking', value: 0, color: '#9c27b0' },
    { name: 'Wallet', value: 0, color: '#e91e63' }
  ]);

  const monthlyData = [
    { month: 'Jan', revenue: 245000 },
    { month: 'Feb', revenue: 298000 },
    { month: 'Mar', revenue: 312000 },
    { month: 'Apr', revenue: 289000 },
    { month: 'May', revenue: 334000 },
    { month: 'Jun', revenue: 367777 }, // Real order amount
    { month: 'Jul', revenue: 389000 },
    { month: 'Aug', revenue: 412000 },
    { month: 'Sep', revenue: 378000 },
    { month: 'Oct', revenue: 401000 },
    { month: 'Nov', revenue: 387000 },
    { month: 'Dec', revenue: 425000 }
  ];

  // Use real order data from API instead of mock data
  const orderList = orderData.map(order => ({
    id: order.orderNumber || order._id,
    totalAmount: order.pricing?.total || 0,
    productDiscount: 0, // Not in real schema
    couponDiscount: 0, // Not in real schema
    shippingCharge: order.pricing?.shipping || 0,
    vat: order.pricing?.tax || 0,
    commission: 0, // Not in real schema
    deliverymanIncentive: 0, // Not in real schema
    status: order.status || 'pending'
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#4caf50';
      case 'confirmed':
        return '#2196f3';
      case 'processing':
        return '#ff9800';
      case 'pending':
        return '#9e9e9e';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
        Order Report
      </Typography>

      {/* Filter Bar */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="vendor">Vendor</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                >
                  <MenuItem value="this_year">This Year</MenuItem>
                  <MenuItem value="this_month">This Month</MenuItem>
                  <MenuItem value="custom_range">Custom Date Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleFilter}
                sx={{
                  backgroundColor: '#1976d2',
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
                }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Orders */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon sx={{ fontSize: 32, color: '#1976d2', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Orders
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2', mb: 2 }}>
                {orderStats.total.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#f44336', borderRadius: '50%' }} />
                  <Typography variant="body2" color="text.secondary">
                    Cancelled: {orderStats.canceled}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#ff9800', borderRadius: '50%' }} />
                  <Typography variant="body2" color="text.secondary">
                    Pending: {orderStats.ongoing}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#4caf50', borderRadius: '50%' }} />
                  <Typography variant="body2" color="text.secondary">
                    Delivered: {orderStats.completed}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ fontSize: 32, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Order Amount
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#4caf50', mb: 2 }}>
                ₹{(revenueStats.total / 1000).toFixed(1)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                    Due: ₹{(revenueStats.due / 1000).toFixed(1)}K
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    Settled: ₹{(revenueStats.settled / 1000).toFixed(1)}K
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Order Statistics Line Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Order Statistics
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Line Chart: Monthly Revenue Trend
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Statistics Donut Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Payment Statistics
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Donut Chart
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  ₹18.5K+
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                {paymentStats.map((stat) => (
                  <Box key={stat.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: stat.color, borderRadius: '50%', mr: 1 }} />
                    <Typography variant="body2">
                      {stat.name}: {stat.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order List Table */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Order List
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search Order ID"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{
                  backgroundColor: '#1976d2',
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Search
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{
                  backgroundColor: '#4caf50',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#45a049'
                  }
                }}
              >
                Export
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Product Discount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Coupon Discount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Shipping Charge</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>VAT/TAX</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Commission</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Deliveryman Incentive</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderList.map((order, index) => (
                  <TableRow 
                    key={order.id}
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{order.id}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{order.productDiscount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{order.couponDiscount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{order.shippingCharge.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{order.vat.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{order.commission.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{order.deliverymanIncentive.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          display: 'inline-block',
                          backgroundColor: getStatusColor(order.status) + '20',
                          color: getStatusColor(order.status)
                        }}
                      >
                        {getStatusText(order.status)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={10}
              page={page}
              onChange={handlePageChange}
              shape="rounded"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                },
                '& .MuiPaginationItem-page.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                },
                '& .MuiPaginationItem-page': {
                  color: '#546e7a',
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderReport;
