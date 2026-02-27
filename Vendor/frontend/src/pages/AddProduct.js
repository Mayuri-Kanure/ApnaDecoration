import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vendorApi from '../services/vendorApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Autorenew as RefreshIcon
} from '@mui/icons-material';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Function to generate SKU automatically
  const generateSKU = (productName) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const code = `SKU-${timestamp}-${random}`;
    return code;
  };
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit_price: '',
    brand: '',
    category: '',
    description: ''
  });

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await vendorApi.getCategories();
        
        let categoriesData = [];
        if (response && response.categories) {
          categoriesData = response.categories;
        } else if (response && Array.isArray(response)) {
          categoriesData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        }
        
        const filteredCategories = categoriesData.filter((cat, index) => {
          return index !== 0; // Remove first category
        });
        
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      newErrors.unit_price = 'Valid price is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      setError('Please login to add products');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('product_name_en', formData.name);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('price', parseFloat(formData.unit_price));
      formDataToSend.append('brand', formData.brand || 'Generic Brand');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });
      
      const response = await vendorApi.createVendorProduct(formDataToSend);
      
      setSuccess('Product submitted for approval! It will be reviewed by admin.');
      
      // Reset form
      setFormData({
        name: '',
        sku: '',
        unit_price: '',
        brand: '',
        category: '',
        description: ''
      });
      setImages([]);
      
      // Redirect to products page after 2 seconds
      setTimeout(() => {
        navigate('/products');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ color: '#64748b' }}
        >
          Back to Products
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
          Add New Product
        </Typography>
      </Box>

      {/* Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
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
            <Grid container spacing={2}>
              {/* Product Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              {/* SKU */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#374151' }}>
                  Product SKU <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  error={!!errors.sku}
                  helperText={errors.sku || "Auto-generated SKU"}
                  required
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => {
                        const newSKU = generateSKU();
                        setFormData(prev => ({ ...prev, sku: newSKU }));
                      }} size="small" sx={{ color: '#2563eb' }}>
                        <RefreshIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              {/* Price */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  name="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={handleChange}
                  error={!!errors.unit_price}
                  helperText={errors.unit_price}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Brand */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  error={!!errors.brand}
                  helperText={errors.brand}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  error={!!errors.category}
                  helperText={errors.category}
                  required
                >
                  <MenuItem value="">Select a category</MenuItem>
                  {categories.map((cat) => {
                    const catId = cat._id || cat.id || cat;
                    const catName = cat.name || cat;
                    
                    return (
                      <MenuItem key={catId} value={catId}>
                        {catName}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              {/* Images */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                >
                  Upload Images (Max 10)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {images.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {images.length} image(s) selected
                  </Typography>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/products')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                    sx={{ backgroundColor: '#1976d2' }}
                  >
                    {loading ? 'Creating...' : 'Create Product'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddProduct;
