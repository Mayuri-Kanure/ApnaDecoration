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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function DeliveryWithdraw() {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' }
  ];

  // Fetch delivery withdraw requests from API
  const fetchDeliveryWithdraws = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/delivery-withdraw`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setWithdrawRequests(response.data.withdraws || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery withdraw requests:', error);
      setSnackbar({ open: true, message: 'Error loading withdraw requests', severity: 'error' });
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDeliveryWithdraws();
  }, []);

  useEffect(() => {
    const filtered = withdrawRequests.filter(request => {
      const matchesSearch = request.deliveryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.deliveryEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.withdrawId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, withdrawRequests]);

  const handleSearch = () => {
    setSnackbar({ open: true, message: 'Search completed', severity: 'success' });
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/delivery-withdraw/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'delivery-withdraws.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Export completed successfully', severity: 'success' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setSnackbar({ open: true, message: 'Error exporting data', severity: 'error' });
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setDialogType('approve');
    setDialogOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setDialogType('reject');
    setDialogOpen(true);
  };

  const confirmAction = () => {
    const updatedRequests = withdrawRequests.map(request =>
      request.id === selectedRequest.id 
        ? { ...request, status: dialogType === 'approve' ? 'approved' : 'rejected' }
        : request
    );
    setWithdrawRequests(updatedRequests);
    setDialogOpen(false);
    setSnackbar({ 
      open: true, 
      message: `Request ${dialogType === 'approve' ? 'approved' : 'rejected'} successfully`, 
      severity: 'success' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'processing': return '#2196F3';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C3E50' }}>
          Withdraw Request
        </Typography>
        <Chip 
          label={withdrawRequests.length} 
          color="primary" 
          size="small"
          sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', fontWeight: 600 }}
        />
      </Box>

      {/* Controls Bar */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by name or email"
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
                flex: 1,
                minWidth: 250,
                maxWidth: 300,
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
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#FAFAFA'
                }}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ 
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#45a049' },
                ml: 'auto'
              }}
            >
              Export
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Withdraw Requests Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {filteredRequests.length === 0 ? (
            // Empty State
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <FolderIcon sx={{ fontSize: 80, color: '#CCCCCC', mb: 2 }} />
              <Typography variant="h6" color="#666" sx={{ mb: 1 }}>
                No withdraw request found
              </Typography>
              <Typography variant="body2" color="#999">
                Withdraw requests will appear here when delivery personnel submit them
              </Typography>
            </Box>
          ) : (
            // Data Table
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>SL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Request Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((request, index) => (
                    <TableRow key={request.id} hover sx={{ '&:hover': { backgroundColor: '#F8F9FA' } }}>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                          ${request.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {request.name}
                          </Typography>
                          <Typography variant="caption" color="#666">
                            {request.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.requestTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(request.status) + '20',
                            color: getStatusColor(request.status),
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {request.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(request)}
                                sx={{ 
                                  color: '#4CAF50',
                                  '&:hover': { backgroundColor: '#E8F5E8' }
                                }}
                                title="Approve"
                              >
                                <ApproveIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleReject(request)}
                                sx={{ 
                                  color: '#F44336',
                                  '&:hover': { backgroundColor: '#FFEBEE' }
                                }}
                                title="Reject"
                              >
                                <RejectIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <TablePagination
              component="div"
              count={filteredRequests.length}
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

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'approve' ? 'Approve Withdraw Request' : 'Reject Withdraw Request'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {dialogType} the withdraw request of ${selectedRequest?.amount} 
            from {selectedRequest?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={confirmAction}
            sx={{ 
              backgroundColor: dialogType === 'approve' ? '#4CAF50' : '#F44336',
              '&:hover': { 
                backgroundColor: dialogType === 'approve' ? '#45a049' : '#d32f2f' 
              }
            }}
          >
            {dialogType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default DeliveryWithdraw;
