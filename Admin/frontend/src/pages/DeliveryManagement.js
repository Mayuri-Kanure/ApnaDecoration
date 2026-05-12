import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Pagination,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LocalShipping,
  Person,
  AttachMoney,
  Assessment,
  Timeline,
  Map,
  GpsFixed,
  CheckCircle,
  Cancel,
  Pending,
  Error,
  Refresh,
  Assignment,
  AccountBalanceWallet,
  Star,
  TrendingUp,
  FilterList,
  Search,
  Phone,
  Email,
  LocationOn,
  AccessTime,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { deliveryAPI } from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`delivery-tabpanel-${index}`}
      aria-labelledby={`delivery-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function DeliveryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [orders, setOrders] = useState([]);
  const [liveTracking, setLiveTracking] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState({ open: false, orderId: null, deliveryBoyId: '' });
  const [withdrawalDialog, setWithdrawalDialog] = useState({ open: false, withdrawalId: null, status: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '', priority: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (tabValue === 1) fetchDeliveryBoys();
    if (tabValue === 2) fetchOrders();
    if (tabValue === 3) fetchLiveTracking();
    if (tabValue === 4) fetchAnalytics();
    if (tabValue === 5) fetchWithdrawals();
    if (tabValue === 6) fetchRatings();
  }, [tabValue]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getDeliveryDashboard();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await deliveryAPI.getDeliveryBoys(filters);
      if (response.success) {
        setDeliveryBoys(response.data.deliveryBoys);
      }
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await deliveryAPI.getDeliveryOrders(filters);
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchLiveTracking = async () => {
    try {
      const response = await deliveryAPI.getLiveTracking();
      if (response.success) {
        setLiveTracking(response.data);
      }
    } catch (error) {
      console.error('Error fetching live tracking:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await deliveryAPI.getDeliveryAnalytics('month');
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await deliveryAPI.getDeliveryWithdrawals({ status: 'pending' });
      if (response.success) {
        setWithdrawals(response.data.withdrawals);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await deliveryAPI.getDeliveryRatings();
      if (response.success) {
        setRatings(response.data.ratings);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAssignOrder = async () => {
    try {
      const response = await deliveryAPI.assignOrder(assignDialog.orderId, {
        deliveryBoyId: assignDialog.deliveryBoyId
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Order assigned successfully',
          severity: 'success'
        });
        setAssignDialog({ open: false, orderId: null, deliveryBoyId: '' });
        fetchOrders();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error assigning order',
        severity: 'error'
      });
    }
  };

  const handleWithdrawalStatus = async () => {
    try {
      const response = await deliveryAPI.updateWithdrawalStatus(withdrawalDialog.withdrawalId, {
        status: withdrawalDialog.status,
        notes: withdrawalDialog.notes
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Withdrawal ${withdrawalDialog.status} successfully`,
          severity: 'success'
        });
        setWithdrawalDialog({ open: false, withdrawalId: null, status: '', notes: '' });
        fetchWithdrawals();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating withdrawal status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'accepted': return 'primary';
      case 'picked_up': return 'secondary';
      case 'in_transit': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Delivery Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage delivery operations, track orders, and monitor performance
        </Typography>
      </Box>

      {/* Dashboard Overview */}
      {dashboardStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Pending sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">
                    {dashboardStats.stats.pendingOrders}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Pending Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    {dashboardStats.stats.inTransitOrders}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  In Transit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">
                    {dashboardStats.stats.deliveredOrders}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Delivered Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">
                    {dashboardStats.stats.activeDeliveryBoys}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Active Delivery Boys
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Dashboard" icon={<Assessment />} />
          <Tab label="Delivery Boys" icon={<Person />} />
          <Tab label="Orders" icon={<Assignment />} />
          <Tab label="Live Tracking" icon={<GpsFixed />} />
          <Tab label="Analytics" icon={<Timeline />} />
          <Tab label="Withdrawals" icon={<AccountBalanceWallet />} />
          <Tab label="Ratings" icon={<Star />} />
        </Tabs>

        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Delivery Boy</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardStats?.recentOrders?.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order.orderId}</TableCell>
                            <TableCell>{order.customerId?.name}</TableCell>
                            <TableCell>
                              {order.deliveryBoyId 
                                ? `${order.deliveryBoyId.firstName} ${order.deliveryBoyId.lastName}`
                                : 'Not Assigned'
                              }
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.status}
                                color={getStatusColor(order.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Assignment />}
                      onClick={() => setTabValue(2)}
                    >
                      Manage Orders
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Person />}
                      onClick={() => setTabValue(1)}
                    >
                      View Delivery Boys
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<GpsFixed />}
                      onClick={() => setTabValue(3)}
                    >
                      Live Tracking
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AccountBalanceWallet />}
                      onClick={() => setTabValue(5)}
                    >
                      Pending Withdrawals
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Delivery Boys Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Total Deliveries</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryBoys.map((boy) => (
                  <TableRow key={boy._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {boy.firstName?.[0]}
                        </Avatar>
                        {boy.firstName} {boy.lastName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{boy.phone}</Typography>
                        <Typography variant="caption" color="text.secondary">{boy.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={boy.status}
                        color={getStatusColor(boy.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={boy.availability ? 'Available' : 'Unavailable'}
                        color={boy.availability ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{boy.totalDeliveries}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                        {boy.averageRating?.toFixed(1) || '0.0'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Phone />
                      </IconButton>
                      <IconButton size="small">
                        <Email />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchOrders}
            >
              Refresh
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Delivery Boy</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{order.customerId?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.customerId?.phone}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {order.deliveryBoyId 
                        ? `${order.deliveryBoyId.firstName} ${order.deliveryBoyId.lastName}`
                        : (
                          <Button
                            size="small"
                            onClick={() => setAssignDialog({ 
                              open: true, 
                              orderId: order._id, 
                              deliveryBoyId: '' 
                            })}
                          >
                            Assign
                          </Button>
                        )
                      }
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <LocationOn />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Live Tracking Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {liveTracking.map((tracking) => (
              <Grid item xs={12} md={6} lg={4} key={tracking._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order {tracking.deliveryOrderId?.orderId}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Customer: {tracking.deliveryOrderId?.customerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Boy: {tracking.deliveryBoyId?.firstName} {tracking.deliveryBoyId?.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={tracking.status}
                        color={getStatusColor(tracking.status)}
                        size="small"
                      />
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Map />}
                      onClick={() => window.open(`/tracking/${tracking._id}`, '_blank')}
                    >
                      View on Map
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={4}>
          {analytics && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Statistics
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.orderStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Performers
                    </Typography>
                    <List>
                      {analytics.topPerformers?.slice(0, 5).map((performer, index) => (
                        <ListItem key={performer._id}>
                          <ListItemText
                            primary={`${performer.firstName} ${performer.lastName}`}
                            secondary={`${performer.successfulDeliveries} deliveries (${performer.successRate.toFixed(1)}%)`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Withdrawals Tab */}
        <TabPanel value={tabValue} index={5}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Delivery Boy</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Requested Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {withdrawal.deliveryBoyId?.firstName} {withdrawal.deliveryBoyId?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {withdrawal.deliveryBoyId?.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                    <TableCell>{new Date(withdrawal.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={withdrawal.status}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => setWithdrawalDialog({ 
                          open: true, 
                          withdrawalId: withdrawal._id, 
                          status: 'approved',
                          notes: ''
                        })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setWithdrawalDialog({ 
                          open: true, 
                          withdrawalId: withdrawal._id, 
                          status: 'rejected',
                          notes: ''
                        })}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Ratings Tab */}
        <TabPanel value={tabValue} index={6}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Delivery Boy</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ratings.map((rating) => (
                  <TableRow key={rating._id}>
                    <TableCell>
                      {rating.deliveryBoyId?.firstName} {rating.deliveryBoyId?.lastName}
                    </TableCell>
                    <TableCell>{rating.customerId?.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                        {rating.rating?.overall}
                      </Box>
                    </TableCell>
                    <TableCell>{rating.review}</TableCell>
                    <TableCell>{new Date(rating.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Assign Order Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, orderId: null, deliveryBoyId: '' })}>
        <DialogTitle>Assign Order</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Delivery Boy</InputLabel>
            <Select
              value={assignDialog.deliveryBoyId}
              label="Delivery Boy"
              onChange={(e) => setAssignDialog({ ...assignDialog, deliveryBoyId: e.target.value })}
            >
              {deliveryBoys.filter(boy => boy.availability && boy.status === 'active').map((boy) => (
                <MenuItem key={boy._id} value={boy._id}>
                  {boy.firstName} {boy.lastName} - {boy.phone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, orderId: null, deliveryBoyId: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignOrder}
            variant="contained"
            disabled={!assignDialog.deliveryBoyId}
          >
            Assign Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdrawal Status Dialog */}
      <Dialog open={withdrawalDialog.open} onClose={() => setWithdrawalDialog({ open: false, withdrawalId: null, status: '', notes: '' })}>
        <DialogTitle>Update Withdrawal Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={withdrawalDialog.status}
              label="Status"
              onChange={(e) => setWithdrawalDialog({ ...withdrawalDialog, status: e.target.value })}
            >
              <MenuItem value="approved">Approve</MenuItem>
              <MenuItem value="rejected">Reject</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={withdrawalDialog.notes}
            onChange={(e) => setWithdrawalDialog({ ...withdrawalDialog, notes: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawalDialog({ open: false, withdrawalId: null, status: '', notes: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdrawalStatus}
            variant="contained"
            disabled={!withdrawalDialog.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DeliveryManagement;
