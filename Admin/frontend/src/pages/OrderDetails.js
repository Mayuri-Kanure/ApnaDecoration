import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiService from '../services/api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching order details for ID:', id);
      const response = await apiService.request(`/orders/${id}`);
      console.log('📋 API Response:', response);
      console.log('📋 Response data:', response);
      setOrder(response.data || response); // Handle both response formats
      console.log('✅ Order set:', response.data || response);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      setError(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await apiService.request(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes
        })
      });
      
      await fetchOrderDetails(); // Refresh order details
      setStatusDialogOpen(false);
      setNewStatus('');
      setStatusNotes('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🚫 Admin cancelling order:', id);
      
      const response = await apiService.request(`/orders/${id}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({
          reason: 'Cancelled by admin'
        })
      });
      
      console.log('✅ Order cancelled successfully:', response);
      
      await fetchOrderDetails(); // Refresh order details
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      setError(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'secondary',
      'out-for-delivery': 'warning',
      delivered: 'success',
      returned: 'error',
      cancelled: 'error',
      failed: 'error',
      canceled: 'error',
      packaging: 'secondary'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={3}>
        <Alert severity="info">Order not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/orders')}
          sx={{ mr: 2 }}
        >
          Back to Orders
        </Button>
        <Typography variant="h4" component="h1">
          Order #{order.orderNumber || order._id}
        </Typography>
        <Chip
          label={order.status?.replace('-', ' ').toUpperCase() || 'PENDING'}
          color={getStatusColor(order.status)}
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Order Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Order Number
                </Typography>
                <Typography variant="body1">
                  {order.orderNumber || order._id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(order.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(order.pricing?.total || order.total || 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {order.paymentMethod?.toUpperCase() || 'COD'}
                </Typography>
              </Grid>
            </Grid>

            <Box mt={2}>
              <Button
                variant="contained"
                onClick={() => setStatusDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Update Status
              </Button>
              {order.status === 'pending' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelOrder}
                  sx={{ mr: 2 }}
                >
                  Cancel Order
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {order.user?.name || 'Guest User'}
              </Typography>
            </Box>
            
            {order.user?.email && (
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {order.user.email}
                </Typography>
              </Box>
            )}
            
            {order.user?.phone && (
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {order.user.phone}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Shipping Address */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" alignItems="flex-start">
              <LocationIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1">
                  {order.shippingAddress?.street}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress?.zipCode}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress?.country}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Event Information */}
        {order.eventInfo && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {order.eventInfo.eventType?.charAt(0).toUpperCase() + order.eventInfo.eventType?.slice(1)} Event
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Event Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.eventInfo.eventDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Event Time
                  </Typography>
                  <Typography variant="body1">
                    {order.eventInfo.eventTime}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Venue Type
                  </Typography>
                  <Typography variant="body1">
                    {order.eventInfo.venueType?.charAt(0).toUpperCase() + order.eventInfo.venueType?.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Guest Count
                  </Typography>
                  <Typography variant="body1">
                    {order.eventInfo.guestCount} guests
                  </Typography>
                </Grid>
              </Grid>
              
              {order.eventInfo.venueAddress && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Venue Address
                  </Typography>
                  <Typography variant="body2">
                    {order.eventInfo.venueAddress}
                  </Typography>
                </Box>
              )}
              
              {order.eventInfo.specialInstructions && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Special Instructions
                  </Typography>
                  <Typography variant="body2">
                    {order.eventInfo.specialInstructions}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Order Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {order.items?.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={item.product?.name || `Product ${index + 1}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity} × {formatCurrency(item.unitPrice || item.price || 0)}
                        </Typography>
                        <Typography variant="body1" color="primary">
                          Total: {formatCurrency(item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0)))}
                        </Typography>
                        {item.productModel && (
                          <Chip
                            label={item.productModel}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pricing Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pricing Breakdown
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">
                  {formatCurrency(order.pricing?.subtotal || 0)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">
                  {formatCurrency(order.pricing?.tax || 0)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2">
                  {formatCurrency(order.pricing?.shipping || 0)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(order.pricing?.total || order.total || 0)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Status Timeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {order.timeline && order.timeline.length > 0 ? (
              <List>
                {order.timeline.map((timelineItem, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={timelineItem.status?.replace('-', ' ').toUpperCase()}
                            color={getStatusColor(timelineItem.status)}
                            size="small"
                          />
                          <Typography variant="body2">
                            {formatDate(timelineItem.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        timelineItem.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {timelineItem.notes}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No status updates yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;
