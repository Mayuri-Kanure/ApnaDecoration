import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Menu,
  MenuItem as MenuItemComponent,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  Brush as BannerIcon,
  Add as AddIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

function BannerSetup() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';
  const [bannerType, setBannerType] = useState('all');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [addBannerDialogOpen, setAddBannerDialogOpen] = useState(false);
  const [editBannerDialogOpen, setEditBannerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    image: null,
    bannerType: 'Main Banner',
    bannerUrl: '',
    resourceType: '',
    category: '',
    product: '',
    published: true,
  });

  const bannerTypes = ['All', 'Main Banner', 'Footer Banner', 'Promo Banner'];

  // Fetch real categories and products from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        
        if (!token) {
          console.error('No authentication token found');
          setCategories([]);
          setProducts([]);
          setLoading(false);
          return;
        }
        
        // Fetch categories and products
        const [categoriesResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error('Categories API error:', err.response?.status, err.response?.data);
            return { data: { categories: [] } };
          }),
          axios.get(`${API_BASE_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error('Products API error:', err.response?.status, err.response?.data);
            return { data: { products: [] } };
          })
        ]);

        console.log('Categories response:', categoriesResponse.data);
        console.log('Products response:', productsResponse.data);
        
        // Handle categories response (might be nested in 'categories' property)
        const categoriesData = categoriesResponse.data.categories || categoriesResponse.data || [];
        console.log('Categories data extracted:', categoriesData);
        console.log('Is categoriesData an array?', Array.isArray(categoriesData));
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // Handle products response (might be direct array or nested)
        const productsData = productsResponse.data.products || productsResponse.data || [];
        console.log('Products data extracted:', productsData);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch real banners from MongoDB
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/banners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle different response formats
        const bannersData = response.data.banners || response.data || [];
        console.log('📊 Initial banners fetch:', bannersData);
        console.log('📊 Initial banners count:', bannersData.length);
        setBanners(Array.isArray(bannersData) ? bannersData : []);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBanners();
  }, [API_BASE_URL]);

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update newBanner state for new banner creation
        setNewBanner(prev => ({
          ...prev,
          image: e.target.result,
          imageFile: file
        }));
        
        // Update editingBanner state for banner editing
        setEditingBanner(prev => prev ? {
          ...prev,
          image: e.target.result,
          imageFile: file
        } : prev);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload([file]);
    }
  };

  const getValidSelectedValue = () => {
    if (newBanner.resourceType === 'product') {
      const selectedProduct = products.find(p => p._id === newBanner.product);
      return selectedProduct ? newBanner.product : '';
    } else if (newBanner.resourceType === 'category') {
      const selectedCategory = categories.find(c => c._id === newBanner.category);
      return selectedCategory ? newBanner.category : '';
    }
    return '';
  };

  const getEditValidSelectedValue = () => {
    if (!editingBanner) return '';
    
    // If banner has an image, show it even if not in current arrays
    if (editingBanner.image) {
      if (editingBanner.resourceType === 'product') {
        return editingBanner.product || '';
      } else if (editingBanner.resourceType === 'category') {
        return editingBanner.category || '';
      }
      return '';
    }
    
    // For banners without images, validate against current arrays
    if (editingBanner.resourceType === 'product') {
      const selectedProduct = products.find(p => p._id === editingBanner.product);
      return selectedProduct ? editingBanner.product : '';
    } else if (editingBanner.resourceType === 'category') {
      const selectedCategory = categories.find(c => c._id === editingBanner.category);
      return selectedCategory ? editingBanner.category : '';
    }
    return '';
  };

  const handleAddBanner = () => {
    setAddBannerDialogOpen(true);
  };

  const handleCreateBanner = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add banner data
      formData.append('bannerType', newBanner.bannerType);
      formData.append('bannerUrl', newBanner.bannerUrl || '');
      formData.append('resourceType', newBanner.resourceType || '');
      formData.append('published', newBanner.published);

      // Add product or category reference based on resource type
      if (newBanner.resourceType === 'product' && newBanner.product) {
        formData.append('product', newBanner.product);
      } else if (newBanner.resourceType === 'category' && newBanner.category) {
        formData.append('category', newBanner.category);
      }

      // Add image file if exists
      if (newBanner.imageFile) {
        formData.append('image', newBanner.imageFile);
        console.log('Adding image file to upload:', newBanner.imageFile.name);
      }

      const response = await axios.post(`${API_BASE_URL}/banners`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
          // Don't set Content-Type - let axios set it with boundary for FormData
        }
      });
      
      console.log('Banner created:', response.data);
      
      // Refresh banners list to get latest data
      const fetchBanners = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE_URL}/banners`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const bannersData = response.data.banners || response.data || [];
          console.log('📊 Fetched banners:', bannersData);
          console.log('📊 Banners count:', bannersData.length);
          setBanners(Array.isArray(bannersData) ? bannersData : []);
        } catch (error) {
          console.error('Error refreshing banners:', error);
        }
      };
      
      await fetchBanners();
      
      setAddBannerDialogOpen(false);
      setNewBanner({
        image: null,
        bannerType: 'Main Banner',
        bannerUrl: '',
        resourceType: '',
        category: '',
        product: '',
        published: true,
      });
      
      alert('Banner created successfully!');
    } catch (error) {
      console.error('Error creating banner:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Error creating banner. Please try again.';
      alert(errorMessage);
    }
  };

  const togglePublished = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/banners/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state with response
      setBanners(banners.map(banner => 
        banner._id === id ? { ...banner, published: !banner.published } : banner
      ));
      
      alert('Banner status updated successfully!');
    } catch (error) {
      console.error('Error toggling banner:', error);
      alert('Error updating banner status');
    }
  };

  const handleDelete = (banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/banners/${selectedBanner._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setBanners(banners.filter(b => b._id !== selectedBanner._id));
      setDeleteDialogOpen(false);
      setSelectedBanner(null);
      
      alert('Banner deleted successfully!');
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Error deleting banner');
    }
  };

  const handleEdit = (banner) => {
    // Reset imageFile when opening edit dialog to ensure proper state
    setEditingBanner({
      ...banner,
      imageFile: null
    });
    setEditBannerDialogOpen(true);
  };

  const handleUpdateBanner = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add banner data
      formData.append('bannerType', editingBanner.bannerType);
      formData.append('bannerUrl', editingBanner.bannerUrl || '');
      formData.append('resourceType', editingBanner.resourceType || '');
      formData.append('published', editingBanner.published);

      // Add product or category reference based on resource type
      if (editingBanner.resourceType === 'product' && editingBanner.product) {
        formData.append('product', editingBanner.product);
      } else if (editingBanner.resourceType === 'category' && editingBanner.category) {
        formData.append('category', editingBanner.category);
      }

      // Add image file if exists
      if (editingBanner.imageFile) {
        formData.append('image', editingBanner.imageFile);
      }

      const response = await axios.put(`${API_BASE_URL}/banners/${editingBanner._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
          // Don't set Content-Type - let axios set it with boundary for FormData
        }
      });
      
      // Update local state
      setBanners(banners.map(banner => 
        banner._id === editingBanner._id ? response.data : banner
      ));
      setEditBannerDialogOpen(false);
      setEditingBanner(null);
      
      alert('Banner updated successfully!');
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Error updating banner. Please try again.');
    }
  };

  const handleBannerTypeChange = (event) => {
    setBannerType(event.target.value);
  };

  const safeBanners = Array.isArray(banners) ? banners : [];
  const filteredBanners = bannerType === 'all' 
    ? safeBanners 
    : safeBanners.filter(banner => banner.bannerType === bannerType);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
            Banner Setup
          </Typography>
          <Tooltip title="Information about banner setup">
            <IconButton size="small" sx={{ color: '#666' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Banner Type</InputLabel>
            <Select
              value={bannerType}
              onChange={handleBannerTypeChange}
              label="Banner Type"
            >
              {bannerTypes.map((type) => (
                <MenuItem key={type} value={type.toLowerCase()}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBanner}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Add Banner
          </Button>
        </Box>
      </Box>

      {/* Banner Table */}
      <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow key="header">
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>URL</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Published</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBanners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      {banner.image ? (
                        <img
                          src={banner.image.startsWith('http') ? banner.image : `${API_BASE_URL}${banner.image}`}
                          alt={banner.bannerType}
                          style={{
                            width: 60,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #e0e0e0'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            backgroundColor: '#f5f5f5'
                          }}
                        >
                          <BannerIcon sx={{ fontSize: 24, color: '#999' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Chip 
                        label={banner.bannerType}
                        size="small"
                        sx={{ 
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          borderColor: '#1976d2'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      {banner.bannerUrl ? (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {banner.bannerUrl}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                          No URL
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Switch
                        checked={banner.published}
                        onChange={() => togglePublished(banner._id)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            sx={{ color: '#1976d2' }}
                            onClick={() => handleEdit(banner)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            sx={{ color: '#f44336' }}
                            onClick={() => handleDelete(banner)}
                          >
                            <DeleteIcon fontSize="small" />
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

      {/* Add Banner Dialog */}
      <Dialog 
        open={addBannerDialogOpen} 
        onClose={() => setAddBannerDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
      >
        <DialogTitle>Banner Setup (Default)</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Left Column - Form Fields */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Banner Type</InputLabel>
                  <Select
                    value={newBanner.bannerType}
                    onChange={(e) => setNewBanner({...newBanner, bannerType: e.target.value})}
                    label="Banner Type"
                  >
                    <MenuItem value="Main Banner">Main Banner</MenuItem>
                    <MenuItem value="Footer Banner">Footer Banner</MenuItem>
                    <MenuItem value="Promo Banner">Promo Banner</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Banner URL"
                  value={newBanner.bannerUrl || ''}
                  onChange={(e) => setNewBanner({...newBanner, bannerUrl: e.target.value})}
                  placeholder="https://example.com"
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Resource Type</InputLabel>
                  <Select
                    value={newBanner.resourceType || ''}
                    onChange={(e) => setNewBanner({...newBanner, resourceType: e.target.value, product: '', category: ''})}
                    label="Resource Type"
                  >
                    <MenuItem value="">Select Resource Type</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="url">URL</MenuItem>
                  </Select>
                </FormControl>

                {(newBanner.resourceType === 'product' || newBanner.resourceType === 'category') && (
                  <FormControl fullWidth size="small">
                    <InputLabel>{newBanner.resourceType === 'product' ? 'Product' : 'Category'}</InputLabel>
                    <Select
                      value={getValidSelectedValue()}
                      onChange={(e) => {
                        setNewBanner({
                          ...newBanner, 
                          [newBanner.resourceType === 'product' ? 'product' : 'category']: e.target.value
                        });
                      }}
                      label={newBanner.resourceType === 'product' ? 'Product' : 'Category'}
                    >
                      <MenuItem value="">Select {newBanner.resourceType === 'product' ? 'Product' : 'Category'}</MenuItem>
                      {newBanner.resourceType === 'product' ? (
                        (Array.isArray(products) ? products.map(product => (
                          <MenuItem key={product._id} value={product._id}>
                            {product.product_name_en || product.name || `Product ${product._id?.slice(-6) || 'Unknown'}`}
                          </MenuItem>
                        )) : [])
                      ) : (
                        (Array.isArray(categories) ? categories.map(category => (
                          <MenuItem key={category._id} value={category._id}>
                            {category.name}
                          </MenuItem>
                        )) : [])
                      )}
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Grid>

            {/* Right Column - Upload Area */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#e3f2fd' : '#fafafa',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#999'
                  }
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('banner-image-input').click()}
              >
                <input
                  id="banner-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                
                {newBanner.image ? (
                  <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
                    <img
                      src={newBanner.image}
                      alt="Banner preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      Click to change
                    </Box>
                  </Box>
                ) : (
                  <>
                    <BannerIcon sx={{ fontSize: 60, color: isDragging ? '#1976d2' : '#999', mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: isDragging ? '#1976d2' : '#333' }}>
                      {isDragging ? 'Drop banner image here' : 'Drag & Drop Banner Image'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      or click to browse
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Supported formats: JPG, PNG, GIF, WebP
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddBannerDialogOpen(false)}>Reset</Button>
          <Button onClick={handleCreateBanner} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog 
        open={editBannerDialogOpen} 
        onClose={() => setEditBannerDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
      >
        <DialogTitle>Edit Banner</DialogTitle>
        <DialogContent>
          {editingBanner && (
            <Grid container spacing={3}>
              {/* Left Column - Form Fields */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Banner Type</InputLabel>
                    <Select
                      value={editingBanner.bannerType}
                      onChange={(e) => setEditingBanner({...editingBanner, bannerType: e.target.value})}
                      label="Banner Type"
                    >
                      <MenuItem value="Main Banner">Main Banner</MenuItem>
                      <MenuItem value="Footer Banner">Footer Banner</MenuItem>
                      <MenuItem value="Promo Banner">Promo Banner</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    size="small"
                    label="Banner URL"
                    value={editingBanner.bannerUrl || ''}
                    onChange={(e) => setEditingBanner({...editingBanner, bannerUrl: e.target.value})}
                    placeholder="https://example.com"
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel>Resource Type</InputLabel>
                    <Select
                      value={editingBanner.resourceType || ''}
                      onChange={(e) => setEditingBanner({...editingBanner, resourceType: e.target.value, product: '', category: ''})}
                      label="Resource Type"
                    >
                      <MenuItem value="">Select Resource Type</MenuItem>
                      <MenuItem value="product">Product</MenuItem>
                      <MenuItem value="category">Category</MenuItem>
                      <MenuItem value="url">URL</MenuItem>
                    </Select>
                  </FormControl>

                  {(editingBanner.resourceType === 'product' || editingBanner.resourceType === 'category') && (
                    <FormControl fullWidth size="small">
                      <InputLabel>{editingBanner.resourceType === 'product' ? 'Product' : 'Category'}</InputLabel>
                      <Select
                        value={getEditValidSelectedValue()}
                        onChange={(e) => {
                          setEditingBanner({
                            ...editingBanner, 
                            [editingBanner.resourceType === 'product' ? 'product' : 'category']: e.target.value
                          });
                        }}
                        label={editingBanner.resourceType === 'product' ? 'Product' : 'Category'}
                      >
                        <MenuItem value="">Select {editingBanner.resourceType === 'product' ? 'Product' : 'Category'}</MenuItem>
                        {editingBanner.resourceType === 'product' ? (
                          (Array.isArray(products) ? products.map(product => (
                            <MenuItem key={product._id} value={product._id}>
                              {product.product_name_en || product.name || `Product ${product._id?.slice(-6) || 'Unknown'}`}
                            </MenuItem>
                          )) : [])
                        ) : (
                          (Array.isArray(categories) ? categories.map(category => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          )) : [])
                        )}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Grid>

              {/* Right Column - Upload Area */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: isDragging ? '#e3f2fd' : '#fafafa',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      borderColor: '#999'
                    }
                  }}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('edit-banner-image-input').click()}
                >
                  <input
                    id="edit-banner-image-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  
                  {editingBanner.image || editingBanner.imageFile ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
                      <img
                        src={
                          editingBanner.imageFile 
                            ? editingBanner.image 
                            : (editingBanner.image?.startsWith('http') 
                              ? editingBanner.image 
                              : `${API_BASE_URL}${editingBanner.image}`)
                        }
                        alt="Banner preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        Click to change
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <BannerIcon sx={{ fontSize: 60, color: '#999', mb: 2 }} />
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                        Click to change banner image
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        or drag and drop
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Supported formats: JPG, PNG, GIF, WebP
                      </Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditBannerDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateBanner} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this banner? This action cannot be undone.
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

export default BannerSetup;
