import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
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
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Redo as ResendIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';

const SendNotification = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    imageUrl: ''
  });

  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // For now, we'll load recent notifications (this would need a get all notifications endpoint for admin)
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // If endpoint doesn't work, keep empty array
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // For now, just store the file. In production, upload to cloud storage
      setFormData({
        ...formData,
        imageUrl: file.name // Placeholder - would be actual URL after upload
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      setAlert({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/broadcast`, 
        {
          title: formData.title,
          message: formData.message,
          type: 'promotion',
          imageUrl: formData.imageUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setAlert({ 
        open: true, 
        message: `Notification sent to ${response.data.sentTo} users successfully!`, 
        severity: 'success' 
      });
      
      // Add to local list for immediate display
      const newNotification = {
        _id: Date.now(),
        title: formData.title,
        message: formData.message,
        imageUrl: formData.imageUrl,
        type: 'promotion',
        isRead: false,
        createdAt: new Date(),
        sentTo: response.data.sentTo
      };
      
      setNotifications([newNotification, ...notifications]);
      handleReset();
      
    } catch (error) {
      console.error('Error sending notification:', error);
      setAlert({ 
        open: true, 
        message: 'Failed to send notification. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      message: '',
      imageUrl: ''
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      setNotifications(notifications.filter(notification => notification._id !== id));
      setAlert({ open: true, message: 'Notification deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setAlert({ open: true, message: 'Failed to delete notification', severity: 'error' });
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Send Notification
      </Typography>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Notification Creation Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Create New Notification
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  placeholder="Enter notification title"
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  placeholder="Enter notification message"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                    {formData.imageUrl ? (
                      <Box>
                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                          Image selected: {formData.imageUrl}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Click to upload image (optional)
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Ratio 1:1
                        </Typography>
                      </Box>
                    )}
                  </label>
                </Box>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Push Notification Table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Recent Notifications ({notifications.length})
            </Typography>
            <TextField
              size="small"
              placeholder="Search by Title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 250 }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell>SL</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Sent To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FolderIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                          No notifications found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Create your first notification using the form above
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <TableRow key={notification._id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {notification.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {notification.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.type || 'promotion'}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {notification.sentTo || 'All Users'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Sent"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" color="info">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(notification._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SendNotification;
