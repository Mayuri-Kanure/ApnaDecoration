import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings,
  Notifications,
  Security,
  Language,
  Help,
  Logout,
  Save,
  Refresh,
  VolumeUp,
  VolumeOff,
  LocationOn,
  LocationOff,
  Email,
  Phone,
  Lock,
  Delete
} from '@mui/icons-material';

export default function DeliveryBoySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Account settings only
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('deliveryBoyToken');
    if (!token) {
      router.push('/delivery-boy/login');
      return;
    }
  }, []);

  const handleChangePassword = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }

    if (!settings.currentPassword || !settings.newPassword) {
      setSnackbar({ open: true, message: 'Please fill in all password fields', severity: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      await axios.put('http://localhost:5002/api/delivery-boys/change-password', {
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error changing password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('deliveryBoyToken');
    localStorage.removeItem('deliveryBoyData');
    router.push('/delivery-boy/login');
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      await axios.delete('http://localhost:5002/api/delivery-boys/account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Account deleted successfully', severity: 'success' });
      handleLogout();
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbar({ open: true, message: 'Error deleting account', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings({ ...settings, [setting]: value });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#1e3a5f', color: 'white', p: 2, mb: 3 }}>
        <Typography variant="h6">Settings</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Lock sx={{ mr: 1 }} />
                Security Settings
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={settings.currentPassword || ''}
                    onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={settings.newPassword || ''}
                    onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={settings.confirmPassword || ''}
                    onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                    margin="normal"
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Account Actions</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  startIcon={<Delete />}
                  fullWidth
                >
                  Delete Account
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleLogout}
                  startIcon={<Logout />}
                  fullWidth
                >
                  Logout
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

