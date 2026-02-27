import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Save,
  ArrowBack,
  AddPhotoAlternate,
  Delete,
  RoomService,
  CurrencyRupee,
  Upload
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const AddService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    serviceType: 'Party',
    price: '',
    images: [],
    bannerImage: '',
    bannerImageFile: null,
    featured: false,
    availability: true,
    customizationAvailable: true
  });

  const serviceTypes = ['Anniversary', 'Proposal', 'Party', 'Wedding', 'Festival', 'Office'];

  useEffect(() => {
    fetchServiceCategories();
    // Check if we're in edit mode
    const pathParts = window.location.pathname.split('/');
    if (pathParts.includes('edit-service')) {
      const serviceId = pathParts[pathParts.length - 1];
      if (serviceId && serviceId !== 'edit-service') {
        fetchService(serviceId);
      }
    }
  }, []);

  const fetchServiceCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/service-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServiceCategories(response.data.data || response.data.categories || []);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };

  const fetchService = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const service = response.data.data;
      setServiceData({
        name: service.name || '',
        description: service.description || '',
        serviceType: service.serviceType || 'Party',
        price: service.price || '',
        images: service.images || [],
        bannerImage: service.bannerImage || '',
        featured: service.featured || false,
        availability: service.availability !== undefined ? service.availability : true,
        customizationAvailable: service.customizationAvailable !== undefined ? service.customizationAvailable : true
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to load service data');
    }
  };

  const handleInputChange = (field, value) => {
    setServiceData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleImageAdd = () => {
    setImageDialogOpen(true);
  };

  const handleImageDialogClose = () => {
    setImageDialogOpen(false);
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setServiceData(prev => ({
            ...prev,
            images: [...prev.images, e.target.result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset the input
    event.target.value = '';
  };

  const handleImageRemove = (index) => {
    setServiceData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleBannerImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setServiceData(prev => ({
        ...prev,
        bannerImageFile: file,
        bannerImage: URL.createObjectURL(file)
      }));
    }
  };

  const validateForm = () => {
    if (!serviceData.name.trim()) {
      setError('Service name is required');
      return false;
    }
    if (!serviceData.description.trim()) {
      setError('Service description is required');
      return false;
    }
    if (!serviceData.serviceType) {
      setError('Service type is required');
      return false;
    }
    if (!serviceData.price || serviceData.price <= 0) {
      setError('Valid price is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('name', serviceData.name);
      formData.append('description', serviceData.description);
      formData.append('serviceType', serviceData.serviceType);
      formData.append('price', parseFloat(serviceData.price));
      formData.append('featured', serviceData.featured);
      formData.append('availability', serviceData.availability);
      formData.append('customizationAvailable', serviceData.customizationAvailable);
      
      if (serviceData.bannerImageFile) {
        formData.append('bannerImage', serviceData.bannerImageFile);
      }
      
      if (serviceData.images.length > 0) {
        formData.append('images', JSON.stringify(serviceData.images));
      }

      const pathParts = window.location.pathname.split('/');
      const isEdit = pathParts.includes('edit-service');
      
      if (isEdit) {
        const serviceId = pathParts[pathParts.length - 1];
        await axios.put(`${API_BASE_URL}/services/${serviceId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Service updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/services`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Service created successfully!');
      }

      setTimeout(() => {
        navigate('/dashboard/services');
      }, 2000);

    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/dashboard/services')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            {window.location.pathname.includes('edit-service') ? 'Edit Service' : 'Add New Service'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Service Name"
                      value={serviceData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <RoomService sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Service Type</InputLabel>
                      <Select
                        value={serviceData.serviceType}
                        label="Service Type"
                        onChange={(e) => handleInputChange('serviceType', e.target.value)}
                      >
                        {serviceCategories.map(category => (
                          <MenuItem key={category._id} value={category.name}>{category.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={serviceData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      placeholder="Describe your service in detail..."
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={serviceData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <CurrencyRupee sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Banner Image
                      </Typography>
                      <input
                        accept="image/*"
                        id="banner-image-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleBannerImageUpload}
                      />
                      <label htmlFor="banner-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Upload />}
                          fullWidth
                        >
                          Upload Banner Image
                        </Button>
                      </label>
                      {serviceData.bannerImage && (
                        <Box sx={{ mt: 2 }}>
                          <img
                            src={serviceData.bannerImage}
                            alt="Banner preview"
                            style={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Settings */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Settings
                </Typography>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={serviceData.availability}
                        onChange={(e) => handleInputChange('availability', e.target.checked)}
                        color="success"
                      />
                    }
                    label="Available"
                    sx={{ mb: 2, display: 'block' }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={serviceData.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Featured Service"
                    sx={{ mb: 2, display: 'block' }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={serviceData.customizationAvailable}
                        onChange={(e) => handleInputChange('customizationAvailable', e.target.checked)}
                        color="info"
                      />
                    }
                    label="Customization Available"
                    sx={{ display: 'block' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Images */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Service Images
                  </Typography>
                  <input
                    accept="image/*"
                    id="service-images-upload"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="service-images-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                    >
                      Upload Images
                    </Button>
                  </label>
                </Box>

                {serviceData.images.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
                    <AddPhotoAlternate sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No images added yet. Click "Upload Images" to add service images.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {serviceData.images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={{ position: 'relative' }}>
                          <img
                            src={image}
                            alt={`Service image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              display: 'flex',
                              gap: 1
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => setServiceData(prev => ({
                                ...prev,
                                bannerImage: image
                              }))}
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                '&:hover': { backgroundColor: 'white' }
                              }}
                              title="Set as Banner"
                            >
                              <RoomService fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleImageRemove(index)}
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                '&:hover': { backgroundColor: 'white' }
                              }}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                          {serviceData.bannerImage === image && (
                            <Chip
                              label="Banner"
                              size="small"
                              color="primary"
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8
                              }}
                            />
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/services')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Service'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

    </Box>
  );
};

export default AddService;
