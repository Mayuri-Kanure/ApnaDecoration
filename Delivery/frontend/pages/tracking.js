import { useState, useEffect, useRef } from 'react';
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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Fab,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  GpsFixed,
  LocationOn,
  AccessTime,
  LocalShipping,
  CheckCircle,
  Cancel,
  Phone,
  Email,
  Camera,
  PhotoCamera,
  Upload,
  Refresh,
  Navigation,
  Timeline,
  Person,
  Store,
  Map,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import deliveryApi from '../src/services/deliveryApi';
import EnhancedDeliveryLayout from '../components/EnhancedDeliveryLayout';

function LiveTracking() {
  const [activeTracking, setActiveTracking] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [completeDialog, setCompleteDialog] = useState({ open: false, proofImage: '', notes: '' });
  const [failedDialog, setFailedDialog] = useState({ open: false, reason: '', notes: '' });
  const [locationHistory, setLocationHistory] = useState([]);
  const [eta, setEta] = useState({ estimatedArrival: null, distanceRemaining: 0, durationRemaining: 0 });
  const locationInterval = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchActiveTracking();
    getCurrentLocation();
    
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeTracking) {
      // Start location updates every 30 seconds
      locationInterval.current = setInterval(() => {
        updateLocation();
      }, 30000);
    } else {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    }

    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [activeTracking]);

  const fetchActiveTracking = async () => {
    try {
      setLoading(true);
      const response = await deliveryApi.getActiveTracking();
      if (response.success && response.data) {
        setActiveTracking(response.data);
        setEta({
          estimatedArrival: response.data.estimatedArrival,
          distanceRemaining: response.data.distanceRemaining,
          durationRemaining: response.data.durationRemaining,
        });
      }
    } catch (error) {
      console.error('Error fetching active tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(newLocation);
          
          // Update location to server
          updateLocationToServer(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          setSnackbar({
            open: true,
            message: 'Unable to get your location. Please enable GPS.',
            severity: 'error'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by your browser',
        severity: 'error'
      });
    }
  };

  const updateLocation = () => {
    getCurrentLocation();
  };

  const updateLocationToServer = async (locationData) => {
    try {
      await deliveryApi.updateLocation(locationData);
      setLocationHistory(prev => [...prev.slice(-9), { ...locationData, timestamp: new Date() }]);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleStartTracking = async (orderId) => {
    try {
      setTrackingLoading(true);
      const response = await deliveryApi.startTracking(orderId);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Tracking started successfully',
          severity: 'success'
        });
        fetchActiveTracking();
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error starting tracking',
        severity: 'error'
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      const response = await deliveryApi.completeDelivery(activeTracking.deliveryOrderId._id, {
        proofImage: completeDialog.proofImage,
        notes: completeDialog.notes,
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Delivery completed successfully',
          severity: 'success'
        });
        setCompleteDialog({ open: false, proofImage: '', notes: '' });
        setActiveTracking(null);
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error completing delivery',
        severity: 'error'
      });
    }
  };

  const handleMarkFailed = async () => {
    try {
      const response = await deliveryApi.markDeliveryFailed(
        activeTracking.deliveryOrderId._id,
        failedDialog.reason,
        failedDialog.notes
      );
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Delivery marked as failed',
          severity: 'warning'
        });
        setFailedDialog({ open: false, reason: '', notes: '' });
        setActiveTracking(null);
      }
    } catch (error) {
      console.error('Error marking delivery as failed:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error marking delivery as failed',
        severity: 'error'
      });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload this to a server
      // For now, we'll just create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompleteDialog({ ...completeDialog, proofImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
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
          Live Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time location tracking and delivery management
        </Typography>
      </Box>

      {!activeTracking ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <GpsFixed sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Active Delivery
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Accept an order from the available orders page to start tracking
          </Typography>
          <Button
            variant="contained"
            href="/orders/available"
            startIcon={<LocalShipping />}
          >
            View Available Orders
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Current Status Card */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Order {activeTracking.deliveryOrderId?.orderId}
                  </Typography>
                  <Chip
                    label={activeTracking.status.replace('_', ' ')}
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Delivery Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      activeTracking.status === 'picked_up' ? 25 :
                      activeTracking.status === 'in_transit' ? 75 :
                      activeTracking.status === 'delivered' ? 100 : 0
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Delivery Details */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Customer
                        </Typography>
                        <Typography variant="body1">
                          {activeTracking.deliveryOrderId?.customerName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Distance Remaining
                        </Typography>
                        <Typography variant="body1">
                          {eta.distanceRemaining.toFixed(1)} km
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          ETA
                        </Typography>
                        <Typography variant="body1">
                          {eta.estimatedArrival ? new Date(eta.estimatedArrival).toLocaleTimeString() : 'Calculating...'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Timeline sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Duration Remaining
                        </Typography>
                        <Typography variant="body1">
                          {formatDuration(eta.durationRemaining)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setCompleteDialog({ open: true, proofImage: '', notes: '' })}
                  >
                    Complete Delivery
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setFailedDialog({ open: true, reason: '', notes: '' })}
                  >
                    Mark as Failed
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={updateLocation}
                    disabled={trackingLoading}
                  >
                    Update Location
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Phone />}
                    href={`tel:${activeTracking.deliveryOrderId?.customerPhone}`}
                  >
                    Call Customer
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Location Info Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Location
                </Typography>
                
                {location.latitude && location.longitude ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <GpsFixed sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">
                        GPS Active
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Latitude: {location.latitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Longitude: {location.longitude.toFixed(6)}
                    </Typography>
                    {location.accuracy && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Accuracy: ±{location.accuracy.toFixed(0)}m
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <GpsFixed sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Location not available
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Location History
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {locationHistory.length > 0 ? (
                    locationHistory.map((loc, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(loc.timestamp)}
                        </Typography>
                        <Typography variant="body2">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No location history yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <List>
                  {activeTracking.deliveryOrderId?.items?.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.productName}
                        secondary={`Quantity: ${item.quantity} | Price: ₹${item.price}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Complete Delivery Dialog */}
      <Dialog open={completeDialog.open} onClose={() => setCompleteDialog({ open: false, proofImage: '', notes: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Delivery</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide proof of delivery to complete this order.
          </Typography>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ mb: 2 }}
          >
            Upload Delivery Photo
          </Button>
          
          {completeDialog.proofImage && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img
                src={completeDialog.proofImage}
                alt="Delivery proof"
                style={{ maxWidth: '100%', maxHeight: 200 }}
              />
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            multiline
            rows={3}
            value={completeDialog.notes}
            onChange={(e) => setCompleteDialog({ ...completeDialog, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog({ open: false, proofImage: '', notes: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteDelivery}
            variant="contained"
            color="success"
            disabled={!completeDialog.proofImage}
          >
            Complete Delivery
          </Button>
        </DialogActions>
      </Dialog>

      {/* Failed Delivery Dialog */}
      <Dialog open={failedDialog.open} onClose={() => setFailedDialog({ open: false, reason: '', notes: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Delivery as Failed</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason for Failure"
            multiline
            rows={3}
            value={failedDialog.reason}
            onChange={(e) => setFailedDialog({ ...failedDialog, reason: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            multiline
            rows={3}
            value={failedDialog.notes}
            onChange={(e) => setFailedDialog({ ...failedDialog, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFailedDialog({ open: false, reason: '', notes: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleMarkFailed}
            variant="contained"
            color="error"
            disabled={!failedDialog.reason}
          >
            Mark as Failed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Location Update */}
      <Tooltip title="Update Location">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={updateLocation}
          disabled={trackingLoading}
        >
          <GpsFixed />
        </Fab>
      </Tooltip>

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

export default LiveTracking;
