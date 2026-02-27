import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Home as AddressIcon,
} from '@mui/icons-material';

function AddDelivery() {
  const [deliverymanImageFile, setDeliverymanImageFile] = useState(null);
  const [identityImageFile, setIdentityImageFile] = useState(null);
  
  const [delivery, setDelivery] = useState({
    // General Information
    firstName: '',
    lastName: '',
    phone: '+44',
    identityType: 'passport',
    identityNumber: '',
    address: '',
    deliverymanImage: null,
    identityImage: null,
    // Account Information
    email: '',
    password: '',
    confirmPassword: '',
    status: 'pending'
  });

  const handleChange = (field, value) => {
    setDelivery(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field, file) => {
    if (field === 'deliverymanImageFile') {
      setDeliverymanImageFile(file);
    } else if (field === 'identityImageFile') {
      setIdentityImageFile(file);
    }
    
    // Also store preview for display
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDelivery(prev => ({ ...prev, [field.replace('File', '')]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (delivery.password !== delivery.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate password length
    if (delivery.password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('firstName', delivery.firstName);
      formData.append('lastName', delivery.lastName);
      formData.append('phone', delivery.phone);
      formData.append('identityType', delivery.identityType);
      formData.append('identityNumber', delivery.identityNumber);
      formData.append('address', delivery.address);
      formData.append('email', delivery.email);
      formData.append('password', delivery.password);
      
      if (deliverymanImageFile) {
        formData.append('deliverymanImage', deliverymanImageFile);
      }
      
      if (identityImageFile) {
        formData.append('identityImage', identityImageFile);
      }

      const response = await axios.post('http://localhost:5000/api/deliverymen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Delivery man created:', response.data);
      alert('Delivery man added successfully!');
      
      // Reset form
      setDelivery({
        firstName: '',
        lastName: '',
        phone: '+44',
        identityType: 'passport',
        identityNumber: '',
        address: '',
        deliverymanImage: null,
        identityImage: null,
        email: '',
        password: '',
        confirmPassword: '',
        status: 'pending'
      });
      setDeliverymanImageFile(null);
      setIdentityImageFile(null);
    } catch (error) {
      console.error('Error creating delivery man:', error);
      alert('Error creating delivery man. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'white',
          border: '1px solid #e2e8f0'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 4 }}>
          Add New Delivery Man
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Section 1: General Information */}
          <Card sx={{ mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                General Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={delivery.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={delivery.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    placeholder="UK (+44) Ex:017********"
                    value={delivery.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: '#666' }} />
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Identity Type</InputLabel>
                    <Select
                      value={delivery.identityType}
                      label="Identity Type"
                      onChange={(e) => handleChange('identityType', e.target.value)}
                    >
                      <MenuItem value="passport">Passport</MenuItem>
                      <MenuItem value="driving_license">Driving License</MenuItem>
                      <MenuItem value="national_id">National ID</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Identity Number"
                    placeholder="Ex:DH-23434-LS"
                    value={delivery.identityNumber}
                    onChange={(e) => handleChange('identityNumber', e.target.value)}
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: '#666' }} />
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={delivery.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: <AddressIcon sx={{ mr: 1, mt: 1, color: '#666' }} />
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Deliveryman image * (Ratio 1:1)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={delivery.deliverymanImage}
                        sx={{ width: 80, height: 80, border: '2px dashed #ccc' }}
                      >
                        {delivery.deliverymanImage ? null : <UploadIcon />}
                      </Avatar>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                      >
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload('deliverymanImageFile', e.target.files[0])}
                        />
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Identity image
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={delivery.identityImage}
                        sx={{ width: 80, height: 80, border: '2px dashed #ccc' }}
                      >
                        {delivery.identityImage ? null : <UploadIcon />}
                      </Avatar>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                      >
                        Delivery man image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload('identityImageFile', e.target.files[0])}
                        />
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Section 2: Account Information */}
          <Card sx={{ mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Account Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    placeholder="admin@gmail.com"
                    value={delivery.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: '#666' }} />
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={delivery.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: '#666' }} />
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm password"
                    type="password"
                    value={delivery.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: '#666' }} />
                    }}
                    helperText="Password minimum 8 characters"
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                borderRadius: 2,
                px: 6,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                color: 'white !important',
                minWidth: 200
              }}
            >
              Add Delivery Man
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default AddDelivery;
