import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Store,
  Star,
  DateRange,
  Download
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalServices: 0,
      conversionRate: 0,
      averageOrderValue: 0
    },
    revenue: [],
    orders: [],
    topProducts: [],
    topServices: [],
    customerGrowth: [],
    paymentMethods: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Simulate API calls - in real implementation, these would be actual API endpoints
      const [overviewRes, revenueRes, ordersRes, productsRes, servicesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/overview?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/analytics/revenue?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/analytics/orders?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/analytics/top-products?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/analytics/top-services?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAnalytics({
        overview: overviewRes.data || {
          totalRevenue: 1250000,
          totalOrders: 245,
          totalCustomers: 189,
          totalProducts: 156,
          totalServices: 24,
          conversionRate: 3.2,
          averageOrderValue: 5102
        },
        revenue: revenueRes.data || generateMockRevenue(),
        orders: ordersRes.data || generateMockOrders(),
        topProducts: productsRes.data || generateMockTopProducts(),
        topServices: servicesRes.data || generateMockTopServices()
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set mock data on error
      setAnalytics({
        overview: {
          totalRevenue: 1250000,
          totalOrders: 245,
          totalCustomers: 189,
          totalProducts: 156,
          totalServices: 24,
          conversionRate: 3.2,
          averageOrderValue: 5102
        },
        revenue: generateMockRevenue(),
        orders: generateMockOrders(),
        topProducts: generateMockTopProducts(),
        topServices: generateMockTopServices()
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockRevenue = () => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      revenue: Math.floor(Math.random() * 50000) + 10000,
      orders: Math.floor(Math.random() * 20) + 5
    }));
  };

  const generateMockOrders = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `ORD${1000 + i}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      customer: `Customer ${i + 1}`,
      amount: Math.floor(Math.random() * 10000) + 1000,
      status: ['completed', 'processing', 'pending'][Math.floor(Math.random() * 3)],
      paymentMethod: ['cod', 'card', 'upi'][Math.floor(Math.random() * 3)]
    }));
  };

  const generateMockTopProducts = () => {
    return [
      { name: 'Wedding Decoration Package', sales: 45, revenue: 225000 },
      { name: 'Birthday Party Setup', sales: 38, revenue: 114000 },
      { name: 'Corporate Event', sales: 32, revenue: 96000 },
      { name: 'Anniversary Special', sales: 28, revenue: 84000 },
      { name: 'Festival Decoration', sales: 25, revenue: 75000 }
    ];
  };

  const generateMockTopServices = () => {
    return [
      { name: 'Wedding Planning', bookings: 18, revenue: 180000 },
      { name: 'Birthday Decoration', bookings: 15, revenue: 120000 },
      { name: 'Corporate Events', bookings: 12, revenue: 96000 },
      { name: 'Anniversary Setup', bookings: 10, revenue: 80000 },
      { name: 'Party Planning', bookings: 8, revenue: 64000 }
    ];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="div">
                    ₹{analytics.overview.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main' }}>
                  <TrendingUp />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.overview.totalOrders}
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main' }}>
                  <ShoppingCart />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.overview.totalCustomers}
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
                  <People />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.overview.conversionRate}%
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main' }}>
                  <TrendingUp />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Cash on Delivery', value: 45, color: '#0088FE' },
                      { name: 'Credit Card', value: 30, color: '#00C49F' },
                      { name: 'UPI', value: 20, color: '#FFBB28' },
                      { name: 'Net Banking', value: 5, color: '#FF8042' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Cash on Delivery', value: 45, color: '#0088FE' },
                      { name: 'Credit Card', value: 30, color: '#00C49F' },
                      { name: 'UPI', value: 20, color: '#FFBB28' },
                      { name: 'Net Banking', value: 5, color: '#FF8042' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={3}>
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Products
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Sales</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right">{product.sales}</TableCell>
                        <TableCell align="right">₹{product.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Services */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Services
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topServices.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell align="right">{service.bookings}</TableCell>
                        <TableCell align="right">₹{service.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Orders
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                size="small"
              >
                Export
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell align="right">₹{order.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            ...(order.status === 'completed' && { bgcolor: 'success.light', color: 'success.dark' }),
                            ...(order.status === 'processing' && { bgcolor: 'warning.light', color: 'warning.dark' }),
                            ...(order.status === 'pending' && { bgcolor: 'info.light', color: 'info.dark' })
                          }}
                        >
                          {order.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
};

export default Analytics;
