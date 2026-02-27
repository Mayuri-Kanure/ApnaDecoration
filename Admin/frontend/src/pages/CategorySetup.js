import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

function CategorySetup() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const params = {
        ...(searchTerm && { search: searchTerm })
      };
      
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        params,
        headers
      });
      
      console.log('Categories fetched:', response.data);
      console.log('First category data:', response.data?.categories?.[0]);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Fetch error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        console.log('Authentication failed, clearing categories');
        setCategories([]);
        alert('Your session has expired. Please login again.');
      } else {
        setCategories([]);
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, fetchCategories]);

  const [formData, setFormData] = useState({
    categoryName: '',
    priority: 1,
    categoryImage: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, categoryImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData({
      categoryName: '',
      priority: 1,
      categoryImage: null,
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called!');
    
    if (!formData.categoryName.trim()) {
      alert('Category name is required!');
      return;
    }

    try {
      const categoryData = {
        name: formData.categoryName,
        priority: formData.priority,
        image: formData.categoryImage,
        homeCategory: true,
        status: 'active'
      };

      console.log('Submitting category data:', categoryData);
      
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let response;
      if (editMode && editId) {
        // Update existing category
        console.log('Making PUT request to:', `${API_BASE_URL}/categories/${editId}`);
        response = await axios.put(`${API_BASE_URL}/categories/${editId}`, categoryData, { headers });
        console.log('Category updated:', response.data);
        alert('Category updated successfully!');
      } else {
        // Create new category
        console.log('Making POST request to:', `${API_BASE_URL}/categories`);
        response = await axios.post(`${API_BASE_URL}/categories`, categoryData, { headers });
        console.log('Category created:', response.data);
        alert('Category added successfully!');
      }

      await fetchCategories();
      handleReset();
    } catch (error) {
      console.error('Error saving category:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map(err => err.msg).join(', ');
          alert(`Validation failed: ${validationErrors}`);
        } else if (error.response.status === 401) {
          alert('Authentication failed. Please login again.');
          console.log('401 Error detected - NOT clearing localStorage for debugging');
          // localStorage.removeItem('token');
          // window.location.href = '/login';
        } else if (error.response.status === 403) {
          alert('Access denied. You don\'t have permission to create categories.');
        } else if (error.response.status === 500) {
          alert('Server error occurred. Please check the backend server logs.');
        } else {
          alert(`Failed to save category: ${errorData.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        alert('Failed to save category: Network error - could not connect to server');
      } else {
        alert(`Failed to save category: ${error.message}`);
      }
    }
  };

  const handleEdit = (category) => {
    console.log('Editing category:', category);
    setFormData({
      categoryName: category.name,
      priority: category.priority,
      categoryImage: category.image,
    });
    setEditMode(true);
    setEditId(category._id || category.id);
  };

  const handleDelete = (id) => {
    console.log('Delete called with ID:', id);
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log('Attempting to delete category with ID:', deleteId);
      console.log('Delete URL:', `${API_BASE_URL}/categories/${deleteId}`);
      
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.delete(`${API_BASE_URL}/categories/${deleteId}`, { headers });
      
      console.log('Delete response:', response.data);
      await fetchCategories();
      setDeleteDialogOpen(false);
      setDeleteId(null);
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      console.error('Full error object:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        request: error.request ? 'Request made but failed' : 'Request not made'
      });
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Failed to delete category: ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        console.error('Request error - no response received');
        alert('Failed to delete category: Network error - could not connect to server');
      } else {
        console.error('Setup error - request not made');
        alert(`Failed to delete category: ${error.message}`);
      }
    }
  };

  const toggleHomeCategory = async (id) => {
    try {
      const category = categories.find(cat => cat._id === id);
      
      // Get auth token
      const token = localStorage.getItem('token');
      console.log('🔑 Toggle Category Token:', token ? 'EXISTS' : 'NOT FOUND');
      console.log('🔑 Token Length:', token?.length || 0);
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log('🔑 Headers:', headers);
      
      console.log('🔍 Making PATCH request to:', `${API_BASE_URL}/categories/${id}/status`);
      console.log('🔍 Request body:', { status: category.status === 'active' ? 'inactive' : 'active' });
      
      const response = await axios.patch(`${API_BASE_URL}/categories/${id}/status`, {
        status: category.status === 'active' ? 'inactive' : 'active'
      }, { headers });
      
      console.log('✅ Category status updated:', response.data);
      await fetchCategories();
    } catch (error) {
      console.error('❌ Error toggling category status:', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
        alert(`Failed to toggle category status: ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('Failed to toggle category status: Network error');
      }
    }
  };

  const handleSearch = () => {
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Priority', 'Home Category'],
      ...categories.map(cat => [cat.id, cat.name, cat.priority, cat.homeCategory ? 'Yes' : 'No'])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const displayCategories = searchTerm ? handleSearch() : categories;

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
          Category Setup
        </Typography>
        <Button variant="contained" startIcon={<DashboardIcon />} sx={{ backgroundColor: '#1976d2' }} onClick={() => window.location.href = '/dashboard'}>
          Dashboard
        </Button>
      </Box>

      {/* Language Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, backgroundColor: 'white' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab key="en" label="English (EN)" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {/* Category Setup Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                {editMode ? 'Edit Category' : 'Category Setup'}
              </Typography>

              {/* Category Name */}
              <TextField
                fullWidth
                label="Category Name* (EN)"
                value={formData.categoryName}
                onChange={handleInputChange('categoryName')}
                required
                sx={{ mb: 2 }}
                size="small"
              />

              {/* Priority */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={handleInputChange('priority')}
                  label="Priority"
                  size="small"
                >
                  {[...Array(20)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Category Image Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#666', fontSize: '12px' }}>
                  Category Logo • Ratio 1:1 (500 x 500 px)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="category-image-upload"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="category-image-upload"
                    startIcon={<FileUploadIcon />}
                    size="small"
                    sx={{ borderColor: '#ddd', color: '#666' }}
                  >
                    Choose File
                  </Button>
                  {formData.categoryImage && (
                    <Avatar
                      src={formData.categoryImage}
                      sx={{ width: 50, height: 50 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Form Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                  size="small"
                  sx={{ borderColor: '#ddd', color: '#666' }}
                >
                  Reset
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    console.log('Button clicked!');
                    alert('Button clicked!');
                    handleSubmit();
                  }}
                  size="small"
                  sx={{ backgroundColor: '#1976d2' }}
                >
                  {editMode ? 'Update' : 'Submit'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category List */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  Category List ({displayCategories.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    placeholder="Search by category name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: '#666', fontSize: 20 }} />,
                    }}
                    sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderColor: '#ddd' } }}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={handleExport}
                    size="small"
                    sx={{ borderColor: '#ddd', color: '#666' }}
                  >
                    Export
                  </Button>
                </Box>
              </Box>

              {/* Category Table */}
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Category Image</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Home Category Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayCategories.map((category) => (
                      <TableRow key={category._id} hover sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{category._id}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Avatar
                            src={category.image}
                            sx={{ width: 40, height: 40, backgroundColor: '#f5f5f5' }}
                          >
                            <CategoryIcon sx={{ color: '#999' }} />
                          </Avatar>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                          {category.name}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Chip 
                            label={category.priority} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ backgroundColor: '#e3f2fd', borderColor: '#1976d2', color: '#1976d2' }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Switch
                            checked={category.homeCategory}
                            onChange={() => toggleHomeCategory(category._id)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ color: '#1976d2' }}
                              onClick={() => handleEdit(category)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: '#f44336' }}
                              onClick={() => handleDelete(category._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this category? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CategorySetup;
