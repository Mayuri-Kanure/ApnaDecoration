import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const ViewCustomerDialog = ({ open, onClose, customerId }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetails();
    }
  }, [open, customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCustomer(response.data?.customer || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      blocked: 'error',
      suspended: 'warning'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Customer Details</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {customer && (
          <Box>
            {/* Customer Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 64, height: 64, mr: 2 }}
                src={customer.avatar}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {customer.firstName} {customer.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {customer.email}
                </Typography>
                <Chip
                  label={customer.status || 'active'}
                  color={getStatusColor(customer.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            {/* Customer Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {customer.firstName} {customer.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {customer.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {customer.phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={customer.status || 'active'}
                      color={getStatusColor(customer.status)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Address Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {typeof customer.address === 'string'
                        ? customer.address
                        : customer.address?.street || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      City
                    </Typography>
                    <Typography variant="body1">
                      {customer.city || customer.address?.city || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      State
                    </Typography>
                    <Typography variant="body1">
                      {customer.state || customer.address?.state || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Zip Code
                    </Typography>
                    <Typography variant="body1">
                      {customer.zipCode || customer.address?.zipCode || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Country
                    </Typography>
                    <Typography variant="body1">
                      {customer.country || customer.address?.country || 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Account Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {customer._id?.slice(-8)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Joined Date
                    </Typography>
                    <Typography variant="body1">
                      {customer.createdAt ? formatDate(customer.createdAt) : 'Not available'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {customer.updatedAt ? formatDate(customer.updatedAt) : 'Not available'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Typography variant="body1">
                      {customer.totalOrders || customer.orderCount || 0} orders
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCustomerDialog;
