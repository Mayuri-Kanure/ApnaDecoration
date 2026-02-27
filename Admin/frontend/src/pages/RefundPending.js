import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Avatar,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  FolderOpen as EmptyIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function RefundPending() {
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit: 10,
        status: 'pending',
        ...(searchTerm && { search: searchTerm }),
        ...(filter !== 'all' && { filter })
      };
      
      const response = await axios.get(`${API_BASE_URL}/refunds`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRefundRequests(response.data.refunds || []);
      setTotalPages(response.data.pagination?.pages || 0);
      setTotalRefunds(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      setRefundRequests([]);
      setTotalPages(0);
      setTotalRefunds(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundRequests();
  }, [page, searchTerm, filter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(1);
  };

  const handleViewDetails = (refund) => {
    setSelectedRefund(refund);
    setDetailsDialogOpen(true);
  };

  const handleAction = (refund, action) => {
    setSelectedRefund(refund);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (selectedRefund && actionType) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `${API_BASE_URL}/refunds/${selectedRefund._id}/status`,
          { status: actionType === 'approve' ? 'approved' : 'rejected' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local state
        setRefundRequests(refundRequests.filter(ref => ref._id !== selectedRefund._id));
        setTotalRefunds(prev => prev - 1);
        
        setActionDialogOpen(false);
        setSelectedRefund(null);
        setActionType('');
        
        alert(`Refund request ${actionType}d successfully!`);
      } catch (error) {
        console.error('Error updating refund status:', error);
        alert('Failed to update refund request');
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['SL', 'Refund ID', 'Order ID', 'Product Info', 'Customer Info', 'Total Amount', 'Status'],
      ...refundRequests.map((refund, index) => [
        index + 1,
        refund.refundId || `#${refund._id?.slice(-8)}`,
        refund.orderId || '',
        `${refund.product?.name || ''} (${refund.product?.sku || ''})`,
        `${refund.customer?.firstName || ''} ${refund.customer?.lastName || ''} - ${refund.customer?.phone || ''}`,
        refund.amount || '0.00',
        refund.status || 'pending'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pending-refunds.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="600">
          Pending Refund Requests ({totalRefunds})
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <TextField
            fullWidth
            placeholder="Search by order id or refund id"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { xs: '100%', sm: 400 } }}
          />
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>All</InputLabel>
              <Select
                value={filter}
                label="All"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="full">Full</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Table Section */}
      <Paper sx={{ mb: 3 }}>
        {refundRequests.length === 0 ? (
          // Empty State
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
            <EmptyIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No refund request found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are currently no pending refund requests
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Refund ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product Info</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer Info</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {refundRequests.map((refund, index) => (
                  <TableRow key={refund._id} hover>
                    <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {refund.refundId || `#${refund._id?.slice(-8)}`}
                    </TableCell>
                    <TableCell>{refund.orderId || `#${refund.order?._id?.slice(-8)}`}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {refund.product?.name || 'Product'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {refund.product?.sku || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {refund.customer?.firstName} {refund.customer?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {refund.customer?.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>
                      ${refund.amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(refund)}
                          sx={{ color: '#1976d2', '&:hover': { bgcolor: '#eff6ff' } }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAction(refund, 'approve')}
                          sx={{ color: '#10b981', '&:hover': { bgcolor: '#f0fdf4' } }}
                        >
                          <ApproveIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAction(refund, 'reject')}
                          sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                        >
                          <RejectIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
          />
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Pending Refund Request Details</DialogTitle>
        <DialogContent>
          {selectedRefund && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Refund ID:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRefund.refundId || `#${selectedRefund._id?.slice(-8)}`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Order ID:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRefund.orderId || `#${selectedRefund.order?._id?.slice(-8)}`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Customer Name:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRefund.customer?.firstName} {selectedRefund.customer?.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Customer Phone:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRefund.customer?.phone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Product Name:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRefund.product?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Product SKU:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRefund.product?.sku || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Refund Amount:</Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                  ${selectedRefund.amount?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Request Date:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedRefund.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Reason:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRefund.reason || 'No reason provided'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#666' }}>Status:</Typography>
                <Chip 
                  label="Pending"
                  size="small"
                  sx={{ 
                    backgroundColor: '#fff3e0',
                    color: '#ff9800',
                    borderColor: '#ff9800',
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
          {selectedRefund && (
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Refund ID: {selectedRefund.refundId || `#${selectedRefund._id?.slice(-8)}`}<br />
              Amount: ${selectedRefund.amount?.toFixed(2) || '0.00'}
            </Typography>
          )}
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

export default RefundPending;
