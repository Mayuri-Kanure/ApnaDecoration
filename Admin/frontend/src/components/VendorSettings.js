import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  Checkbox,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
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
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReplyIcon from '@mui/icons-material/Reply';

const VendorSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    field: '',
    value: false,
    iconType: ''
  });
  const [settings, setSettings] = useState({
    defaultCommission: '',
    enablePOSInVendorPanel: false,
    vendorRegistrationEnabled: true,
    setMinimumOrderAmount: false,
    vendorCanReplyOnReview: true,
    forgotPasswordVerificationType: 'email',
    newProductApprovalRequired: false,
    productWiseShippingCostApproval: false,
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
        console.error('Error fetching vendor settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    // Show confirmation popup for POS, vendor registration, minimum order amount, and reply on review toggles
    if (field === 'enablePOSInVendorPanel' || field === 'vendorRegistrationEnabled' || field === 'setMinimumOrderAmount' || field === 'vendorCanReplyOnReview') {
      const fieldLabels = {
        enablePOSInVendorPanel: 'POS in Vendor Panel',
        vendorRegistrationEnabled: 'Vendor Registration',
        setMinimumOrderAmount: 'Set Minimum Order Amount',
        vendorCanReplyOnReview: 'Vendor Can Reply on Review'
      };
      
      const action = value ? 'Enable' : 'Disable';
      const messages = {
        enablePOSInVendorPanel: value 
          ? 'Are you sure you want to enable POS in Vendor Panel? This will allow vendors to access Point of Sale functionality.'
          : 'Are you sure you want to disable POS in Vendor Panel? This will remove Point of Sale access for vendors.',
        vendorRegistrationEnabled: value
          ? 'Are you sure you want to enable Vendor Registration? This will allow new vendors to register on your platform.'
          : 'Are you sure you want to disable Vendor Registration? This will prevent new vendors from registering on your platform.',
        setMinimumOrderAmount: value
          ? 'Are you sure you want to enable Set Minimum Order Amount? This will allow vendors to set minimum order requirements.'
          : 'Are you sure you want to disable Set Minimum Order Amount? This will remove minimum order requirements for vendors.',
        vendorCanReplyOnReview: value
          ? 'Are you sure you want to enable Vendor Can Reply on Review? This will allow vendors to respond to customer reviews.'
          : 'Are you sure you want to disable Vendor Can Reply on Review? This will prevent vendors from responding to customer reviews.'
      };
      
      setConfirmModal({
        open: true,
        title: `${action} ${fieldLabels[field]}`,
        message: messages[field],
        field: field,
        value: value,
        iconType: field === 'enablePOSInVendorPanel' ? 'pos' : field === 'vendorRegistrationEnabled' ? 'registration' : field === 'setMinimumOrderAmount' ? 'minorder' : 'reply'
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
      alert('Vendor Settings Saved Successfully');
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

      {/* Vendor Setup Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Vendor Setup
          </Typography>

          <Grid container spacing={3}>
            {/* Default Commission */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Default Commission (%)</Typography>
                <Tooltip title="Sets platform commission charged to vendors on every order">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                type="number"
                value={settings.defaultCommission}
                onChange={(e) => handleChange('defaultCommission', e.target.value)}
                placeholder="Enter commission percentage"
                size="small"
              />
            </Grid>

            {/* Enable POS in Vendor Panel */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Enable POS in Vendor Panel</Typography>
                <Tooltip title="Allows vendors to use POS for offline/in-store orders">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.enablePOSInVendorPanel}
                onChange={(e) => handleChange('enablePOSInVendorPanel', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Vendor Registration */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Vendor Registration</Typography>
                <Tooltip title="Enable/Disable new vendor registration from marketplace">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.vendorRegistrationEnabled}
                onChange={(e) => handleChange('vendorRegistrationEnabled', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Set Minimum Order Amount */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Set Minimum Order Amount</Typography>
                <Tooltip title="Optional rule for vendors to set minimum order price">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.setMinimumOrderAmount}
                onChange={(e) => handleChange('setMinimumOrderAmount', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Vendor Can Reply on Review */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Vendor Can Reply on Review</Typography>
                <Tooltip title="Vendors can respond to customer reviews">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Switch
                checked={settings.vendorCanReplyOnReview}
                onChange={(e) => handleChange('vendorCanReplyOnReview', e.target.checked)}
                color="primary"
              />
            </Grid>

            {/* Forgot Password Verification Type */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Forgot Password Verification By</Typography>
                <Tooltip title="Admin decides how vendors verify forgot password">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={settings.forgotPasswordVerificationType}
                  onChange={(e) => handleChange('forgotPasswordVerificationType', e.target.value)}
                >
                  <FormControlLabel value="email" control={<Radio size="small" />} label="Email" />
                  <FormControlLabel value="phone" control={<Radio size="small" />} label="Phone OTP" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Need Product Approval Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Need Product Approval
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">New Product</Typography>
                <Tooltip title="Marketplace admin must approve new products before listing">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Checkbox
                checked={settings.newProductApprovalRequired}
                onChange={(e) => handleChange('newProductApprovalRequired', e.target.checked)}
                color="primary"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Product Wise Shipping Cost</Typography>
                <Tooltip title="This feature will activate whenever a Vendor add a product or modifies the shipping cost of any product">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Checkbox
                checked={settings.productWiseShippingCostApproval}
                onChange={(e) => handleChange('productWiseShippingCostApproval', e.target.checked)}
                color="primary"
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

      {/* Confirmation Modal for POS, Vendor Registration, Minimum Order Amount, and Reply on Review Toggles */}
      <Dialog open={confirmModal.open} onClose={() => setConfirmModal({ open: false, title: '', message: '', field: '', value: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          {confirmModal.iconType === 'pos' ? (
            <PointOfSaleIcon sx={{ fontSize: 48, color: '#9c27b0', mb: 2 }} />
          ) : confirmModal.iconType === 'registration' ? (
            <PersonAddIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
          ) : confirmModal.iconType === 'minorder' ? (
            <ShoppingCartIcon sx={{ fontSize: 48, color: '#ff5722', mb: 2 }} />
          ) : confirmModal.iconType === 'reply' ? (
            <ReplyIcon sx={{ fontSize: 48, color: '#607d8b', mb: 2 }} />
          ) : (
            <PointOfSaleIcon sx={{ fontSize: 48, color: '#9c27b0', mb: 2 }} />
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

export default VendorSettings;
