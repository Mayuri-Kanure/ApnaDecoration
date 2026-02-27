import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Switch,
  FormControlLabel,
  Avatar,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function DeliveryList() {
  const navigate = useNavigate();
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDeliveryMen, setFilteredDeliveryMen] = useState(deliveryMen);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch delivery men from API
  const fetchDeliveryMen = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/deliverymen`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeliveryMen(response.data.deliveries || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery men:', error);
      setSnackbar({ open: true, message: 'Error loading delivery men', severity: 'error' });
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDeliveryMen();
  }, []);

  useEffect(() => {
    const filtered = deliveryMen.filter(delivery =>
      `${delivery.firstName} ${delivery.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.phone.includes(searchTerm)
    );
    setFilteredDeliveryMen(filtered);
  }, [searchTerm, deliveryMen]);

  const handleSearch = () => {
    console.log('Searching delivery men:', searchTerm);
    setSnackbar({ open: true, message: 'Search completed', severity: 'success' });
  };

  const handleExport = () => {
    const csvContent = [
      ['SL', 'Name', 'Email', 'Phone', 'Total Orders', 'Rating', 'Status'],
      ...filteredDeliveryMen.map((delivery, index) => [
        index + 1,
        `${delivery.firstName} ${delivery.lastName}`,
        delivery.email,
        delivery.phone,
        delivery.totalOrders,
        delivery.rating,
        delivery.status ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'delivery-men-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Delivery men list exported successfully', severity: 'success' });
  };

  const handleToggleStatus = async (deliveryId) => {
    try {
      const token = localStorage.getItem('token');
      const delivery = deliveryMen.find(d => d._id === deliveryId);
      
      const response = await axios.put(`${API_BASE_URL}/deliverymen/${deliveryId}`, {
        status: delivery.status === 'active' ? 'inactive' : 'active'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh data
      fetchDeliveryMen();
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleView = (deliveryId) => {
    const delivery = deliveryMen.find(d => d._id === deliveryId);
    if (delivery) {
      setSelectedDelivery(delivery);
      setViewModalOpen(true);
      console.log('View delivery man details:', delivery);
    }
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedDelivery(null);
  };

  const handleEdit = (deliveryId) => {
    console.log('Edit delivery man:', deliveryId);
    // Navigate to edit page or open edit dialog
  };

  const handleDelete = async (deliveryId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/deliverymen/${deliveryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh data
      fetchDeliveryMen();
      setSnackbar({ open: true, message: 'Delivery man deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting delivery man:', error);
      setSnackbar({ open: true, message: 'Error deleting delivery man', severity: 'error' });
    }
  };

  const renderRating = (rating) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <StarIcon sx={{ fontSize: 16, color: '#FFC107' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {rating}
        </Typography>
      </Box>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{ fontSize: 32, color: '#1976D2' }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            Delivery Man
          </Typography>
          <Chip 
            label={deliveryMen.length} 
            color="primary" 
            size="small"
            sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', fontWeight: 600 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ 
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/add-new-delivery')}
            sx={{ 
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            + Add Delivery Man
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search by name, email or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                maxWidth: 400,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#FAFAFA'
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={handleSearch}
              sx={{ 
                borderColor: '#1976D2', 
                color: '#1976D2',
                '&:hover': { backgroundColor: '#E3F2FD' }
              }}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Delivery Men Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {filteredDeliveryMen.length === 0 ? (
            // Empty State
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <PersonIcon sx={{ fontSize: 80, color: '#CCCCCC', mb: 2 }} />
              <Typography variant="h6" color="#666" sx={{ mb: 1 }}>
                No delivery men found
              </Typography>
              <Typography variant="body2" color="#999">
                Click "+ Add Delivery Man" to add your first delivery personnel
              </Typography>
            </Box>
          ) : (
            // Data Table
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>SL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Contact Info</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Total Orders</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDeliveryMen.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((delivery, index) => (
                    <TableRow key={delivery._id} hover sx={{ '&:hover': { backgroundColor: '#F8F9FA' } }}>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={delivery.deliverymanImage || delivery.profileImage}
                            alt={`${delivery.firstName} ${delivery.lastName}`}
                            sx={{ width: 40, height: 40 }}
                          >
                            {delivery.firstName[0]}{delivery.lastName[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {delivery.firstName} {delivery.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {delivery.email}
                          </Typography>
                          <Typography variant="caption" color="#666">
                            {delivery.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={delivery.successfulDeliveries || 0}
                          color="primary"
                          size="small"
                          variant="outlined"
                          sx={{ 
                            backgroundColor: '#E3F2FD',
                            color: '#1976D2',
                            borderColor: '#1976D2',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {renderRating(delivery.rating)}
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={delivery.status === 'active'}
                              onChange={() => handleToggleStatus(delivery._id)}
                              color="success"
                            />
                          }
                          label={delivery.status === 'active' ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(delivery._id)}
                            sx={{ 
                              color: '#2196F3',
                              '&:hover': { backgroundColor: '#E3F2FD' }
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(delivery._id)}
                            sx={{ 
                              color: '#1976D2',
                              '&:hover': { backgroundColor: '#E3F2FD' }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(delivery._id)}
                            sx={{ 
                              color: '#F44336',
                              '&:hover': { backgroundColor: '#FFEBEE' }
                            }}
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
          )}

          {/* Delivery Details Modal */}
          <Dialog
            open={viewModalOpen}
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Delivery Boy Details
              <IconButton
                aria-label="close"
                onClick={handleCloseModal}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {selectedDelivery && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Box sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedDelivery.firstName} {selectedDelivery.lastName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedDelivery.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedDelivery.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> 
                        <Chip 
                          label={selectedDelivery.status}
                          color={selectedDelivery.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Typography>
                      <Typography variant="body2">
                        <strong>Verified:</strong> {selectedDelivery.isVerified ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                      Vehicle Information
                    </Typography>
                    <Box sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Vehicle Type:</strong> {selectedDelivery.vehicleType}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Vehicle Number:</strong> {selectedDelivery.vehicleNumber}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                      Performance
                    </Typography>
                    <Box sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Total Deliveries:</strong> {selectedDelivery.totalDeliveries || 0}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Successful Deliveries:</strong> {selectedDelivery.successfulDeliveries || 0}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Failed Deliveries:</strong> {selectedDelivery.failedDeliveries || 0}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Average Rating:</strong> {selectedDelivery.rating || 0}/5
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Bank Details
                    </Typography>
                    <Box sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Account Number:</strong> {selectedDelivery.bankAccount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>IFSC Code:</strong> {selectedDelivery.ifscCode}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Bank Name:</strong> {selectedDelivery.bankName}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Pagination */}
          {filteredDeliveryMen.length > 0 && (
            <TablePagination
              component="div"
              count={filteredDeliveryMen.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DeliveryList;
