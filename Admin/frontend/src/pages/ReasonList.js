import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
  Modal,
  TextField,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const ReasonList = () => {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 0,
    status: true
  });

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reasons');
      setReasons(response.data);
    } catch (error) {
      console.error('Error loading reasons:', error);
      setSnackbar({
        open: true,
        message: 'Error loading reasons',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (reason = null) => {
    if (reason) {
      setEditingReason(reason);
      setFormData({
        title: reason.title,
        description: reason.description,
        priority: reason.priority,
        status: reason.status
      });
    } else {
      setEditingReason(null);
      setFormData({
        title: '',
        description: '',
        priority: 0,
        status: true
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingReason(null);
    setFormData({
      title: '',
      description: '',
      priority: 0,
      status: true
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'priority' ? parseInt(event.target.value) : 
                   field === 'status' ? event.target.checked : 
                   event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Title and description are required',
        severity: 'error'
      });
      return;
    }

    try {
      if (editingReason) {
        // Update existing reason
        await axios.put(`/api/reasons/${editingReason._id}`, formData);
        setSnackbar({
          open: true,
          message: 'Reason updated successfully',
          severity: 'success'
        });
      } else {
        // Create new reason
        await axios.post('/api/reasons', formData);
        setSnackbar({
          open: true,
          message: 'Reason created successfully',
          severity: 'success'
        });
      }

      handleCloseModal();
      await loadReasons();
    } catch (error) {
      console.error('Error saving reason:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving reason',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (reasonId) => {
    if (!window.confirm('Are you sure you want to delete this reason?')) {
      return;
    }

    try {
      await axios.delete(`/api/reasons/${reasonId}`);
      setSnackbar({
        open: true,
        message: 'Reason deleted successfully',
        severity: 'success'
      });
      await loadReasons();
    } catch (error) {
      console.error('Error deleting reason:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting reason',
        severity: 'error'
      });
    }
  };

  const handleToggleStatus = async (reasonId) => {
    try {
      await axios.patch(`/api/reasons/${reasonId}/toggle-status`);
      setSnackbar({
        open: true,
        message: 'Reason status updated successfully',
        severity: 'success'
      });
      await loadReasons();
    } catch (error) {
      console.error('Error toggling reason status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating reason status',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 300, 
          color: '#1e3a5f'
        }}>
          Reason List
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d5a8c'
            }
          }}
        >
          + Add Reason
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>SL No.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reasons.map((reason, index) => (
                <TableRow key={reason._id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{reason.title}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reason.description}
                  </TableCell>
                  <TableCell>{reason.priority}</TableCell>
                  <TableCell>
                    <Switch
                      checked={reason.status}
                      onChange={() => handleToggleStatus(reason._id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenModal(reason)}
                      size="small"
                      sx={{ color: '#1e3a5f' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(reason._id)}
                      size="small"
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {reasons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                    No reasons found. Click "Add Reason" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {editingReason ? 'Edit Reason' : 'Add Reason'}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              multiline
              rows={3}
              required
            />

            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={handleInputChange('priority')}
              fullWidth
              inputProps={{ min: 0 }}
              helperText="Higher number = higher priority"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={handleInputChange('status')}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderColor: '#ccc',
                color: '#666',
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: '#1e3a5f',
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#2d5a8c'
                }
              }}
            >
              {editingReason ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReasonList;
