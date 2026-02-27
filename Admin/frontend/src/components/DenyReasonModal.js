import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function DenyReasonModal({ open, onClose, product, onDenySuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for denial');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/vendor-products/${product._id}/deny`,
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onDenySuccess();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to deny product');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Deny Product - {product?.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Please provide a reason for denying this product. This reason will be sent to the vendor.
          </Typography>
          
          {product && (
            <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Product Details:
              </Typography>
              <Typography variant="body2">SKU: {product.sku}</Typography>
              <Typography variant="body2">Brand: {product.brand}</Typography>
              <Typography variant="body2">Category: {product.category}</Typography>
              <Typography variant="body2">Price: ${product.unit_price}</Typography>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Denial Reason"
          placeholder="Please explain why this product is being denied..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={loading}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#ef4444',
            '&:hover': { backgroundColor: '#dc2626' },
            minWidth: 100
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Deny Product'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DenyReasonModal;
