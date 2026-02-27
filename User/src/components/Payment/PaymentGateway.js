import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  CreditCard as CardIcon
} from '@mui/icons-material';
import paymentService from '../../services/paymentService';

const PaymentGateway = ({ 
  order, 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  onPaymentCancel,
  disabled = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (order && amount) {
      createRazorpayOrder();
    }
  }, [order, amount]);

  const createRazorpayOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await paymentService.createRazorpayOrder(order._id, amount);
      
      setRazorpayOrder(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!razorpayOrder) {
      setError('Payment order not ready');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPaymentDialogOpen(true);

      const orderDetails = {
        orderId: order._id,
        customerName: order.customerName || order.userId?.name,
        customerEmail: order.customerEmail || order.userId?.email,
        customerPhone: order.customerPhone || order.userId?.phone,
        onSuccess: (verification) => {
          console.log('✅ Payment successful:', verification);
          setSuccess('Payment successful! Order confirmed.');
          setPaymentDialogOpen(false);
          if (onPaymentSuccess) {
            onPaymentSuccess(verification);
          }
        },
        onError: (error) => {
          console.error('❌ Payment failed:', error);
          setError(error.response?.data?.message || 'Payment verification failed');
          setPaymentDialogOpen(false);
          if (onPaymentError) {
            onPaymentError(error);
          }
        }
      };

      await paymentService.openRazorpayCheckout(razorpayOrder, orderDetails);
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      setError(error.message || 'Payment processing failed');
      setPaymentDialogOpen(false);
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <PaymentIcon sx={{ mr: 1, color: '#2F66FF' }} />
          <Typography variant="h6" fontWeight="bold">
            Payment Gateway
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Order Summary */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Order ID
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              #{order?._id?.slice(-8)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {formatAmount(amount)}
            </Typography>
          </Grid>
        </Grid>

        {/* Payment Status */}
        {success && (
          <Alert 
            severity="success" 
            icon={<SuccessIcon />}
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<CardIcon />}
          onClick={handlePayment}
          disabled={disabled || loading || !razorpayOrder}
          sx={{
            py: 1.5,
            bgcolor: '#2F66FF',
            '&:hover': {
              bgcolor: '#1E40AF'
            },
            '&:disabled': {
              bgcolor: '#E5E7EB'
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Pay with Razorpay'
          )}
        </Button>

        {/* Security Badge */}
        <Box display="flex" justifyContent="center" mt={2}>
          <Chip
            icon={<PaymentIcon />}
            label="Secure Payment"
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>

        {/* Payment Processing Dialog */}
        <Dialog open={paymentDialogOpen} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <CircularProgress size={20} sx={{ mr: 2 }} />
              Processing Payment
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Please complete your payment in the Razorpay window that will open.
              Do not close this window until the payment is complete.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setPaymentDialogOpen(false)}
              color="secondary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Info */}
        <Box mt={3} p={2} bgcolor="#F8FAFC" borderRadius={1}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Secure Payment Powered by Razorpay</strong>
            <br />
            Your payment information is encrypted and secure.
            <br />
            Multiple payment options available: Credit Card, Debit Card, UPI, Net Banking
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentGateway;
