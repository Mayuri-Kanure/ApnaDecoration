import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";

const OrderSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    field: '',
    value: false,
    title: '',
    message: '',
    iconType: ''
  });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settings, setSettings] = useState({
    orderDeliveryVerification: false,
    minimumOrderAmountEnabled: false,
    showBillingAddress: false,
    freeDelivery: false,
    freeDeliveryResponsibility: "Admin",
    freeDeliveryOver: "",
    refundValidityDays: "",
    guestCheckout: false,
  });

  // API URL
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/admin-settings/order-settings`);
        setSettings(response.data);
        
        // Also load maintenance mode status
        const generalResponse = await axios.get(`${API}/admin-settings`);
        setMaintenanceMode(generalResponse.data.maintenanceMode || false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setAlert({
          open: true,
          message: 'Failed to load order settings',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleMaintenanceModeToggle = async (value) => {
    try {
      setSaving(true);
      
      // Update maintenance mode in general settings
      await axios.put(`${API}/admin-settings`, { maintenanceMode: value });
      
      setMaintenanceMode(value);
      setAlert({
        open: true,
        message: `Maintenance mode ${value ? 'enabled' : 'disabled'} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating maintenance mode:', error);
      setAlert({
        open: true,
        message: 'Failed to update maintenance mode',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    // Show confirmation popup for order delivery verification, minimum order amount, show billing address, free delivery, and guest checkout
    if (field === 'orderDeliveryVerification' || field === 'minimumOrderAmountEnabled' || field === 'showBillingAddress' || field === 'freeDelivery' || field === 'guestCheckout') {
      // Update the state immediately to show the toggle change
      const tempSettings = { ...settings, [field]: value };
      setSettings(tempSettings);
      
      const fieldLabels = {
        orderDeliveryVerification: 'Order Delivery Verification',
        minimumOrderAmountEnabled: 'Minimum Order Amount',
        showBillingAddress: 'Show Billing Address in Checkout',
        freeDelivery: 'Free Delivery',
        guestCheckout: 'Guest Checkout'
      };
      
      const action = value ? 'Enable' : 'Disable';
      const messages = {
        orderDeliveryVerification: value 
          ? 'Are you sure you want to enable Order Delivery Verification? This will require verification for order deliveries.'
          : 'Are you sure you want to disable Order Delivery Verification? This will remove verification requirements for order deliveries.',
        minimumOrderAmountEnabled: value
          ? 'Are you sure you want to enable Minimum Order Amount? This will require minimum order amount for orders.'
          : 'Are you sure you want to disable Minimum Order Amount? This will remove minimum order amount requirements for orders.',
        showBillingAddress: value
          ? 'Are you sure you want to enable Show Billing Address in Checkout? This will show billing address during checkout process.'
          : 'Are you sure you want to disable Show Billing Address in Checkout? This will hide billing address during checkout process.',
        freeDelivery: value
          ? 'Are you sure you want to enable Free Delivery? This will provide free delivery for orders.'
          : 'Are you sure you want to disable Free Delivery? This will remove free delivery option for orders.',
        guestCheckout: value
          ? 'Are you sure you want to enable Guest Checkout? This will allow customers to checkout without creating an account.'
          : 'Are you sure you want to disable Guest Checkout? This will require customers to create an account for checkout.'
      };
      
      setConfirmModal({
        open: true,
        title: `${action} ${fieldLabels[field]}`,
        message: messages[field],
        field: field,
        value: value,
        iconType: field === 'orderDeliveryVerification' ? 'verification' : field === 'minimumOrderAmountEnabled' ? 'minorder' : field === 'showBillingAddress' ? 'billing' : field === 'freeDelivery' ? 'freedelivery' : 'guest',
        originalValue: !value // Store original value to revert if cancelled
      });
    } else {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleConfirmToggle = async () => {
    try {
      setSaving(true);
      
      // Update the setting
      const updatedSettings = { ...settings, [confirmModal.field]: confirmModal.value };
      
      // API call to save settings
      const response = await axios.put(`${API}/admin-settings/order-settings`, updatedSettings);
      
      setSettings(response.data);
      setAlert({
        open: true,
        message: `${confirmModal.title} completed successfully!`,
        severity: 'success'
      });
      
      // Close confirmation modal
      setConfirmModal({ open: false, title: '', message: '', field: '', value: false, iconType: '' });
    } catch (error) {
      console.error('Error updating order settings:', error);
      setAlert({
        open: true,
        message: 'Failed to update order setting: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelToggle = () => {
    // Revert the state back to original value
    setSettings((prev) => ({ ...prev, [confirmModal.field]: confirmModal.originalValue }));
    setConfirmModal({ open: false, title: '', message: '', field: '', value: false, iconType: '', originalValue: false });
  };

  // Save Settings to Backend
  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await axios.post(`${API}/admin-settings/order-settings`, settings);

      setSettings(response.data);
      setAlert({
        open: true,
        message: 'Order Settings saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlert({
        open: true,
        message: 'Failed to save settings: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
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

      {/* Maintenance Mode Section */}
      <Card sx={{ 
        borderRadius: 2, 
        boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
        mb: 3,
        backgroundColor: maintenanceMode ? '#fff3cd' : 'white'
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: maintenanceMode ? '#f57c00' : '#1976d2' }} />
            Maintenance Mode Control
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {maintenanceMode ? '🚧 MAINTENANCE MODE IS ENABLED' : '✅ MAINTENANCE MODE IS DISABLED'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {maintenanceMode 
                  ? 'Website is currently under maintenance. Users cannot access the site.'
                  : 'Website is accessible to all users.'
                }
              </Typography>
            </Box>
            <Switch
              checked={maintenanceMode}
              onChange={(e) => handleMaintenanceModeToggle(e.target.checked)}
              disabled={saving}
              size="small"
            />
          </Box>
          
          {maintenanceMode && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#fff8e1', 
              border: '1px solid #ffeaa7',
              borderRadius: 1,
              mt: 2
            }}>
              <Typography variant="body2" sx={{ color: '#856404', fontWeight: 'bold' }}>
                ⚠️ Maintenance Mode Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - Users cannot access the website
                - Only administrators can disable it
                - All pages show maintenance message
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
        <CardContent>
          <Grid container spacing={3}>

            {/* Order Delivery Verification */}
            <Grid item xs={12} md={4}>
              <Typography>
                Order Delivery Verification <InfoOutlinedIcon fontSize="small" />
              </Typography>
              <Switch
                checked={settings.orderDeliveryVerification}
                onChange={(e) =>
                  handleChange("orderDeliveryVerification", e.target.checked)
                }
              />
            </Grid>

            {/* Minimum Order Amount */}
            <Grid item xs={12} md={4}>
              <Typography>
                Minimum order amount <InfoOutlinedIcon fontSize="small" />
              </Typography>
              <Switch
                checked={settings.minimumOrderAmountEnabled}
                onChange={(e) =>
                  handleChange("minimumOrderAmountEnabled", e.target.checked)
                }
              />
            </Grid>

            {/* Show Billing Address */}
            <Grid item xs={12} md={4}>
              <Typography>
                Show Billing Address In Checkout <InfoOutlinedIcon fontSize="small" />
              </Typography>
              <Switch
                checked={settings.showBillingAddress}
                onChange={(e) =>
                  handleChange("showBillingAddress", e.target.checked)
                }
              />
            </Grid>

            {/* Free Delivery */}
            <Grid item xs={12} md={4}>
              <Typography>
                Free Delivery <InfoOutlinedIcon fontSize="small" />
              </Typography>
              <Switch
                checked={settings.freeDelivery}
                onChange={(e) =>
                  handleChange("freeDelivery", e.target.checked)
                }
              />
            </Grid>

            {/* Free Delivery Responsibility */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Free Delivery Responsibility</InputLabel>
                <Select
                  value={settings.freeDeliveryResponsibility}
                  onChange={(e) =>
                    handleChange("freeDeliveryResponsibility", e.target.value)
                  }
                  label="Free Delivery Responsibility"
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Vendor">Vendor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Free Delivery Over */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Free Delivery Over (₹)"
                fullWidth
                type="number"
                value={settings.freeDeliveryOver}
                onChange={(e) =>
                  handleChange("freeDeliveryOver", e.target.value)
                }
              />
            </Grid>

            {/* Refund Order Validity */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Refund Order Validity (Days)"
                fullWidth
                type="number"
                value={settings.refundValidityDays}
                onChange={(e) =>
                  handleChange("refundValidityDays", e.target.value)
                }
              />
            </Grid>

            {/* Guest Checkout */}
            <Grid item xs={12} md={4}>
              <Typography>
                Guest checkout <InfoOutlinedIcon fontSize="small" />
              </Typography>
              <Switch
                checked={settings.guestCheckout}
                onChange={(e) =>
                  handleChange("guestCheckout", e.target.checked)
                }
              />
            </Grid>

            {/* Save Button */}
            <Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={22} /> : "Save"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Order Delivery Verification, Minimum Order Amount, Show Billing Address, Free Delivery, and Guest Checkout */}
      <Dialog open={confirmModal.open} onClose={() => setConfirmModal({ open: false, title: '', message: '', field: '', value: false, iconType: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          {confirmModal.iconType === 'verification' ? (
            <VerifiedIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
          ) : confirmModal.iconType === 'minorder' ? (
            <ShoppingCartIcon sx={{ fontSize: 48, color: '#ff5722', mb: 2 }} />
          ) : confirmModal.iconType === 'billing' ? (
            <LocationOnIcon sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
          ) : confirmModal.iconType === 'freedelivery' ? (
            <LocalShippingIcon sx={{ fontSize: 48, color: '#9c27b0', mb: 2 }} />
          ) : confirmModal.iconType === 'guest' ? (
            <PersonIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
          ) : (
            <VerifiedIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
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
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'OK'}
          </Button>
          <Button
            onClick={handleCancelToggle}
            variant="outlined"
            color="error"
            sx={{ minWidth: 100 }}
            disabled={saving}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={alert.severity} onClose={() => setAlert(prev => ({ ...prev, open: false }))}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderSettings;
