import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShareIcon from '@mui/icons-material/Share';
import MoneyIcon from '@mui/icons-material/Money';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const CustomerSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    field: '',
    value: false
  });
  const [settings, setSettings] = useState({
    // Customer Wallet
    customerWalletEnabled: false,
    addRefundAmountToWallet: false,
    addFundToWallet: false,
    minimumAddFundAmount: '',
    maximumAddFundAmount: '',
    
    // Loyalty Points
    customerLoyaltyPointsEnabled: false,
    equivalentPointToCurrency: '',
    loyaltyPointEarnOnEachOrder: '',
    minimumPointRequiredToConvert: '',
    
    // Referral
    referralFeatureEnabled: false,
    earningsToEachReferral: '',
  });

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/admin-settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching customer settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    // Show confirmation popup for wallet-related toggles, loyalty points, and referral
    if (field === 'customerWalletEnabled' || field === 'addRefundAmountToWallet' || field === 'addFundToWallet' || field === 'customerLoyaltyPointsEnabled' || field === 'referralFeatureEnabled') {
      const fieldLabels = {
        customerWalletEnabled: 'Customer Wallet',
        addRefundAmountToWallet: 'Add Refund Amount to Wallet',
        addFundToWallet: 'Add Fund to Wallet',
        customerLoyaltyPointsEnabled: 'Customer Loyalty Points',
        referralFeatureEnabled: 'Customer Referral Earning'
      };
      
      const action = value ? 'Turn ON' : 'Turn OFF';
      setConfirmModal({
        open: true,
        title: `${action} ${fieldLabels[field]}`,
        message: value 
          ? `Are you sure you want to enable ${fieldLabels[field]}? This will activate this feature for customers.`
          : `Are you sure you want to disable ${fieldLabels[field]}? This will deactivate this feature for customers.`,
        field: field,
        value: value,
        iconType: field === 'customerLoyaltyPointsEnabled' ? 'loyalty' : field === 'referralFeatureEnabled' ? 'referral' : field === 'addRefundAmountToWallet' ? 'refund' : field === 'addFundToWallet' ? 'addfund' : 'wallet'
      });
    } else {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleConfirmToggle = () => {
    setSettings((prev) => ({ ...prev, [confirmModal.field]: confirmModal.value }));
    setConfirmModal({ open: false, title: '', message: '', field: '', value: false });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5000/api/admin-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      console.log('Saved:', data);
      alert('Customer Settings Saved Successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Toggles Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Customer Wallet Toggle */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceWalletIcon sx={{ color: '#1976d2' }} />
                <Typography variant="body2">Customer Wallet</Typography>
                <Tooltip title="Enable/Disable the entire wallet system for customers">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.customerWalletEnabled}
                onChange={(e) => handleChange('customerWalletEnabled', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Customer Loyalty Points Toggle */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon sx={{ color: '#ffa726' }} />
                <Typography variant="body2">Customer Loyalty Points</Typography>
                <Tooltip title="Enable/Disable loyalty rewards for customers">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.customerLoyaltyPointsEnabled}
                onChange={(e) => handleChange('customerLoyaltyPointsEnabled', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Customer Referral Earning Toggle */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShareIcon sx={{ color: '#66bb6a' }} />
                <Typography variant="body2">Customer Referral Earning</Typography>
                <Tooltip title="Enable/Disable the referral earnings model">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.referralFeatureEnabled}
                onChange={(e) => handleChange('referralFeatureEnabled', e.target.checked)}
                color="primary"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Customer Wallet Settings Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Customer Wallet Settings
          </Typography>

          <Grid container spacing={3}>
            {/* Add Refund Amount to Wallet */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Add Refund Amount to Wallet</Typography>
                <Tooltip title="Order refunds automatically go to customer's wallet">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.addRefundAmountToWallet}
                onChange={(e) => handleChange('addRefundAmountToWallet', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Add Fund to Wallet */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Add Fund to Wallet</Typography>
                <Tooltip title="Allows customers to add money to their wallet">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.addFundToWallet}
                onChange={(e) => handleChange('addFundToWallet', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Minimum Add Fund Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Add Fund Amount (INR)"
                type="number"
                value={settings.minimumAddFundAmount}
                onChange={(e) => handleChange('minimumAddFundAmount', e.target.value)}
                helperText="Restricts minimum amount customers must add"
                size="small"
              />
            </Grid>

            {/* Maximum Add Fund Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Add Fund Amount (INR)"
                type="number"
                value={settings.maximumAddFundAmount}
                onChange={(e) => handleChange('maximumAddFundAmount', e.target.value)}
                helperText="Caps the maximum wallet top-up amount"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Customer Loyalty Point Settings Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Customer Loyalty Point Settings
          </Typography>

          <Grid container spacing={3}>
            {/* Equivalent Point to Currency */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Equivalent Point to 1 Unit Currency"
                type="number"
                value={settings.equivalentPointToCurrency}
                onChange={(e) => handleChange('equivalentPointToCurrency', e.target.value)}
                helperText="e.g., 1 point = 1 INR"
                size="small"
              />
            </Grid>

            {/* Loyalty Point Earn on Each Order */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Loyalty Point Earn on Each Order (%)"
                type="number"
                value={settings.loyaltyPointEarnOnEachOrder}
                onChange={(e) => handleChange('loyaltyPointEarnOnEachOrder', e.target.value)}
                helperText="Customers earn points based on order amount"
                size="small"
              />
            </Grid>

            {/* Minimum Point Required to Convert */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Point Required to Convert"
                type="number"
                value={settings.minimumPointRequiredToConvert}
                onChange={(e) => handleChange('minimumPointRequiredToConvert', e.target.value)}
                helperText="Minimum points needed before conversion"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Customer Referrer Settings Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Customer Referrer Settings
          </Typography>

          <Grid container spacing={3}>
            {/* Earnings To Each Referral */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Earnings To Each Referral (INR)"
                type="number"
                value={settings.earningsToEachReferral}
                onChange={(e) => handleChange('earningsToEachReferral', e.target.value)}
                helperText="Monetary reward for referrer when invited user orders"
                size="small"
              />
            </Grid>
          </Grid>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={22} /> : 'Save'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Customer Wallet Toggles */}
      <Dialog open={confirmModal.open} onClose={() => setConfirmModal({ open: false, title: '', message: '', field: '', value: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          {confirmModal.iconType === 'loyalty' ? (
            <EmojiEventsIcon sx={{ fontSize: 48, color: '#ffa726', mb: 2 }} />
          ) : confirmModal.iconType === 'referral' ? (
            <ShareIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
          ) : confirmModal.iconType === 'refund' ? (
            <MoneyIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
          ) : confirmModal.iconType === 'addfund' ? (
            <AddCircleIcon sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
          ) : (
            <AccountBalanceWalletIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {confirmModal.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {confirmModal.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            onClick={handleConfirmToggle}
            variant="contained"
            color="primary"
            sx={{ minWidth: 100 }}
          >
            OK
          </Button>
          <Button
            onClick={() => setConfirmModal({ open: false, title: '', message: '', field: '', value: false })}
            variant="outlined"
            color="error"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerSettings;
