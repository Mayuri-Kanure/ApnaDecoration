import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  Delete,
  Close,
  FilterList,
  Refresh,
  Download,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function RequestRestockList() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filter states
  const [filters, setFilters] = useState({
    requestDate: null,
    category: '',
    subCategory: '',
    brand: '',
  });

  // Options for dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Load restock requests
  const loadRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/restock-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const requestsData = response.data || [];
      setRequests(requestsData);
      setFilteredRequests(requestsData);
      
      // Load filter options
      const [catRes, brandRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/products/brands`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (error) {
      console.error('Error loading requests:', error);
      setSnackbar({ open: true, message: 'Failed to load requests', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Load sub-categories based on category
  const loadSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await axios.get(`/api/sub-categories?category_id=${categoryId}`);
      setSubCategories(response.data);
    } catch (error) {
      console.error('Error loading sub-categories:', error);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...requests];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by date
    if (filters.requestDate) {
      const filterDate = new Date(filters.requestDate).toDateString();
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.last_request_date).toDateString();
        return requestDate === filterDate;
      });
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(request => request.category_id === filters.category);
    }
    
    // Filter by sub-category
    if (filters.subCategory) {
      filtered = filtered.filter(request => request.sub_category_id === filters.subCategory);
    }
    
    // Filter by brand
    if (filters.brand) {
      filtered = filtered.filter(request => request.brand_id === filters.brand);
    }
    
    setFilteredRequests(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      requestDate: null,
      category: '',
      subCategory: '',
      brand: '',
    });
    setSearchTerm('');
    setFilteredRequests(requests);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Reset sub-category when category changes
    if (field === 'category') {
      newFilters.subCategory = '';
      loadSubCategories(value);
    }
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view request
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  // Handle edit request
  const handleEditRequest = (request) => {
    // Navigate to edit page or open edit dialog
    console.log('Edit request:', request);
    setSnackbar({ open: true, message: 'Edit functionality coming soon', severity: 'info' });
  };

  // Handle delete request
  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this restock request?')) {
      try {
        await axios.delete(`/api/restock-requests/${requestId}`);
        setSnackbar({ open: true, message: 'Request deleted successfully', severity: 'success' });
        loadRequests();
      } catch (error) {
        console.error('Error deleting request:', error);
        setSnackbar({ open: true, message: 'Failed to delete request', severity: 'error' });
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredRequests.map((request, index) => ({
      'SL': index + 1,
      'Product Name': request.product_name,
      'Variant': request.variant || '',
      'Selling Price': `$${request.selling_price?.toFixed(2) || '0.00'}`,
      'Last Request Date': new Date(request.last_request_date).toLocaleString(),
      'Number Of Request': request.number_of_requests || 1,
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'restock_requests.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setSnackbar({ open: true, message: 'Data exported successfully', severity: 'success' });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
      <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'white',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Request Restock List
              </Typography>
              <Chip 
                label={filteredRequests.length} 
                color="primary" 
                size="small" 
                sx={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white',
                  fontWeight: 600 
                }} 
              />
            </Box>
          </Box>

          {/* Filter Products Section */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 3 }}>
              Filter Products
            </Typography>
            
            <Grid container spacing={3} alignItems="end">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Request Restock Date"
                  type="date"
                  value={filters.requestDate || ''}
                  onChange={(e) => handleFilterChange('requestDate', e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sub Category</InputLabel>
                  <Select
                    value={filters.subCategory}
                    label="Sub Category"
                    onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                    disabled={!filters.category}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Sub Categories</MenuItem>
                    {subCategories.map((subCat) => (
                      <MenuItem key={subCat.id} value={subCat.id}>
                        {subCat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={filters.brand}
                    label="Brand"
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<FilterList />}
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      color: 'white !important',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Show data
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#cbd5e1',
                      color: '#64748b',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        borderColor: '#94a3b8',
                      }
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Request List Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 3 }}>
              Request List
              <Chip 
                label={filteredRequests.length} 
                color="primary" 
                size="small" 
                sx={{ 
                  ml: 2,
                  backgroundColor: '#2563eb', 
                  color: 'white',
                  fontWeight: 600 
                }} 
              />
            </Typography>
            
            {/* Search and Export Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <TextField
                placeholder="Search by Product Name"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <Search sx={{ color: '#9ca3af', mr: 1 }} />,
                }}
                sx={{
                  width: '300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#2563eb',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2563eb',
                    },
                  },
                }}
              />
              
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportToCSV}
                sx={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'white !important',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Export
              </Button>
            </Box>

            {/* Requests Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', width: '60px' }}>SL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', width: '120px' }}>Selling Price</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', width: '180px' }}>Last Request Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', width: '120px' }}>Number Of Request</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', width: '120px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request, index) => (
                      <TableRow key={request.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {request.product_name}
                            </Typography>
                            {request.variant && (
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Variant: {request.variant}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          ${request.selling_price?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          {new Date(request.last_request_date).toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {request.number_of_requests || 1}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewRequest(request)}
                              sx={{ 
                                color: '#2563eb',
                                '&:hover': { backgroundColor: '#eff6ff' }
                              }}
                              title="View Details"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditRequest(request)}
                              sx={{ 
                                color: '#059669',
                                '&:hover': { backgroundColor: '#f0fdf4' }
                              }}
                              title="Edit/Process"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRequest(request.id)}
                              sx={{ 
                                color: '#dc2626',
                                '&:hover': { backgroundColor: '#fef2f2' }
                              }}
                              title="Delete/Cancel"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Box>

          {/* Request Details Dialog */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Restock Request Details
              </Typography>
              <IconButton onClick={() => setDialogOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              {selectedRequest && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Product Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedRequest.product_name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Variant
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedRequest.variant || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Selling Price
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      ${selectedRequest.selling_price?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Number of Requests
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedRequest.number_of_requests || 1}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Last Request Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {new Date(selectedRequest.last_request_date).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setDialogOpen(false)}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#cbd5e1',
                  color: '#64748b',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    borderColor: '#94a3b8',
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success/Error Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
  );
}

export default RequestRestockList;
