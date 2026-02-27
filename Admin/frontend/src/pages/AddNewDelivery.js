import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  Info as InfoIcon
} from '@mui/icons-material';

function AddNewDelivery() {
  const [formData, setFormData] = useState({
    // General Information
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+1',
    address: '',
    identityType: 'passport',
    identityNumber: '',
    deliverymanImage: null,
    deliverymanImagePreview: null,
    identityImage: null,
    identityImagePreview: null,
    
    // Account Information
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const countryCodes = [
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+61', country: 'Australia' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' }
  ];

  const identityTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'driver_license', label: 'Driver License' },
    { value: 'national_id', label: 'National ID' },
    { value: 'voter_id', label: 'Voter ID' }
  ];

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleImageUpload = (field, previewField) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [field]: file,
          [previewField]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    if (formData.password.length < 8) {
      setSnackbar({ open: true, message: 'Password must be at least 8 characters', severity: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file uploads
      const deliveryFormData = new FormData();
      deliveryFormData.append('firstName', formData.firstName);
      deliveryFormData.append('lastName', formData.lastName);
      deliveryFormData.append('phone', formData.phone);
      deliveryFormData.append('countryCode', formData.countryCode);
      deliveryFormData.append('address', formData.address);
      deliveryFormData.append('identityType', formData.identityType);
      deliveryFormData.append('identityNumber', formData.identityNumber);
      deliveryFormData.append('email', formData.email);
      deliveryFormData.append('password', formData.password);
      
      if (formData.deliverymanImage) {
        deliveryFormData.append('deliverymanImage', formData.deliverymanImage);
      }
      
      if (formData.identityImage) {
        deliveryFormData.append('identityImage', formData.identityImage);
      }

      const response = await axios.post('http://localhost:5000/api/deliverymen', deliveryFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSnackbar({ open: true, message: 'Delivery man added successfully', severity: 'success' });
      
      // Reset form after success
      handleReset();
      
      // Navigate back after success
      setTimeout(() => {
        window.history.back();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating delivery man:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error creating delivery man', 
        severity: 'error' 
      });
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      countryCode: '+1',
      address: '',
      identityType: 'passport',
      identityNumber: '',
      deliverymanImage: null,
      deliverymanImagePreview: null,
      identityImage: null,
      identityImagePreview: null,
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C3E50' }}>
          Add New Delivery Man
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        {/* General Information Section */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonIcon sx={{ color: '#1976D2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                General Information
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl sx={{ minWidth: 100 }}>
                    <Select
                      value={formData.countryCode}
                      onChange={handleInputChange('countryCode')}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: '#FAFAFA'
                      }}
                    >
                      {countryCodes.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#FAFAFA'
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Identity Type</InputLabel>
                  <Select
                    value={formData.identityType}
                    onChange={handleInputChange('identityType')}
                    label="Identity Type"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }}
                  >
                    {identityTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Identity Number"
                  value={formData.identityNumber}
                  onChange={handleInputChange('identityNumber')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Deliveryman Image
                  </Typography>
                  <Typography variant="caption" color="#666" sx={{ mb: 1, display: 'block' }}>
                    Ratio 1:1
                  </Typography>
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      border: '2px dashed #ddd',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      cursor: 'pointer',
                      backgroundColor: '#FAFAFA',
                      '&:hover': { backgroundColor: '#F0F0F0' }
                    }}
                    onClick={() => document.getElementById('deliveryman-image').click()}
                  >
                    {formData.deliverymanImagePreview ? (
                      <img
                        src={formData.deliverymanImagePreview}
                        alt="Deliveryman"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                      />
                    ) : (
                      <>
                        <UploadIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                        <Typography variant="body2" color="#666">
                          Browse
                        </Typography>
                      </>
                    )}
                  </Box>
                  <input
                    id="deliveryman-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload('deliverymanImage', 'deliverymanImagePreview')}
                    style={{ display: 'none' }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Identity Image
                  </Typography>
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      border: '2px dashed #ddd',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      cursor: 'pointer',
                      backgroundColor: '#FAFAFA',
                      '&:hover': { backgroundColor: '#F0F0F0' }
                    }}
                    onClick={() => document.getElementById('identity-image').click()}
                  >
                    {formData.identityImagePreview ? (
                      <img
                        src={formData.identityImagePreview}
                        alt="Identity"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                      />
                    ) : (
                      <>
                        <UploadIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                        <Typography variant="body2" color="#666">
                          Browse
                        </Typography>
                      </>
                    )}
                  </Box>
                  <input
                    id="identity-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload('identityImage', 'identityImagePreview')}
                    style={{ display: 'none' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Account Information Section */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonIcon sx={{ color: '#1976D2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                Account Information
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={formData.showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  placeholder="Password minimum 8 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('showPassword')}
                          edge="end"
                        >
                          {formData.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        <IconButton edge="end">
                          <InfoIcon sx={{ fontSize: 20, color: '#999' }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={formData.showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('showConfirmPassword')}
                          edge="end"
                        >
                          {formData.showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              borderColor: '#1976D2',
              color: '#1976D2',
              '&:hover': { backgroundColor: '#E3F2FD' }
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' },
              px: 4
            }}
          >
            Submit
          </Button>
        </Box>
      </form>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AddNewDelivery;
