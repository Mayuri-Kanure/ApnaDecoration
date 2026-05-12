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
  Fab,
  Tooltip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  LocalShipping,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  AccessTime,
  Person,
  Store,
  Refresh,
  Map,
  FilterList,
  CheckCircle,
  Cancel,
  Info,
} from '@mui/icons-material';
import deliveryApi from '../../src/services/deliveryApi';
import EnhancedDeliveryLayout from '../../components/EnhancedDeliveryLayout';

function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState({ open: false, orderId: null, reason: '' });
  const [accepting, setAccepting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 10, radius: 10 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState({ open: false, order: null });

  useEffect(() => {
    fetchAvailableOrders();
    const interval = setInterval(fetchAvailableOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const response = await deliveryApi.getAvailableOrders(filters);
      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching available orders:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching available orders',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setAccepting(true);
      const response = await deliveryApi.acceptOrder(orderId);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Order accepted successfully!',
          severity: 'success'
        });
        fetchAvailableOrders();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error accepting order',
        severity: 'error'
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleRejectOrder = async () => {
    try {
      const response = await deliveryApi.rejectOrder(rejectDialog.orderId, rejectDialog.reason);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Order rejected successfully',
          severity: 'info'
        });
        setRejectDialog({ open: false, orderId: null, reason: '' });
        fetchAvailableOrders();
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error rejecting order',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsDialog({ open: true, order });
  };

  const handlePageChange = (event, value) => {
    setFilters({ ...filters, page: value });
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
      default: return 'default';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash': return 'warning';
      case 'online': return 'success';
      case 'wallet': return 'info';
      default: return 'default';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <EnhancedDeliveryLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </EnhancedDeliveryLayout>
    );
  }

  return (
    <EnhancedDeliveryLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Available Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Orders near your location ready for pickup
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Radius (km)"
              type="number"
              value={filters.radius}
              onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) || 10 })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAvailableOrders}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Available Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no orders available in your area right now. Check back soon!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {order.orderId}
                      </Typography>
                      <Chip
                        label={order.priority}
                        size="small"
                        color={order.priority === 'urgent' ? 'error' : 'default'}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        ₹{order.deliveryFee}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Delivery Fee
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Customer Info */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Customer Details
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {order.customerName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Est. {order.estimatedTime}
                      </Typography>
                    </Box>
                    {order.distance && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {order.distance} km away
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Order Details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Order Details
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Order Amount:
                      </Typography>
                      <Typography variant="body2">
                        ₹{order.orderAmount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Payment:
                      </Typography>
                      <Chip
                        label={order.paymentMethod}
                        size="small"
                        color={getPaymentMethodColor(order.paymentMethod)}
                      />
                    </Box>
                    {order.paymentMethod === 'cash' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          COD Amount:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{order.totalAmount}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Items ({order.items.length})
                      </Typography>
                      <Box sx={{ maxHeight: 60, overflow: 'hidden' }}>
                        {order.items.slice(0, 2).map((item, index) => (
                          <Typography key={index} variant="caption" display="block">
                            • {item.productName} (Qty: {item.quantity})
                          </Typography>
                        ))}
                        {order.items.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{order.items.length - 2} more items
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(order)}
                      startIcon={<Info />}
                    >
                      Details
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => handleAcceptOrder(order._id)}
                      disabled={accepting}
                      startIcon={<CheckCircle />}
                    >
                      Accept
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.current}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, order: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details - {detailsDialog.order?.orderId}</DialogTitle>
        <DialogContent>
          {detailsDialog.order && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText primary={detailsDialog.order.customerName} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText primary={detailsDialog.order.customerPhone} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText primary={detailsDialog.order.customerEmail} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationOn /></ListItemIcon>
                    <ListItemText 
                      primary={`${detailsDialog.order.deliveryAddress?.street}, ${detailsDialog.order.deliveryAddress?.city}, ${detailsDialog.order.deliveryAddress?.pinCode}`}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Order Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Order Amount" secondary={`₹${detailsDialog.order.orderAmount}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Delivery Fee" secondary={`₹${detailsDialog.order.deliveryFee}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Total Amount" secondary={`₹${detailsDialog.order.totalAmount}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Payment Method" secondary={detailsDialog.order.paymentMethod} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Distance" secondary={`${detailsDialog.order.distance} km`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Estimated Time" secondary={detailsDialog.order.estimatedTime} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Items ({detailsDialog.order.items?.length})
                </Typography>
                <List dense>
                  {detailsDialog.order.items?.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.productName}
                        secondary={`Quantity: ${item.quantity} | Price: ₹${item.price}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, order: null })}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleAcceptOrder(detailsDialog.order._id);
              setDetailsDialog({ open: false, order: null });
            }}
            disabled={accepting}
            startIcon={<CheckCircle />}
          >
            Accept Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, orderId: null, reason: '' })}>
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            multiline
            rows={3}
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, orderId: null, reason: '' })}>
            Cancel
          </Button>
          <Button onClick={handleRejectOrder} variant="contained" color="error">
            Reject
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
    </EnhancedDeliveryLayout>
  );
}

export default AvailableOrders;
