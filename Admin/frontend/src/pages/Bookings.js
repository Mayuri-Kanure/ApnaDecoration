import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Delete, Visibility, Edit } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleStatusChange = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/bookings/${selectedBooking._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Service Bookings
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Preferred Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking._id.slice(-8)}</TableCell>
                      <TableCell>{booking.serviceName}</TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>{booking.customerPhone}</TableCell>
                      <TableCell>
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(booking)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(booking)}
                          color="info"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(booking._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 2, '& > *': { mb: 2 } }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Service Information</Typography>
              <Typography><strong>Service:</strong> {selectedBooking.serviceName}</Typography>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>Customer Information</Typography>
              <Typography><strong>Name:</strong> {selectedBooking.customerName}</Typography>
              <Typography><strong>Email:</strong> {selectedBooking.customerEmail || 'N/A'}</Typography>
              <Typography><strong>Phone:</strong> {selectedBooking.customerPhone}</Typography>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>Booking Details</Typography>
              <Typography><strong>Preferred Date:</strong> {new Date(selectedBooking.preferredDate).toLocaleDateString()}</Typography>
              <Typography><strong>Status:</strong> <Chip label={selectedBooking.status} color={getStatusColor(selectedBooking.status)} size="small" /></Typography>
              
              {selectedBooking.message && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>Special Requests</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography>{selectedBooking.message}</Typography>
                  </Paper>
                </Box>
              )}
              
              {selectedBooking.referenceImage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>Reference Image</Typography>
                  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1, display: 'inline-block' }}>
                    <img 
                      src={selectedBooking.referenceImage} 
                      alt="Reference" 
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                    />
                  </Box>
                </Box>
              )}
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>System Information</Typography>
              <Typography><strong>Booking ID:</strong> {selectedBooking._id}</Typography>
              <Typography><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings;
