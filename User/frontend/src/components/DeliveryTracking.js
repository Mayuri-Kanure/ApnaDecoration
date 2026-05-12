import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping,
  Person,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  CheckCircle,
  Pending,
  GpsFixed,
  Star,
  RateReview,
  Refresh,
  Map,
  Close,
  Done,
} from '@mui/icons-material';
import { userAPI } from '../services/api';

function DeliveryTracking({ orderId }) {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingDialog, setRatingDialog] = useState({ open: false, rating: 0, review: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchTrackingData = async () => {
    try {
      if (!orderId) return;
      
      const response = await userAPI.getDeliveryTracking(orderId);
      if (response.success) {
        setTrackingData(response.data);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrackingData();
  };

  const handleSubmitRating = async () => {
    try {
      const response = await userAPI.submitDeliveryRating(orderId, {
        rating: {
          deliverySpeed: ratingDialog.rating,
          behavior: ratingDialog.rating,
          serviceQuality: ratingDialog.rating,
          overall: ratingDialog.rating,
        },
        review: ratingDialog.review,
      });
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Rating submitted successfully',
          severity: 'success'
        });
        setRatingDialog({ open: false, rating: 0, review: '' });
        fetchTrackingData();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error submitting rating',
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
      default: return 'default';
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'accepted': return 2;
      case 'picked_up': return 3;
      case 'in_transit': return 4;
      case 'delivered': return 5;
      case 'cancelled': return -1;
      case 'failed': return -1;
      default: return 0;
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trackingData) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Tracking Information Not Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Unable to fetch tracking information for this order.
        </Typography>
      </Paper>
    );
  }

  const currentStep = getStepIndex(trackingData.order.status);
  const isDelivered = trackingData.order.status === 'delivered';
  const canRate = isDelivered && !trackingData.rating;

  const steps = [
    {
      label: 'Order Placed',
      description: 'Your order has been received and is being processed.',
      icon: <Pending />,
      completed: true,
    },
    {
      label: 'Order Assigned',
      description: 'A delivery partner has been assigned to your order.',
      icon: <LocalShipping />,
      completed: currentStep >= 1,
    },
    {
      label: 'Order Accepted',
      description: 'The delivery partner has accepted your order.',
      icon: <CheckCircle />,
      completed: currentStep >= 2,
    },
    {
      label: 'Order Picked Up',
      description: 'Your order has been picked up and is on the way.',
      icon: <LocalShipping />,
      completed: currentStep >= 3,
    },
    {
      label: 'Out for Delivery',
      description: 'Your order is out for delivery and will arrive soon.',
      icon: <GpsFixed />,
      completed: currentStep >= 4,
    },
    {
      label: 'Delivered',
      description: 'Your order has been delivered successfully.',
      icon: <Done />,
      completed: currentStep >= 5,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Track Your Delivery
        </Typography>
        <IconButton onClick={handleRefresh} disabled={refreshing}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Order Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Order {trackingData.order.orderId}
            </Typography>
            <Chip
              label={trackingData.order.status.replace('_', ' ')}
              color={getStatusColor(trackingData.order.status)}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Order Date: {formatDate(trackingData.order.orderDate)}
            </Typography>
            {trackingData.order.estimatedTime && (
              <Typography variant="body2" color="text.secondary">
                Est. Delivery: {trackingData.order.estimatedTime}
              </Typography>
            )}
          </Box>

          {trackingData.order.deliveredDate && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Order delivered on {formatDate(trackingData.order.deliveredDate)} at {formatTime(trackingData.order.deliveredDate)}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Delivery Partner Info */}
      {trackingData.deliveryBoy && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Delivery Partner
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={trackingData.deliveryBoy.profileImage}
                sx={{ width: 56, height: 56, mr: 2 }}
              >
                {trackingData.deliveryBoy.firstName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {trackingData.deliveryBoy.firstName} {trackingData.deliveryBoy.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trackingData.deliveryBoy.phone}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Star sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                  <Typography variant="body2">
                    {trackingData.deliveryBoy.averageRating?.toFixed(1) || '0.0'} ({trackingData.deliveryBoy.totalDeliveries} deliveries)
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Phone />}
                href={`tel:${trackingData.deliveryBoy.phone}`}
              >
                Call
              </Button>
              <Button
                variant="outlined"
                startIcon={<Email />}
                href={`mailto:${trackingData.deliveryBoy.email}`}
              >
                Email
              </Button>
              {trackingData.tracking && (
                <Button
                  variant="outlined"
                  startIcon={<Map />}
                  onClick={() => window.open(`/tracking-map/${trackingData.tracking._id}`, '_blank')}
                >
                  Live Map
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tracking Steps */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Delivery Progress
          </Typography>
          <Stepper activeStep={currentStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: step.completed ? 'primary.main' : 'grey.300',
                        color: step.completed ? 'white' : 'text.secondary',
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                  {trackingData.order.tracking && trackingData.order.tracking[index] && (
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(trackingData.order.tracking[index].timestamp)}
                    </Typography>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Live Location */}
      {trackingData.tracking && trackingData.tracking.currentLocation && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Live Location
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GpsFixed sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body2">
                Last updated: {trackingData.tracking.lastUpdated ? formatTime(trackingData.tracking.lastUpdated) : 'Unknown'}
              </Typography>
            </Box>
            
            {trackingData.tracking.estimatedArrival && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  Estimated arrival: {formatTime(trackingData.tracking.estimatedArrival)}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              startIcon={<Map />}
              onClick={() => window.open(`/tracking-map/${trackingData.tracking._id}`, '_blank')}
            >
              View on Map
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          <List>
            {trackingData.order.items?.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.productName}
                  secondary={`Quantity: ${item.quantity} | Price: ₹${item.price}`}
                />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">₹{trackingData.order.orderAmount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Delivery Fee:</Typography>
            <Typography variant="body2">₹{trackingData.order.deliveryFee}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">₹{trackingData.order.totalAmount}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Rating Section */}
      {isDelivered && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rate Your Delivery
            </Typography>
            
            {trackingData.rating ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Thank you for rating your delivery experience!
                </Alert>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Star sx={{ fontSize: 20, mr: 0.5, color: 'warning.main' }} />
                  <Typography variant="h6">
                    {trackingData.rating.rating.overall}/5
                  </Typography>
                </Box>
                {trackingData.rating.review && (
                  <Typography variant="body2" color="text.secondary">
                    "{trackingData.rating.review}"
                  </Typography>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  How was your delivery experience? Your feedback helps us improve our service.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RateReview />}
                  onClick={() => setRatingDialog({ open: true, rating: 0, review: '' })}
                >
                  Rate Delivery
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rating Dialog */}
      <Dialog open={ratingDialog.open} onClose={() => setRatingDialog({ open: false, rating: 0, review: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Your Delivery</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please rate your delivery experience
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => setRatingDialog({ ...ratingDialog, rating: star })}
              >
                <Star
                  sx={{
                    fontSize: 32,
                    color: star <= ratingDialog.rating ? 'warning.main' : 'grey.300',
                  }}
                />
              </IconButton>
            ))}
          </Box>
          
          <TextField
            fullWidth
            label="Share your experience (optional)"
            multiline
            rows={4}
            value={ratingDialog.review}
            onChange={(e) => setRatingDialog({ ...ratingDialog, review: e.target.value })}
            placeholder="Tell us about your delivery experience..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog({ open: false, rating: 0, review: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRating}
            variant="contained"
            disabled={ratingDialog.rating === 0}
          >
            Submit Rating
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

export default DeliveryTracking;
