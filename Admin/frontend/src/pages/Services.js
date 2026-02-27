import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    featured: false,
    status: 'active',
    priority: 0
  });
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/services');
      if (response.success) {
        setServices(response.services || response.data || []);
      } else {
        setError('Failed to fetch services');
      }
    } catch (err) {
      setError('Error fetching services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/service-categories');
      if (response.success) {
        setCategories(response.categories || response.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      featured: false,
      status: 'active',
      priority: 0
    });
    setDialogOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || '',
      category: service.category?._id || service.category || '',
      featured: service.featured || false,
      status: service.status || 'active',
      priority: service.priority || 0
    });
    setDialogOpen(true);
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        await apiService.put(`/services/${editingService._id}`, formData);
      } else {
        await apiService.post('/services', formData);
      }
      setDialogOpen(false);
      fetchServices();
    } catch (err) {
      setError('Error saving service');
      console.error('Error saving service:', err);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await apiService.delete(`/services/${serviceId}`);
        fetchServices();
      } catch (err) {
        setError('Error deleting service');
        console.error('Error deleting service:', err);
      }
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading services...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Services Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddService}
        >
          Add Service
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>
                  Duration
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>
                  Featured
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service._id} hover sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333', fontWeight: 500 }}>
                    {service.name}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    {service.category?.name || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    ₹{service.price}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    {service.duration}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Chip
                      label={service.status}
                      color={service.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Chip
                      label={service.featured ? 'Featured' : 'Regular'}
                      color={service.featured ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/dashboard/services/${service._id}`)}
                        title="View"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditService(service)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteService(service._id)}
                        title="Delete"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Service Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Service Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Price (₹)"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              fullWidth
              required
            />
            <TextField
              label="Duration"
              value={formData.duration}
              onChange={handleInputChange('duration')}
              fullWidth
              placeholder="e.g., 2 hours, 1 day"
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleInputChange('category')}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={handleInputChange('priority')}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={handleSwitchChange('featured')}
                  />
                }
                label="Featured"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveService} variant="contained">
            {editingService ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Services;
