import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Search,
  FilterList,
  Visibility,
  Star,
  RoomService,
  CurrencyRupee
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const serviceTypes = ['all', 'Anniversary', 'Proposal', 'Party', 'Wedding', 'Festival', 'Office'];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, filterType, filterStatus]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token);
      const response = await axios.get(`${API_BASE_URL}/services`, {
        headers: { 
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json'
        }
      });
      console.log('📡 API Response:', response.data);
      console.log('📊 Response structure:', JSON.stringify(response.data, null, 2));
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = useCallback(() => {
    console.log('🔍 Filtering services...');
    console.log('📊 Total services:', services.length);
    console.log('🔎 Filter type:', filterType);
    console.log('🔎 Filter status:', filterStatus);
    console.log('🔎 Search term:', searchTerm);
    
    let filtered = services;

    if (filterType !== 'all') {
      filtered = filtered.filter(service => service.serviceType === filterType);
      console.log(`📝 Filtered by type "${filterType}": ${filtered.length} services`);
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'available') {
        filtered = filtered.filter(service => service.availability);
        console.log(`✅ Filtered by available: ${filtered.length} services`);
      } else if (filterStatus === 'unavailable') {
        filtered = filtered.filter(service => !service.availability);
        console.log(`❌ Filtered by unavailable: ${filtered.length} services`);
      } else if (filterStatus === 'featured') {
        filtered = filtered.filter(service => service.featured);
        console.log(`⭐ Filtered by featured: ${filtered.length} services`);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`🔍 Filtered by search "${searchTerm}": ${filtered.length} services`);
    }

    console.log('🎯 Final filtered services:', filtered.length);
    setFilteredServices(filtered);
  }, [services, searchTerm, filterType, filterStatus]);

  const handleDelete = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/services/${serviceToDelete._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchServices();
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setViewDialogOpen(true);
  };

  const toggleAvailability = async (service) => {
    try {
      const token = localStorage.getItem('token');
      const updatedService = { ...service, availability: !service.availability };
      await axios.put(`${API_BASE_URL}/services/${service._id}`, updatedService, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(services.map(s => s._id === service._id ? updatedService : s));
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const toggleFeatured = async (service) => {
    try {
      const token = localStorage.getItem('token');
      const updatedService = { ...service, featured: !service.featured };
      await axios.put(`${API_BASE_URL}/services/${service._id}`, updatedService, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(services.map(s => s._id === service._id ? updatedService : s));
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Typography>Loading services...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {console.log('🎨 About to render services table, services count:', filteredServices.length)}
      {filteredServices.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            No services found
          </Typography>
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight="bold">
              Service Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              href="/dashboard/add-service"
            >
              Add Service
            </Button>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Service Type</InputLabel>
                    <Select
                      value={filterType}
                      label="Service Type"
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      {serviceTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type === 'all' ? 'All Types' : type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="unavailable">Unavailable</MenuItem>
                      <MenuItem value="featured">Featured</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setFilterStatus('all');
                    }}
                    fullWidth
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Services Table */}
          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {console.log('🎨 Rendering table with filteredServices:', filteredServices.length)}
                    {filteredServices.map((service) => (
                        <TableRow key={service._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                src={service.bannerImage || service.images?.[0]}
                                alt={service.name}
                                sx={{ width: 50, height: 50 }}
                              >
                                <RoomService />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {service.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {service.description.length > 50 
                                    ? `${service.description.substring(0, 50)}...` 
                                    : service.description}
                                </Typography>
                                <Box display="flex" gap={1} mt={1}>
                                  {service.featured && (
                                    <Chip
                                      icon={<Star fontSize="small" />}
                                      label="Featured"
                                      size="small"
                                      color="primary"
                                    />
                                  )}
                                  {service.customizationAvailable && (
                                    <Chip
                                      label="Customizable"
                                      size="small"
                                      color="success"
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            </TableCell>
                          <TableCell>
                            <Chip
                              label={service.serviceType}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CurrencyRupee fontSize="small" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                {service.price.toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={service.availability}
                                    onChange={() => toggleAvailability(service)}
                                    color="success"
                                  />
                                }
                                label={service.availability ? 'Available' : 'Unavailable'}
                                sx={{ mb: 1 }}
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={service.featured}
                                    onChange={() => toggleFeatured(service)}
                                    color="primary"
                                  />
                                }
                                label="Featured"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewService(service)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  href={`/dashboard/edit-service/${service._id}`}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(service)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete service "{serviceToDelete?.name}"? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Service Detail View Dialog */}
          <Dialog 
            open={viewDialogOpen} 
            onClose={() => setViewDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" component="div">
                Service Details: {selectedService?.name}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              {selectedService && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Service Information
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" paragraph>
                        <strong>Name:</strong> {selectedService.name}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Type:</strong> {selectedService.serviceType}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Price:</strong> ₹{selectedService.price.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Description:</strong> {selectedService.description}
                      </Typography>
                      <Box display="flex" gap={1} mt={2}>
                        <Typography variant="body2">
                          <strong>Status:</strong> 
                        </Typography>
                        <Chip 
                          label={selectedService.availability ? 'Available' : 'Unavailable'}
                          color={selectedService.availability ? 'success' : 'error'}
                          size="small"
                        />
                        {selectedService.featured && (
                          <Chip 
                            icon={<Star fontSize="small" />}
                            label="Featured"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                        {selectedService.customizationAvailable && (
                          <Chip 
                            label="Customizable"
                            color="info"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Images
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {selectedService.images && selectedService.images.length > 0 ? (
                        <Grid container spacing={2}>
                          {selectedService.images.map((image, index) => (
                            <Grid item xs={6} md={4} key={index}>
                              <Box
                                component="img"
                                src={image}
                                alt={`${selectedService.name} image ${index + 1}`}
                                sx={{
                                  width: '100%',
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: '1px solid #e0e0e0'
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No images available
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setViewDialogOpen(false);
                  window.open(`http://localhost:3001/service/${selectedService._id}`, '_blank');
                }}
              >
                View in User Site
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ServiceList;
