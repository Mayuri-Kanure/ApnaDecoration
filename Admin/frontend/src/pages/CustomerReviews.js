import React, { useState, useEffect, useCallback } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Avatar,
  InputAdornment,
  Alert,
  Snackbar,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  VisibilityOff as HideIcon,
  Visibility as ShowIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Image as ImageIcon
} from '@mui/icons-material';

function CustomerReviews() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: [],
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  const [filters, setFilters] = useState({
    product: '',
    customer: '',
    status: 'all',
    rating: 'all',
    date: '',
    search: ''
  });

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'error' },
    { value: 'pending', label: 'Pending', color: 'warning' }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token || ''}` };
  };

  const normalizeReview = (review) => ({
    ...review,
    id: review.id || review._id,
    date: review.date || review.createdAt
  });

  const fetchCustomerReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews`, {
        params: {
          search: filters.search || '',
          rating: filters.rating || 'all',
          status: filters.status || 'all',
          productId: filters.product || '',
          customerId: filters.customer || '',
          date: filters.date || '',
          page: pagination.page,
          limit: pagination.limit
        },
        headers: getAuthHeaders()
      });

      const list = Array.isArray(response?.data?.reviews) ? response.data.reviews.map(normalizeReview) : [];
      setReviews(list);
      setReviewStats(
        response?.data?.stats || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: [],
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0
        }
      );
      setProducts(response?.data?.filterOptions?.products || []);
      setCustomers(response?.data?.filterOptions?.customers || []);
      setPagination((prev) => ({
        ...prev,
        ...(response?.data?.pagination || {})
      }));
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      setSnackbar({ open: true, message: 'Failed to load customer reviews', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchCustomerReviews();
  }, [fetchCustomerReviews]);

  const handleReset = () => {
    setFilters({
      product: '',
      customer: '',
      status: 'all',
      rating: 'all',
      date: '',
      search: ''
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setReplyDialogOpen(true);
  };

  const handleView = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleStatusChange = async (review, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/customer-reviews/${review.id}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      setSnackbar({ open: true, message: `Review status updated to ${newStatus}`, severity: 'success' });
      fetchCustomerReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      setSnackbar({ open: true, message: 'Failed to update review status', severity: 'error' });
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedReview) return;
    try {
      await axios.post(
        `${API_BASE_URL}/customer-reviews/${selectedReview.id}/reply`,
        { reply: replyText },
        { headers: getAuthHeaders() }
      );
      setReplyDialogOpen(false);
      setSnackbar({ open: true, message: 'Reply sent successfully', severity: 'success' });
      fetchCustomerReviews();
    } catch (error) {
      console.error('Error replying to review:', error);
      setSnackbar({ open: true, message: 'Failed to send reply', severity: 'error' });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Review ID', 'Product', 'Customer', 'Rating', 'Review', 'Reply', 'Date', 'Status'],
      ...reviews.map((review) => [
        review.reviewId,
        review.productName,
        review.customerName,
        review.rating,
        review.review,
        review.reply || '',
        review.date,
        review.status
      ])
    ]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-reviews.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((option) => option.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const truncateText = (text, maxLength = 50) => {
    const safeText = text || '';
    return safeText.length > maxLength ? `${safeText.substring(0, maxLength)}...` : safeText;
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C3E50' }}>
          Customer Reviews
        </Typography>
        <Chip
          label={`${pagination.total} Reviews`}
          sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', fontWeight: 600, px: 2 }}
        />
      </Box>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Product</InputLabel>
                <Select
                  value={filters.product}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, product: e.target.value }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  label="Select Product"
                >
                  <MenuItem value="">All Products</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>All Customer</InputLabel>
                <Select
                  value={filters.customer}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, customer: e.target.value }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  label="All Customer"
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, status: e.target.value }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Rating</InputLabel>
                <Select
                  value={filters.rating}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, rating: e.target.value }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  label="Rating"
                >
                  <MenuItem value="all">All Ratings</MenuItem>
                  <MenuItem value="5">5 Star</MenuItem>
                  <MenuItem value="4">4 Star</MenuItem>
                  <MenuItem value="3">3 Star</MenuItem>
                  <MenuItem value="2">2 Star</MenuItem>
                  <MenuItem value="1">1 Star</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date"
                value={filters.date}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, date: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={handleReset} startIcon={<RefreshIcon />} size="small" sx={{ flex: 1 }}>
                  Reset
                </Button>
                <Button variant="contained" onClick={fetchCustomerReviews} startIcon={<FilterIcon />} size="small" sx={{ flex: 1 }}>
                  Apply
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Customer Reviews List
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search by Product, Customer, Review ID..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              size="small"
              sx={{ minWidth: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45A049' } }}
            >
              Export
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Review ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Review</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reply</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ImageIcon sx={{ fontSize: 64, color: '#CCCCCC', mb: 2 }} />
                        <Typography variant="h6" color="#CCCCCC">
                          No review found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review, index) => (
                    <TableRow key={review.id} hover>
                      <TableCell>{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{review.reviewId}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 40, height: 40, backgroundColor: '#F0F0F0' }}>
                            <ImageIcon sx={{ color: '#999' }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {review.productName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {review.customerName}
                          </Typography>
                          <Typography variant="caption" color="#666">
                            {review.customerEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Rating value={review.rating || 0} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {truncateText(review.review)}
                          {(review.review || '').length > 50 && (
                            <Button size="small" onClick={() => handleView(review)} sx={{ p: 0, minWidth: 'auto', ml: 1 }}>
                              Read More
                            </Button>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {review.reply ? (
                          <Typography
                            variant="body2"
                            sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {truncateText(review.reply)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="#999">
                            No reply
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(review.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={(review.status || '').charAt(0).toUpperCase() + (review.status || '').slice(1)}
                          color={getStatusColor(review.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleView(review)} title="View">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleReply(review)} title="Reply">
                            <ReplyIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(review, review.status === 'active' ? 'inactive' : 'active')}
                            title={review.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {review.status === 'active' ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pagination.total}
            rowsPerPage={pagination.limit}
            page={Math.max(0, pagination.page - 1)}
            onPageChange={(e, newPage) => setPagination((prev) => ({ ...prev, page: newPage + 1 }))}
            onRowsPerPageChange={(e) =>
              setPagination((prev) => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))
            }
          />
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="#666">
                  Review ID:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedReview.reviewId}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="#666">
                  Date:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(selectedReview.date)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="#666">
                  Product:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedReview.productName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="#666">
                  Customer:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedReview.customerName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="#666">
                  Rating:
                </Typography>
                <Rating value={selectedReview.rating || 0} readOnly sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="#666">
                  Review:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedReview.review}
                </Typography>
              </Grid>
              {selectedReview.reply && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="#666">
                    Admin Reply:
                  </Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#F0F8FF', p: 2, borderRadius: 1 }}>
                    {selectedReview.reply}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Review</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
                Review by {selectedReview.customerName} for {selectedReview.productName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                "{selectedReview.review}"
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReplySubmit} variant="contained">
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CustomerReviews;
