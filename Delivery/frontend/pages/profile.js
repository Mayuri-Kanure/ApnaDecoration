import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Person,
  Edit,
  LocalShipping,
  Phone,
  Email,
  Save as SaveIcon,
  CameraAlt,
  LocationOn,
  Cancel as CancelIcon
} from '@mui/icons-material';

export default function DeliveryBoyProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Profile data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    bankAccount: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    emergencyContact: '',
    isAvailable: true,
    currentLocation: ''
  });

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('deliveryBoyToken');
    if (!token) {
      router.push('/delivery-boy/login');
      return;
    }
    
    // Load profile data
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.get('http://localhost:5002/api/delivery-boys/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data); // Debug log
      
      // Map vehicle type from backend to frontend
      const vehicleTypeMap = {
        'motorcycle': 'bike',
        'bike': 'bike',
        'scooter': 'scooter', 
        'car': 'car',
        'van': 'van',
        'truck': 'truck'
      };
      
      // Map API response to frontend state structure
      // Backend returns { success: true, data: deliveryBoy }
      const apiData = response.data.data || response.data; // Handle both structures
      const mappedProfile = {
        name: `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim(),
        email: apiData.email || '',
        phone: apiData.phone || '',
        vehicleType: vehicleTypeMap[apiData.vehicleType] || 'bike',
        vehicleNumber: apiData.vehicleNumber || '',
        bankAccount: apiData.bankDetails?.bankAccount || '',
        ifscCode: apiData.bankDetails?.ifscCode || '',
        bankName: apiData.bankDetails?.bankName || '',
        accountHolderName: apiData.bankDetails?.accountHolderName || '',
        address: {
          street: apiData.address?.street || '',
          city: apiData.address?.city || '',
          state: apiData.address?.state || '',
          pincode: apiData.address?.pincode || ''
        },
        emergencyContact: apiData.emergencyContact?.phone || '',
        isAvailable: apiData.isAvailable !== undefined ? apiData.isAvailable : true,
        currentLocation: apiData.currentLocation || '',
        profileImage: apiData.profileImage || ''
      };
      
      console.log('Mapped Profile:', mappedProfile); // Debug log
      setProfile(mappedProfile);
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Use mock data for development
      setProfile({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        vehicleType: 'bike',
        vehicleNumber: 'DL-01-AB-1234',
        bankAccount: '1234567890',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        accountHolderName: 'John Doe',
        address: {
          street: '123 Main Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        emergencyContact: '9876543211',
        isAvailable: true,
        currentLocation: 'Delhi, India'
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setEditing(false);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      await axios.put('http://localhost:5002/api/delivery-boys/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({ open: true, message: 'Error updating profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset to original data
    loadProfileData();
  };

  const handleToggleAvailability = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      await axios.put('http://localhost:5002/api/delivery-boys/availability', 
        { isAvailable: !profile.isAvailable }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setProfile({ ...profile, isAvailable: !profile.isAvailable });
      setSnackbar({ 
        open: true, 
        message: `Status updated to ${!profile.isAvailable ? 'Available' : 'Unavailable'}`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  const handleProfileImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({ 
        open: true, 
        message: 'Please select a valid image file (JPEG, PNG, or WebP)', 
        severity: 'error' 
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSnackbar({ 
        open: true, 
        message: 'Image size should be less than 5MB', 
        severity: 'error' 
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setProfileImage(file);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', profileImage);

    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.post(
        'http://localhost:5002/api/delivery-boys/upload-profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSnackbar({ 
        open: true, 
        message: 'Profile image uploaded successfully!', 
        severity: 'success' 
      });
      
      // Update profile with new image URL
      setProfile(prev => ({
        ...prev,
        profileImage: response.data.imageUrl
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to upload image. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#1e3a5f', color: 'white', p: 2, mb: 3 }}>
        <Typography variant="h4">Profile Management</Typography>
      </Box>

      {/* Profile Form */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Personal Information</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Avatar
                      src={imagePreview || profile.profileImage}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        backgroundColor: '#2d5a8c', 
                        mx: 'auto',
                        border: '2px solid #e2e8f0'
                      }}
                    >
                      {!imagePreview && !profile.profileImage && <Person sx={{ fontSize: 40 }} />}
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<CameraAlt />}
                        onClick={handleProfileImageUpload}
                        disabled={uploading}
                        size="small"
                      >
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                      {imagePreview && (
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setImagePreview(null);
                            setProfileImage(null);
                          }}
                          size="small"
                          color="error"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={profile.address?.street || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      address: { ...profile.address, street: e.target.value }
                    })}
                    disabled={!editing}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profile.address?.city || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      address: { ...profile.address, city: e.target.value }
                    })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={profile.address?.state || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      address: { ...profile.address, state: e.target.value }
                    })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    value={profile.address?.pincode || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      address: { ...profile.address, pincode: e.target.value }
                    })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Location"
                    value={profile.currentLocation || ''}
                    onChange={(e) => setProfile({ ...profile, currentLocation: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">Availability Status</Typography>
                    <Switch
                      checked={profile.isAvailable || false}
                      onChange={handleToggleAvailability}
                      color="primary"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {(profile.isAvailable || false) ? 'Available' : 'Unavailable'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {editing ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={loading || uploading}
                      sx={{ flex: 1 }}
                    >
                      {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                    {imagePreview && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<SaveIcon />}
                        onClick={handleImageUpload}
                        disabled={uploading}
                        sx={{ flex: 1 }}
                      >
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    sx={{ flex: 1 }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Vehicle Information</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#1e3a5f' }}>Vehicle Type</Typography>
                  <Select
                    fullWidth
                    value={profile.vehicleType || 'bike'}
                    onChange={(e) => setProfile({ ...profile, vehicleType: e.target.value })}
                    disabled={!editing}
                  >
                    <MenuItem value="bike">Bike</MenuItem>
                    <MenuItem value="scooter">Scooter</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                    <MenuItem value="truck">Truck</MenuItem>
                  </Select>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    value={profile.vehicleNumber}
                    onChange={(e) => setProfile({ ...profile, vehicleNumber: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Bank Information</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={profile.bankName}
                    onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={profile.bankAccount}
                    onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    value={profile.ifscCode}
                    onChange={(e) => setProfile({ ...profile, ifscCode: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    value={profile.accountHolderName}
                    onChange={(e) => setProfile({ ...profile, accountHolderName: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="h6">Loading profile data...</Typography>
        </Box>
      )}

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

