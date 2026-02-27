import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  Tooltip,
  IconButton,
  FormControlLabel,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { InfoOutlined, Save } from '@mui/icons-material';

const PaymentOptions = () => {
  const [paymentMethods, setPaymentMethods] = useState({
    cashOnDelivery: false,
    digitalPayment: false,
    walletPayment: false,
    offlinePayment: false
  });

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingMethod, setPendingMethod] = useState({ name: '', value: false });

  // API URL
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load payment options from backend
  useEffect(() => {
    const loadPaymentOptions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/admin-settings/payment-options`);
        setPaymentMethods(response.data);
      } catch (error) {
        console.error('Error loading payment options:', error);
        setAlert({
          open: true,
          message: 'Failed to load payment options',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPaymentOptions();
  }, []);

  const handlePaymentMethodChange = (method, value) => {
    // Update the state immediately to show the toggle change
    const tempPaymentMethods = { ...paymentMethods, [method]: value };
    setPaymentMethods(tempPaymentMethods);
    
    setPendingMethod({ name: method, value, originalValue: !value });
    setConfirmDialogOpen(true);
  };

  const handleConfirmPaymentChange = async () => {
    try {
      setLoading(true);
      
      // API call to save payment options
      const response = await axios.put(`${API}/admin-settings/payment-options`, paymentMethods);
      
      // Update state with the confirmed value from API response
      setPaymentMethods(response.data);
      setAlert({
        open: true,
        message: `${getPaymentMethodName(pendingMethod.name)} ${pendingMethod.value ? 'enabled' : 'disabled'} successfully!`,
        severity: 'success'
      });
      
      // Close confirmation dialog
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error updating payment options:', error);
      setAlert({
        open: true,
        message: 'Failed to update payment option: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPaymentChange = () => {
    // Revert the state back to original value
    setPaymentMethods(prev => ({ ...prev, [pendingMethod.name]: pendingMethod.originalValue }));
    setConfirmDialogOpen(false);
    setPendingMethod({ name: '', value: false, originalValue: false });
  };

  const getPaymentMethodName = (method) => {
    const names = {
      cashOnDelivery: 'Cash on Delivery',
      digitalPayment: 'Digital Payment',
      walletPayment: 'Wallet Payment',
      offlinePayment: 'Offline Payment'
    };
    return names[method] || method;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // API call to save payment options
      const response = await axios.put(`${API}/admin-settings/payment-options`, paymentMethods);
      
      setPaymentMethods(response.data);
      setAlert({
        open: true,
        message: 'Payment options saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving payment options:', error);
      setAlert({
        open: true,
        message: 'Failed to save payment options: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Payment Methods
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={paymentMethods.cashOnDelivery}
                  onChange={(e) => handlePaymentMethodChange('cashOnDelivery', e.target.checked)}
                />
              }
              label="Cash on Delivery"
            />
          </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={paymentMethods.digitalPayment}
                onChange={(e) => handlePaymentMethodChange('digitalPayment', e.target.checked)}
              />
            }
            label="Digital Payment"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={paymentMethods.walletPayment}
                onChange={(e) => handlePaymentMethodChange('walletPayment', e.target.checked)}
              />
            }
            label="Wallet Payment"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={paymentMethods.offlinePayment}
                onChange={(e) => handlePaymentMethodChange('offlinePayment', e.target.checked)}
              />
            }
            label="Offline Payment"
          />
        </Grid>
      </Grid>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<Save />}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {/* Payment Method Confirmation Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={handleCancelPaymentChange}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoOutlined sx={{ mr: 1 }} />
            Confirm Payment Method Change
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {pendingMethod.value ? 'enable' : 'disable'} <strong>{getPaymentMethodName(pendingMethod.name)}</strong>?
          </Typography>
          {pendingMethod.value ? (
            <Typography variant="body2" color="text.secondary">
              Enabling this payment method will allow customers to use it for their purchases.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" color="warning.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                ⚠️ WARNING: This will remove the payment option for all customers!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Disabling this payment method will prevent customers from using it for new purchases.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelPaymentChange}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPaymentChange}
            variant="contained"
            color={pendingMethod.value ? 'primary' : 'warning'}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Yes, ${pendingMethod.value ? 'Enable' : 'Disable'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={alert.severity} onClose={() => setAlert(prev => ({ ...prev, open: false }))}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentOptions;
