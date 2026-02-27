import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  InputAdornment,
  Avatar,
  Switch,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import EditCustomerDialog from '../components/EditCustomerDialog';
import ViewCustomerDialog from '../components/ViewCustomerDialog';

import { API_BASE_URL } from '../config/api';

const CustomerList = () => {
  const [orderDate, setOrderDate] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [customerStatus, setCustomerStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [chooseFirst, setChooseFirst] = useState('50');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Debug token storage
      console.log('🔍 TOKEN DEBUG - Checking localStorage...');
      const allStorage = { ...localStorage };
      console.log('🔍 All localStorage items:', allStorage);
      
      const token = localStorage.getItem('token');
      console.log('🔍 Token found:', token ? 'YES' : 'NO');
      console.log('🔍 Token value:', token ? token.substring(0, 20) + '...' : 'NULL');
      
      if (!token) {
        console.log('❌ TOKEN MISSING - Showing session error');
        setNotification({
          open: true,
          message: 'Admin session not found. Please login again.',
          severity: 'error'
        });
        setCustomers([]);
        return;
      }
      
      console.log('✅ TOKEN FOUND - Making API call to:', `${API_BASE_URL}/customers`);
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        params: {
          page,
          limit: Number(chooseFirst) || 50,
          search: searchQuery || undefined,
          status: customerStatus,
          sortBy,
          joiningDate: joiningDate || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('=== API REQUEST DEBUG ===');
      console.log('Request URL:', `${API_BASE_URL}/customers`);
      console.log('Request params:', {
        page,
        limit: Number(chooseFirst) || 50,
        search: searchQuery || undefined,
        status: customerStatus,
        sortBy,
        joiningDate: joiningDate || undefined
      });
      console.log('Full request config:', {
        params: {
          page,
          limit: Number(chooseFirst) || 50,
          search: searchQuery || undefined,
          status: customerStatus,
          sortBy,
          joiningDate: joiningDate || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API Response:', response.data);
      console.log('Customers found:', response.data.customers);
      setCustomers(response.data.customers || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, [page, chooseFirst, customerStatus, sortBy, joiningDate]);

  const handleFilter = () => {
    setPage(1);
    fetchCustomers();
  };

  const handleReset = () => {
    setOrderDate('');
    setJoiningDate('');
    setCustomerStatus('all');
    setSortBy('name_asc');
    setChooseFirst('50');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  const handleExport = () => {
    console.log('Exporting customer data...');
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewCustomer = (customerId) => {
    setSelectedCustomer(customers.find(c => c.id === customerId));
    setViewDialogOpen(true);
  };

  const handleEditCustomer = (customerId) => {
    setSelectedCustomer(customers.find(c => c.id === customerId));
    setEditDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId) => {
    setSelectedCustomer(customers.find(c => c.id === customerId));
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/customers/${selectedCustomer.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setNotification({
        open: true,
        message: 'Customer deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      setNotification({
        open: true,
        message: (error.response && error.response.data && error.response.data.message) || 'Failed to delete customer',
        severity: 'error'
      });
    }
  };

  const handleSaveCustomer = (updatedCustomer) => {
    setCustomers(customers.map(c => 
      c.id === updatedCustomer.id ? updatedCustomer : c
    ).map((customer, index) => (
      <div key={customer.id}>{/* content */}</div>
    )));
    setNotification({
      open: true,
      message: 'Customer updated successfully',
      severity: 'success'
    });
  };

  const handleBlockToggle = async (customerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'blacklisted' : 'active';
      
      await axios.put(
        `${API_BASE_URL}/customers/${customerId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCustomers(customers.map(c => 
        c.id === customerId ? { ...c, status: newStatus } : c
      ).map((customer, index) => (
        <div key={customer.id}>{/* content */}</div>
      )));
      
      setNotification({
        open: true,
        message: `Customer ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: (error.response && error.response.data && error.response.data.message) || 'Failed to update customer status',
        severity: 'error'
      });
    }
  };

  const getOrderBadgeColor = (orderCount) => {
    if (orderCount >= 25) return '#ff9800'; // Orange for high value
    if (orderCount >= 15) return '#2196f3'; // Blue for medium
    return '#4caf50'; // Green for normal
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
        Customer List
      </Typography>

      {/* Filter Section */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Filter Customers
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                label="Order Date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                label="Joining Date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <Select
                  value={customerStatus}
                  onChange={(e) => setCustomerStatus(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                >
                  <MenuItem value="name_asc">Name A-Z</MenuItem>
                  <MenuItem value="name_desc">Name Z-A</MenuItem>
                  <MenuItem value="most_orders">Most Orders</MenuItem>
                  <MenuItem value="highest_revenue">Highest Revenue</MenuItem>
                  <MenuItem value="recent_joined">Recent Joined</MenuItem>
                  <MenuItem value="oldest_joined">Oldest Joined</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <Select
                  value={chooseFirst}
                  onChange={(e) => setChooseFirst(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="25">25</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="100">100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              onClick={handleFilter}
              sx={{
                backgroundColor: '#1976d2',
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Apply Filter
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {/* Customer List Table */}
    <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Customer List ({customers.length} customers)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by name, email, or ID..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{
                backgroundColor: '#1976d2',
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Search
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                backgroundColor: '#4caf50',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#45a049'
                }
              }}
            >
              Export
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact Info</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Total Orders</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Block/Unblock</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow
                  key={customer.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#1976d2',
                          width: 40,
                          height: 40,
                          fontSize: 14,
                          fontWeight: 600
                        }}
                      >
                        {customer.firstName && customer.firstName[0]}{customer.lastName && customer.lastName[0]}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {customer.firstName} {customer.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{customer.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={customer.totalOrders || 0}
                      size="small"
                      sx={{
                        backgroundColor: getOrderBadgeColor(customer.totalOrders || 0),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status || 'active'}
                      size="small"
                      color={customer.status === 'active' ? 'success' : customer.status === 'blacklisted' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={customer.status === 'blacklisted'}
                      onChange={() => handleBlockToggle(customer._id, customer.status)}
                      color="error"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton size="small" onClick={() => handleViewCustomer(customer._id)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditCustomer(customer._id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteCustomer(customer._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.max(1, totalPages)}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 500,
              },
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#1976d2',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1565c0',
                }
              },
              '& .MuiPaginationItem-page': {
                color: '#546e7a',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#1976d2',
                }
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>

    {/* Edit Customer Dialog */}
    <EditCustomerDialog
      open={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
      customer={selectedCustomer}
      onSave={handleSaveCustomer}
    />

    {/* View Customer Dialog */}
    <ViewCustomerDialog
      open={viewDialogOpen}
      onClose={() => setViewDialogOpen(false)}
      customerId={selectedCustomer && selectedCustomer.id ? selectedCustomer.id : null}
    />

    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
      <DialogTitle>Delete Customer</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this customer? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        <Button onClick={confirmDeleteCustomer} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>

      {/* Notification Snackbar */}
      {notification.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999
          }}
        >
          <Alert 
            severity={notification.severity}
            onClose={() => setNotification({ ...notification, open: false })}
            sx={{ minWidth: 300 }}
          >
            {notification.message}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default CustomerList;
