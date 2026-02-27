import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  TablePagination,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [page, setPage] = useState(0); // Changed to 0-based for MUI
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    inactiveVendors: 0,
    pendingVendors: 0,
    verifiedVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  // Fetch vendors from API
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/vendors`, {
        params: {
          search: searchQuery,
          status: statusFilter,
          verificationStatus: verificationFilter,
          page: page + 1, // Convert 0-based to 1-based for API
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setVendors(response.data.vendors || []);
      setVendorStats(response.data.stats || vendorStats);
      setTotalItems(response.data.pagination?.totalItems || 0);
      setTotalPages(response.data.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchVendors();
  }, [searchQuery, statusFilter, verificationFilter, page]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to 0-based for MUI
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to 0-based for MUI
  };

  const handleVerificationFilter = (event) => {
    setVerificationFilter(event.target.value);
    setPage(0); // Reset to 0-based for MUI
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewVendor = (vendorId) => {
    navigate(`/vendors/${vendorId}`);
  };

  const handleAddVendor = () => {
    navigate('/dashboard/add-new-vendor');
  };

  const handleExport = () => {
    const csvContent = [
      ['SL', 'Shop Name', 'Vendor Name', 'Email', 'Phone', 'Status', 'Total Products', 'Total Orders'],
      ...vendors.map((vendor, index) => [
        index + 1,
        vendor.shopName,
        vendor.vendorName,
        vendor.email,
        vendor.phone,
        vendor.status,
        vendor.totalProducts,
        vendor.totalOrders
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Vendor list exported successfully', severity: 'success' });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const activeVendorCount = vendors.filter(vendor => vendor.status === 'active').length;

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StoreIcon sx={{ fontSize: 32, color: '#1976D2' }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            Vendor List
          </Typography>
          <Chip 
            label={vendors.length} 
            color="primary" 
            size="small" 
            sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', fontWeight: 600 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ 
              borderColor: '#1976D2', 
              color: '#1976D2',
              '&:hover': { backgroundColor: '#E3F2FD' }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/add-new-vendor')}
            sx={{ 
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            Add New Vendor
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by shop name, vendor name, phone or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon sx={{ color: '#666' }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#FAFAFA'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Vendor Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>SL</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Shop Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Vendor Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Total Products</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Total Orders</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <StoreIcon sx={{ fontSize: 64, color: '#CCCCCC', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                          No vendors found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Start by adding your first vendor
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddVendor}
                          sx={{ mt: 2, backgroundColor: '#1976D2' }}
                        >
                          Add New Vendor
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor, index) => (
                    <TableRow 
                      key={vendor._id}
                      hover
                      sx={{ '&:hover': { backgroundColor: '#F8F9FA' } }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StoreIcon sx={{ fontSize: 20, color: '#1976D2' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {vendor.shopName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2">
                            {vendor.vendorName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {vendor.email}
                          </Typography>
                          <Typography variant="caption" color="#666">
                            {vendor.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vendor.status}
                          color={vendor.status === 'active' ? 'success' : vendor.status === 'pending' ? 'warning' : 'default'}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>{vendor.totalProducts}</TableCell>
                      <TableCell>{vendor.totalOrders}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewVendor(vendor._id)}
                          size="small"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {vendors.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ 
                borderTop: '1px solid #E0E0E0',
                '& .MuiTablePagination-select': {
                  borderRadius: 1
                }
              }}
            />
          )}
        </CardContent>
      </Card>

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
};

export default VendorList;
