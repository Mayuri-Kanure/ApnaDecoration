import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';

function CustomerForm({ open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Afghanistan',
    city: '',
    zipCode: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: 'Afghanistan',
        city: '',
        zipCode: '',
        address: ''
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: 'Afghanistan',
      city: '',
      zipCode: '',
      address: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Add new customer
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First name *"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last name *"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email*"
              placeholder="Ex: ex@example.com"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              size="small"
              type="email"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone*"
              placeholder="+91 Enter phone number"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              size="small"
              type="tel"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                label="Country"
                onChange={handleChange('country')}
              >
                <MenuItem value="Afghanistan">Afghanistan</MenuItem>
                <MenuItem value="India">India</MenuItem>
                <MenuItem value="United States">United States</MenuItem>
                <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="Australia">Australia</MenuItem>
                <MenuItem value="Germany">Germany</MenuItem>
                <MenuItem value="France">France</MenuItem>
                <MenuItem value="Japan">Japan</MenuItem>
                <MenuItem value="China">China</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              placeholder="City"
              value={formData.city}
              onChange={handleChange('city')}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zip code"
              placeholder="Zip code"
              value={formData.zipCode}
              onChange={handleChange('zipCode')}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={handleChange('address')}
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          startIcon={<SaveIcon />}
        >
          Save Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomerForm;
