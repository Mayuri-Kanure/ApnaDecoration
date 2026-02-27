import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet as WalletIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function WithdrawalMethods() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    methodName: '',
    methodFields: '',
    isActive: true,
    isDefault: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch withdraw methods from API
  const fetchWithdrawMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/withdraw-methods`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMethods(response.data.methods || []);
    } catch (error) {
      console.error('Error fetching withdraw methods:', error);
      setSnackbar({ open: true, message: 'Error loading methods', severity: 'error' });
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchWithdrawMethods();
  }, []);

  const handleAddMethod = () => {
    navigate('/add-withdrawal-method');
  };

  const handleEditMethod = (method) => {
    setEditingMethod(method);
    setFormData({
      methodName: method.methodName,
      methodFields: method.methodFields,
      isActive: method.isActive,
      isDefault: method.isDefault
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingMethod) {
      const updatedMethods = methods.map(method =>
        method._id === editingMethod._id ? { ...method, ...formData } : method
      );
      setMethods(updatedMethods);
      setSnackbar({ open: true, message: 'Method updated successfully', severity: 'success' });
    } else {
      const newMethod = {
        _id: Date.now(),
        ...formData,
        methodFields: formData.methodFields.split(',').map(field => field.trim())
      };
      setMethods([...methods, newMethod]);
      setSnackbar({ open: true, message: 'Method added successfully', severity: 'success' });
    }
    setDialogOpen(false);
  };

  const handleDeleteMethod = (methodId) => {
    setMethods(methods.filter(method => method._id !== methodId));
    setSnackbar({ open: true, message: 'Method deleted successfully', severity: 'success' });
  };

  const handleToggleStatus = (methodId) => {
    const updatedMethods = methods.map(method =>
      method._id === methodId ? { ...method, isActive: !method.isActive } : method
    );
    setMethods(updatedMethods);
  };

  const handleToggleDefault = (methodId) => {
    const updatedMethods = methods.map(method => ({
      ...method,
      isDefault: method._id === methodId ? !method.isDefault : false
    }));
    setMethods(updatedMethods);
  };

  const filteredMethods = methods.filter(method =>
    method.methodName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WalletIcon sx={{ fontSize: 28, color: '#0d6efd' }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                Withdraw Method List
              </Typography>
              <Chip 
                label={methods.length} 
                color="primary" 
                size="small"
                sx={{ backgroundColor: '#E3F2FD', color: '#0d6efd', fontWeight: 600 }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMethod}
              sx={{ 
                backgroundColor: '#0d6efd',
                '&:hover': { backgroundColor: '#0b5ed7' }
              }}
            >
              Add method
            </Button>
          </Box>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search Method Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                flex: 1,
                maxWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              variant="outlined"
              sx={{ 
                borderColor: '#0d6efd', 
                color: '#0d6efd',
                '&:hover': { backgroundColor: '#E3F2FD' }
              }}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {filteredMethods.length === 0 ? (
            // Empty State
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <FolderIcon sx={{ fontSize: 80, color: '#CCCCCC', mb: 2 }} />
              <Typography variant="h6" color="#666" sx={{ mb: 1 }}>
                No withdraw method found
              </Typography>
              <Typography variant="body2" color="#999">
                Click "Add method" to create your first withdrawal method
              </Typography>
            </Box>
          ) : (
            // Data Table
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>SL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Method Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Method Fields</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Active Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Default Method</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMethods.map((method, index) => (
                    <TableRow key={method._id} hover sx={{ '&:hover': { backgroundColor: '#F8F9FA' } }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {method.methodName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {method.methodFields.map((field, idx) => (
                            <Chip
                              key={idx}
                              label={field.fieldName}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={method.isActive}
                              onChange={() => handleToggleStatus(method._id)}
                              color="success"
                            />
                          }
                          label={method.isActive ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={method.isDefault}
                              onChange={() => handleToggleDefault(method._id)}
                              color="primary"
                            />
                          }
                          label={method.isDefault ? 'Default' : 'Not Default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditMethod(method)}
                            sx={{ 
                              color: '#0d6efd',
                              '&:hover': { backgroundColor: '#E3F2FD' }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMethod(method._id)}
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMethod ? 'Edit Withdrawal Method' : 'Add Withdrawal Method'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Method Name"
              value={formData.methodName}
              onChange={(e) => setFormData({ ...formData, methodName: e.target.value })}
              placeholder="e.g., Bank Transfer, PayPal"
            />
            <TextField
              fullWidth
              label="Method Fields"
              value={formData.methodFields}
              onChange={(e) => setFormData({ ...formData, methodFields: e.target.value })}
              placeholder="e.g., Account Number, IFSC Code, Bank Name"
              helperText="Separate multiple fields with commas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="success"
                />
              }
              label="Active Status"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  color="primary"
                />
              }
              label="Default Method"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingMethod ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default WithdrawalMethods;