import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
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
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Switch,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Dashboard as DashboardIcon,
  Settings as AttributesIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  ColorLens as ColorIcon,
  Straighten as SizeIcon,
  Scale as WeightIcon,
  Inventory as StockIcon,
} from '@mui/icons-material';

function ProductAttributes() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeType, setAttributeType] = useState('all');
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    values: [],
    category: '',
    required: false,
    active: true,
    description: '',
  });

  const attributeTypes = [
    { value: 'text', label: 'Text', icon: <LabelIcon /> },
    { value: 'number', label: 'Number', icon: <WeightIcon /> },
    { value: 'color', label: 'Color', icon: <ColorIcon /> },
    { value: 'size', label: 'Size', icon: <SizeIcon /> },
  ];

  const categories = [
    'All Products',
    'Clothing',
    'Electronics',
    'Food',
    'Books',
    'Sports',
    'Toys',
    'Home & Garden',
  ];

  // Fetch attributes from API
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/attributes`);
        console.log('Raw API response:', response);
        console.log('Response data:', response.data);
        
        // Ensure we set an array, handle different response formats
        let attributesArray = [];
        if (response.data && Array.isArray(response.data)) {
          attributesArray = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          attributesArray = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          // If it's an object, try to extract array from it
          const values = Object.values(response.data);
          attributesArray = values.find(Array.isArray) || [];
        }
        
        console.log('Setting attributes to:', attributesArray);
        setAttributes(attributesArray);
      } catch (err) {
        console.error('Error fetching attributes:', err);
        setError('Failed to load attributes');
        setAttributes([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    setAttributeType(event.target.value);
  };

  const filteredAttributes = Array.isArray(attributes) ? attributes.filter(attribute => {
    const matchesSearch = 
      attribute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attribute.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attribute.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = attributeType === 'all' || attribute.type === attributeType;
    
    // Only show attributes that are used in Add Product page (Color and Size)
    const isUsedInAddProduct = attribute.name.toLowerCase() === 'color' || attribute.name.toLowerCase() === 'size';
    
    return matchesSearch && matchesType && isUsedInAddProduct;
  }) : [];

  const handleViewDetails = (attribute) => {
    setSelectedAttribute(attribute);
    setDetailsDialogOpen(true);
  };

  const handleEdit = (attribute) => {
    setFormData({
      name: attribute.name,
      type: attribute.type,
      values: attribute.values,
      category: attribute.category,
      required: attribute.required,
      active: attribute.active,
      description: attribute.description,
    });
    setSelectedAttribute(attribute);
    setEditDialogOpen(true);
  };

  const handleDelete = (attribute) => {
    setSelectedAttribute(attribute);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/attributes/${selectedAttribute.id}`);
      setAttributes(Array.isArray(attributes) ? attributes.filter(attr => attr.id !== selectedAttribute.id) : []);
      setDeleteDialogOpen(false);
      setSelectedAttribute(null);
      alert('Attribute deleted successfully!');
    } catch (error) {
      console.error('Error deleting attribute:', error);
      alert('Failed to delete attribute');
    }
  };

  const toggleActiveStatus = async (id) => {
    try {
      const attribute = attributes.find(attr => attr.id === id);
      await axios.put(`${API_BASE_URL}/attributes/${id}`, 
        { ...attribute, active: !attribute.active }
      );
      setAttributes(Array.isArray(attributes) ? attributes.map(attr => 
        attr.id === id ? { ...attr, active: !attr.active } : attr
      ) : []);
    } catch (error) {
      console.error('Error toggling attribute status:', error);
      alert('Failed to update attribute status');
    }
  };

  const handleSaveAttribute = async () => {
    try {
      const newAttribute = {
        name: formData.name,
        type: formData.type,
        values: formData.values,
        category: formData.category,
        required: formData.required,
        active: formData.active,
        description: formData.description
      };
      
      const response = await axios.post(`${API_BASE_URL}/attributes`, newAttribute);
      
      setAttributes([...attributes, response.data]);
      setFormData({
        name: '',
        type: 'text',
        values: [],
        category: '',
        required: false,
        active: true,
        description: '',
      });
      alert('Attribute added successfully!');
    } catch (error) {
      console.error('Error adding attribute:', error);
      alert('Failed to add attribute');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Type', 'Values', 'Category', 'Required', 'Active', 'Created At', 'Description'],
      ...filteredAttributes.map(attr => [
        attr.id,
        attr.name,
        attr.type,
        attr.values.join('; '),
        attr.category,
        attr.required ? 'Yes' : 'No',
        attr.active ? 'Yes' : 'No',
        attr.createdAt,
        attr.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-attributes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'color': return <ColorIcon />;
      case 'size': return <SizeIcon />;
      case 'number': return <WeightIcon />;
      default: return <LabelIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'color': return '#9c27b0';
      case 'size': return '#ff9800';
      case 'number': return '#2196f3';
      default: return '#4caf50';
    }
  };

  const getTypeBgColor = (type) => {
    switch (type) {
      case 'color': return '#f3e5f5';
      case 'size': return '#fff3e0';
      case 'number': return '#e3f2fd';
      default: return '#e8f5e8';
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
          Product Attributes
        </Typography>
        <Button variant="contained" startIcon={<DashboardIcon />} sx={{ backgroundColor: '#1976d2' }}>
          Dashboard
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography>Loading attributes...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
      {/* Language Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, backgroundColor: 'white' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="English (EN)" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {/* Attribute Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                Add New Attribute
              </Typography>

              {/* Attribute Name */}
              <TextField
                fullWidth
                label="Attribute Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
                size="small"
              />

              {/* Attribute Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Attribute Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Attribute Type"
                  size="small"
                >
                  {attributeTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Category */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                  size="small"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Values */}
              <TextField
                fullWidth
                label="Values (comma separated)"
                value={formData.values.join(', ')}
                onChange={(e) => setFormData({ ...formData, values: e.target.value.split(',').map(v => v.trim()).filter(v => v) })}
                sx={{ mb: 2 }}
                size="small"
                helperText="Enter values separated by commas"
              />

              {/* Description */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ mb: 2 }}
                size="small"
              />

              {/* Required & Active */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Required:</Typography>
                  <Switch
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Active:</Typography>
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Form Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setFormData({
                    name: '',
                    type: 'text',
                    values: [],
                    category: '',
                    required: false,
                    active: true,
                    description: '',
                  })}
                  size="small"
                  sx={{ borderColor: '#ddd', color: '#666' }}
                >
                  Reset
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleSaveAttribute}
                  size="small"
                  sx={{ backgroundColor: '#1976d2' }}
                >
                  Add Attribute
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Attributes List */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  Attributes List ({filteredAttributes.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    placeholder="Search attributes..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    size="small"
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: '#666', fontSize: 20 }} />,
                    }}
                    sx={{ minWidth: 250 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={attributeType}
                      onChange={handleTypeFilterChange}
                      label="Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="color">Color</MenuItem>
                      <MenuItem value="size">Size</MenuItem>
                    </Select>
                  </FormControl>
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

              {/* Attributes Table */}
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Values</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Required</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Active</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttributes.map((attribute) => (
                      <TableRow key={attribute.id} hover sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{attribute.id}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333', fontWeight: 500 }}>
                          {attribute.name}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTypeIcon(attribute.type)}
                            <Chip 
                              label={attribute.type.charAt(0).toUpperCase() + attribute.type.slice(1)}
                              size="small"
                              sx={{ 
                                backgroundColor: getTypeBgColor(attribute.type),
                                color: getTypeColor(attribute.type),
                                borderColor: getTypeColor(attribute.type),
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(attribute.values || attribute.options || []).slice(0, 3).map((value, index) => (
                              <Chip
                                key={index}
                                label={value}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '11px', height: '20px' }}
                              />
                            ))}
                            {(attribute.values || attribute.options || []).length > 3 && (
                              <Chip
                                label={`+${(attribute.values || attribute.options || []).length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '11px', height: '20px', color: '#666' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Chip 
                            label={attribute.category || 'General'}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              backgroundColor: '#f5f5f5',
                              color: '#666',
                              borderColor: '#ddd',
                              fontSize: '11px',
                              height: '20px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Chip 
                            label={attribute.required ? 'Yes' : 'No'}
                            size="small"
                            color={attribute.required ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ 
                              backgroundColor: attribute.required ? '#e8f5e8' : '#f5f5f5',
                              borderColor: attribute.required ? '#4caf50' : '#ccc',
                              color: attribute.required ? '#4caf50' : '#666'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Switch
                            checked={attribute.active}
                            onChange={() => toggleActiveStatus(attribute.id)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ color: '#1976d2' }}
                              onClick={() => handleViewDetails(attribute)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: '#4caf50' }}
                              onClick={() => handleEdit(attribute)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: '#f44336' }}
                              onClick={() => handleDelete(attribute)}
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Attribute Details</DialogTitle>
        <DialogContent>
          {selectedAttribute && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Attribute ID:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedAttribute.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Name:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedAttribute.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Type:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {getTypeIcon(selectedAttribute.type)}
                  <Chip 
                    label={selectedAttribute.type.charAt(0).toUpperCase() + selectedAttribute.type.slice(1)}
                    size="small"
                    sx={{ 
                      backgroundColor: getTypeBgColor(selectedAttribute.type),
                      color: getTypeColor(selectedAttribute.type),
                      borderColor: getTypeColor(selectedAttribute.type),
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Category:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedAttribute.category || 'General'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Values:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {(selectedAttribute.values || selectedAttribute.options || []).map((value, index) => (
                    <Chip
                      key={index}
                      label={value}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Description:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedAttribute.description || 'No description available'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ color: '#666' }}>Required:</Typography>
                <Chip 
                  label={selectedAttribute.required ? 'Yes' : 'No'}
                  size="small"
                  color={selectedAttribute.required ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ 
                    backgroundColor: selectedAttribute.required ? '#e8f5e8' : '#f5f5f5',
                    borderColor: selectedAttribute.required ? '#4caf50' : '#ccc',
                    color: selectedAttribute.required ? '#4caf50' : '#666'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ color: '#666' }}>Status:</Typography>
                <Chip 
                  label={selectedAttribute.active ? 'Active' : 'Inactive'}
                  size="small"
                  color={selectedAttribute.active ? 'primary' : 'default'}
                  variant="outlined"
                  sx={{ 
                    backgroundColor: selectedAttribute.active ? '#e3f2fd' : '#f5f5f5',
                    borderColor: selectedAttribute.active ? '#1976d2' : '#ccc',
                    color: selectedAttribute.active ? '#1976d2' : '#666'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ color: '#666' }}>Created At:</Typography>
                <Typography variant="body1">{selectedAttribute.createdAt}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attribute? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Box>
  );
}

export default ProductAttributes;
