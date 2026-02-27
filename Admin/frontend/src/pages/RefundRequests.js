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
  Tabs,
  Tab,
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

function RefundRequests() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
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
  }, [searchTerm, statusFilter]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNote, setActionNote] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'processing':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fff3e0';
      case 'approved':
        return '#e8f5e8';
      case 'rejected':
        return '#ffebee';
      case 'processing':
        return '#e3f2fd';
      default:
        return '#f5f5f5';
    }
  };

  const filteredRequests = refundRequests.filter(request => {
    const matchesSearch = 
      request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedRequest && actionType) {
      setRefundRequests(refundRequests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'processing' }
          : req
      ));
      setActionDialogOpen(false);
      setSelectedRequest(null);
      setActionType('');
      setActionNote('');
      alert(`Refund request ${actionType}d successfully!`);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Customer Name', 'Order ID', 'Order Date', 'Amount', 'Reason', 'Status', 'Request Date'],
      ...filteredRequests.map(req => [
        req.id, 
        req.customerName, 
        req.orderId, 
        req.orderDate, 
        req.amount, 
        req.reason, 
        req.status, 
        req.requestDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refund-requests.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
          Refund Requests
        </Typography>
        <Button variant="contained" startIcon={<DashboardIcon />} sx={{ backgroundColor: '#1976d2' }}>
          Dashboard
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 600 }}>
                {refundRequests.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#e65100' }}>Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e8', border: '1px solid #81c784' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: '#388e3c', fontWeight: 600 }}>
                {refundRequests.filter(r => r.status === 'approved').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#2e7d32' }}>Approved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#ffebee', border: '1px solid #ef9a9a' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                {refundRequests.filter(r => r.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#c62828' }}>Rejected</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #90caf9' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 600 }}>
                {refundRequests.filter(r => r.status === 'processing').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1565c0' }}>Processing</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
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
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Request Date</TableCell>
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
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Chip 
                        label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        size="small"
                        sx={{ 
                          backgroundColor: getStatusBgColor(request.status),
                          color: getStatusColor(request.status),
                          borderColor: getStatusColor(request.status),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                      {request.requestDate}
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
                        {request.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              sx={{ color: '#4caf50' }}
                              onClick={() => handleAction(request, 'approve')}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: '#f44336' }}
                              onClick={() => handleAction(request, 'reject')}
                            >
                              <DeleteIcon fontSize="small" />
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
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Refund Request Details</DialogTitle>
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
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Reason:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.reason}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Status:</Typography>
                <Chip 
                  label={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  size="small"
                  sx={{ 
                    backgroundColor: getStatusBgColor(selectedRequest.status),
                    color: getStatusColor(selectedRequest.status),
                    borderColor: getStatusColor(selectedRequest.status),
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

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Refund Request' : 'Reject Refund Request'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {actionType} this refund request?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmAction} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RefundRequests;
