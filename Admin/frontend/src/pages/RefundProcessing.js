import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Dashboard as DashboardIcon,
  AttachMoney as RefundIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  Assignment as OrderIcon,
  Event as DateIcon,
  Money as MoneyIcon,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function RefundProcessing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        status: 'processing',
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await axios.get(`${API_BASE_URL}/refunds`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRefundRequests(response.data.refunds || []);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      setRefundRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundRequests();
  }, [searchTerm]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getStatusColor = (status) => {
    return '#2196f3';
  };

  const getStatusBgColor = (status) => {
    return '#e3f2fd';
  };

  const filteredRequests = refundRequests.filter(request => {
    const matchesSearch = 
      request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Customer Name', 'Order ID', 'Order Date', 'Amount', 'Reason', 'Status', 'Request Date', 'Processing Date', 'Estimated Completion'],
      ...filteredRequests.map(req => [
        req.id, 
        req.customerName, 
        req.orderId, 
        req.orderDate, 
        req.amount, 
        req.reason, 
        req.status, 
        req.requestDate,
        req.processingDate || '',
        req.estimatedCompletion || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processing-refunds.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalAmount = refundRequests.reduce((sum, req) => sum + req.amount, 0);

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
          Processing Refund Requests
        </Typography>
        <Button variant="contained" startIcon={<DashboardIcon />} sx={{ backgroundColor: '#1976d2' }}>
          Dashboard
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #90caf9' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 600 }}>
                {refundRequests.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1565c0' }}>Processing</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 600 }}>
                ${totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#e65100' }}>Total Amount</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by customer name, order ID, or reason"
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  size="small"
                  sx={{ borderColor: '#ddd', color: '#666' }}
                >
                  Refresh
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  size="small"
                  sx={{ borderColor: '#ddd', color: '#666' }}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Refund Requests Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Order Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Processing Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Est. Completion</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} hover sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{request.id}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: '#f5f5f5' }}>
                          <PersonIcon sx={{ fontSize: 16, color: '#999' }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          {request.customerName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      {request.orderId}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      {request.orderDate}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        ${request.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      {request.reason}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      {request.requestDate}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      {request.processingDate || '-'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
                        {request.estimatedCompletion || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          sx={{ color: '#1976d2' }}
                          onClick={() => handleViewDetails(request)}
                        >
                          <VisibilityIcon fontSize="small" />
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Processing Refund Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Request ID:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Customer Name:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.customerName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Order ID:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.orderId}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Order Date:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.orderDate}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Refund Amount:</Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                  ${selectedRequest.amount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Request Date:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.requestDate}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Processing Date:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.processingDate || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Estimated Completion:</Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#1976d2', fontWeight: 500 }}>
                  {selectedRequest.estimatedCompletion || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Reason:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.reason}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Status:</Typography>
                <Chip 
                  label="Processing"
                  size="small"
                  sx={{ 
                    backgroundColor: getStatusBgColor('processing'),
                    color: getStatusColor('processing'),
                    borderColor: getStatusColor('processing'),
                    fontWeight: 500
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RefundProcessing;
