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
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const ShippingSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: ''
  });
  const [settings, setSettings] = useState({
    shippingResponsibility: 'inhouse',
    shippingMethodForInhouseDelivery: 'order_wise',
    orderWiseShippingMethods: [
      {
        id: 1,
        title: 'Fast Delivery',
        duration: '6 Days',
        cost: '₹0.00',
        status: true
      }
    ],
    newShippingMethod: {
      title: '',
      duration: '',
      cost: ''
    }
  });

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/settings/shipping');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching shipping settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    if (field === 'shippingResponsibility') {
      if (value === 'vendor') {
        // Show confirmation popup for vendor wise shipping
        setConfirmModal({
          open: true,
          title: 'Vendor Wise Shipping',
          message: 'Are you sure you want to select Vendor Wise Shipping? This will make vendors responsible for shipping costs and management.',
          action: 'vendor'
        });
      } else if (value === 'inhouse') {
        // Show confirmation popup for inhouse shipping
        setConfirmModal({
          open: true,
          title: 'Inhouse Shipping',
          message: 'Are you sure you want to select Inhouse Shipping? This will make your business responsible for shipping costs and management.',
          action: 'inhouse'
        });
      }
    } else {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleConfirmShipping = () => {
    if (confirmModal.action === 'vendor') {
      setSettings((prev) => ({ ...prev, shippingResponsibility: 'vendor' }));
    } else if (confirmModal.action === 'inhouse') {
      setSettings((prev) => ({ ...prev, shippingResponsibility: 'inhouse' }));
    } else if (confirmModal.action === 'toggle') {
      setSettings((prev) => {
        const currentMethods = prev.orderWiseShippingMethods || [];
        return {
          ...prev,
          orderWiseShippingMethods: currentMethods.map(method =>
            method && method.id === confirmModal.data.id ? { ...method, status: confirmModal.data.value } : method
          )
        };
      });
    }
    setConfirmModal({ open: false, title: '', message: '', action: '' });
  };

  const handleShippingMethodToggle = (id, currentStatus) => {
    if (!settings || !Array.isArray(settings.orderWiseShippingMethods)) {
      console.error('Shipping settings not initialized properly');
      return;
    }
    
    const method = settings.orderWiseShippingMethods.find(m => m && m.id === id);
    
    if (!method) {
      console.error('Shipping method not found for id:', id);
      return;
    }
    
    const action = currentStatus ? 'Turn OFF' : 'Turn ON';
    const methodTitle = method.title || 'Shipping Method';
    
    setConfirmModal({
      open: true,
      title: `${action} ${methodTitle}`,
      message: currentStatus 
        ? `Are you sure you want to turn OFF "${methodTitle}"? This will disable this shipping method for customers.`
        : `Are you sure you want to turn ON "${methodTitle}"? This will enable this shipping method for customers.`,
      action: 'toggle',
      data: { id, value: !currentStatus }
    });
  };

  const handleAddShippingMethod = () => {
    if (!settings || !settings.newShippingMethod) {
      console.error('Settings not properly initialized');
      return;
    }
    
    if (settings.newShippingMethod.title && settings.newShippingMethod.duration && settings.newShippingMethod.cost) {
      setSettings((prev) => ({
        ...prev,
        orderWiseShippingMethods: [...(prev.orderWiseShippingMethods || []), {
          id: Date.now(),
          title: settings.newShippingMethod.title,
          duration: settings.newShippingMethod.duration,
          cost: settings.newShippingMethod.cost,
          status: true
        }],
        newShippingMethod: { title: '', duration: '', cost: '' }
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5000/api/settings/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      console.log('Saved:', data);
      alert('Shipping Settings Saved Successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings || !Array.isArray(settings.orderWiseShippingMethods) || settings.orderWiseShippingMethods.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      {/* Shipping Responsibility Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="body2">Choose shipping responsibility</Typography>
                <Tooltip title="Select who handles shipping costs">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <RadioGroup
                row
                value={settings.shippingResponsibility}
                onChange={(e) => handleChange('shippingResponsibility', e.target.value)}
              >
                <FormControlLabel value="inhouse" control={<Radio size="small" />} label="Inhouse Shipping" />
                <FormControlLabel value="vendor" control={<Radio size="small" />} label="Vendor Wise Shipping" />
              </RadioGroup>
            </Grid>

            {/* Shipping Method For In-house Deliver - Always Visible */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Shipping Method For In-House Deliver</InputLabel>
                <Select
                  value={settings.shippingMethodForInhouseDelivery}
                  onChange={(e) => handleChange('shippingMethodForInhouseDelivery', e.target.value)}
                  label="Shipping Method"
                >
                  <MenuItem value="order_wise">Order Wise</MenuItem>
                  <MenuItem value="product_wise">Product Wise</MenuItem>
                  <MenuItem value="category_wise">Category Wise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={22} /> : 'Save'}
        </Button>
      </Box>

      {/* Add Order Wise Shipping Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Add Order Wise Shipping
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Title"
                value={settings.newShippingMethod.title}
                onChange={(e) => setSettings(prev => ({ ...prev, newShippingMethod: { ...prev.newShippingMethod, title: e.target.value } }))}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Duration (e.g., 4 to 6 days)"
                value={settings.newShippingMethod.duration}
                onChange={(e) => setSettings(prev => ({ ...prev, newShippingMethod: { ...prev.newShippingMethod, duration: e.target.value } }))}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cost"
                value={settings.newShippingMethod.cost}
                onChange={(e) => setSettings(prev => ({ ...prev, newShippingMethod: { ...prev.newShippingMethod, cost: e.target.value } }))}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddShippingMethod}
                sx={{ minWidth: 120 }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Order Wise Shipping Methods Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Order Wise Shipping Method
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SL</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(settings.orderWiseShippingMethods) && settings.orderWiseShippingMethods.length > 0 && settings.orderWiseShippingMethods.map((method, index) => (
                  <TableRow key={method?.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{method?.title || 'N/A'}</TableCell>
                    <TableCell>{method?.duration || 'N/A'}</TableCell>
                    <TableCell>{method?.cost || 'N/A'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={method?.status || false}
                        onChange={() => handleShippingMethodToggle(method?.id, method?.status)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Shipping Selection */}
      <Dialog open={confirmModal.open} onClose={() => setConfirmModal({ open: false, title: '', message: '', action: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <LocalShippingIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
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
            onClick={handleConfirmShipping}
            variant="contained"
            color="primary"
            sx={{ minWidth: 100 }}
          >
            OK
          </Button>
          <Button
            onClick={() => setConfirmModal({ open: false, title: '', message: '', action: '' })}
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

export default ShippingSettings;
