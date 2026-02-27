import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  CreditCard as PaymentIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';

function PaymentMethods() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('digital');
  
  // Offline payment methods state
  const [offlineMethods, setOfflineMethods] = useState([
    {
      id: 1,
      name: 'Cash on Delivery',
      paymentInfo: 'COD : Cash on Delivery',
      requiredInfo: 'Customer Name, Address, Phone',
      status: true,
      icon: null
    },
    {
      id: 2,
      name: 'Bank Transfer',
      paymentInfo: 'BT : Direct Bank Transfer',
      requiredInfo: 'Account Number, Transaction ID',
      status: true,
      icon: null
    },
    {
      id: 3,
      name: 'Manual UPI',
      paymentInfo: 'UPI : Manual UPI Payment',
      requiredInfo: 'UPI Transaction ID, UTR Number',
      status: false,
      icon: null
    }
  ]);
  
  // Offline payment methods UI state
  const [offlineSearchQuery, setOfflineSearchQuery] = useState('');
  const [offlineFilterTab, setOfflineFilterTab] = useState('all');
  const [addMethodDialogOpen, setAddMethodDialogOpen] = useState(false);
  const [editMethodDialogOpen, setEditMethodDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  // New method form state
  const [newMethod, setNewMethod] = useState({
    name: '',
    paymentInfo: '',
    requiredInfo: '',
    status: true,
    icon: null,
    paymentFields: [{ fieldName: '', inputData: '' }],
    customerFields: [{ fieldName: '', placeholder: '', isRequired: false }]
  });

  // Payment gateways state
  const [gateways, setGateways] = useState({
    mercadopago: {
      enabled: false,
      environment: 'sandbox',
      title: 'Mercadopago',
      accessToken: '',
      publicKey: '',
      logo: null
    },
    liqpay: {
      enabled: false,
      environment: 'sandbox',
      title: 'LiqPay',
      privateKey: '',
      publicKey: '',
      logo: null
    },
    paypal: {
      enabled: false,
      environment: 'sandbox',
      title: 'PayPal',
      clientId: '',
      clientSecret: '',
      logo: null
    },
    stripe: {
      enabled: false,
      environment: 'sandbox',
      title: 'Stripe',
      apiKey: '',
      publishedKey: '',
      logo: null
    },
    razorpay: {
      enabled: false,
      environment: 'sandbox',
      title: 'Razorpay',
      apiKey: '',
      apiSecret: '',
      logo: null
    },
    sslcommerz: {
      enabled: false,
      environment: 'sandbox',
      title: 'SSLCommerz',
      storeId: '',
      storePassword: '',
      logo: null
    },
    paytm: {
      enabled: false,
      environment: 'sandbox',
      title: 'Paytm',
      merchantKey: '',
      merchantId: '',
      merchantWebsiteLink: '',
      logo: null
    },
    paytabs: {
      enabled: false,
      environment: 'sandbox',
      title: 'PayTabs',
      profileId: '',
      serverKey: '',
      baseUrl: '',
      logo: null
    },
    senangpay: {
      enabled: false,
      environment: 'sandbox',
      title: 'SenangPay',
      callbackUrl: '',
      secretKey: '',
      merchantId: '',
      logo: null
    },
    flutterwave: {
      enabled: false,
      environment: 'sandbox',
      title: 'Flutterwave',
      secretKey: '',
      publicKey: '',
      hash: '',
      logo: null
    },
    bkash: {
      enabled: false,
      environment: 'sandbox',
      title: 'bKash',
      appKey: '',
      appSecret: '',
      username: '',
      password: '',
      logo: null
    },
    paystack: {
      enabled: false,
      environment: 'sandbox',
      title: 'Paystack',
      publicKey: '',
      secretKey: '',
      merchantEmail: '',
      logo: null
    },
    paymob: {
      enabled: false,
      environment: 'sandbox',
      title: 'Paymob Accept',
      callbackUrl: '',
      apiKey: '',
      iframeId: '',
      integrationId: '',
      hmac: '',
      logo: null
    }
  });

  const handleGatewayChange = (gateway, field, value) => {
    setGateways(prev => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value
      }
    }));
  };

  const handleLogoUpload = (gateway, event) => {
    const file = event.target.files[0];
    if (file) {
      setGateways(prev => ({
        ...prev,
        [gateway]: {
          ...prev[gateway],
          logo: file
        }
      }));
    }
  };

  const handleSave = (gateway) => {
    // Simulate saving to backend
    console.log(`Saving ${gateway} configuration:`, gateways[gateway]);
    setSnackbar({
      open: true,
      message: `${gateways[gateway].title} configuration saved successfully!`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Offline payment methods handlers
  const handleOfflineSearchChange = (event) => {
    setOfflineSearchQuery(event.target.value);
  };

  const handleOfflineFilterTabChange = (tab) => {
    setOfflineFilterTab(tab);
  };

  const handleToggleMethodStatus = (methodId) => {
    setOfflineMethods(prev => prev.map(method => 
      method.id === methodId ? { ...method, status: !method.status } : method
    ));
    setSnackbar({
      open: true,
      message: 'Payment method status updated successfully!',
      severity: 'success'
    });
  };

  const handleAddMethod = () => {
    if (newMethod.name.trim()) {
      const newId = Math.max(...offlineMethods.map(m => m.id)) + 1;
      setOfflineMethods(prev => [...prev, { ...newMethod, id: newId }]);
      setNewMethod({ 
        name: '', 
        paymentInfo: '', 
        requiredInfo: '', 
        status: true, 
        icon: null,
        paymentFields: [{ fieldName: '', inputData: '' }],
        customerFields: [{ fieldName: '', placeholder: '', isRequired: false }]
      });
      setAddMethodDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Payment method added successfully!',
        severity: 'success'
      });
    }
  };

  // Dynamic field handlers
  const handleAddPaymentField = () => {
    setNewMethod(prev => ({
      ...prev,
      paymentFields: [...prev.paymentFields, { fieldName: '', inputData: '' }]
    }));
  };

  const handleRemovePaymentField = (index) => {
    setNewMethod(prev => ({
      ...prev,
      paymentFields: prev.paymentFields.filter((_, i) => i !== index)
    }));
  };

  const handlePaymentFieldChange = (index, field, value) => {
    setNewMethod(prev => ({
      ...prev,
      paymentFields: prev.paymentFields.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddCustomerField = () => {
    setNewMethod(prev => ({
      ...prev,
      customerFields: [...prev.customerFields, { fieldName: '', placeholder: '', isRequired: false }]
    }));
  };

  const handleRemoveCustomerField = (index) => {
    setNewMethod(prev => ({
      ...prev,
      customerFields: prev.customerFields.filter((_, i) => i !== index)
    }));
  };

  const handleCustomerFieldChange = (index, field, value) => {
    setNewMethod(prev => ({
      ...prev,
      customerFields: prev.customerFields.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleEditMethod = () => {
    setOfflineMethods(prev => prev.map(method => 
      method.id === selectedMethod.id ? selectedMethod : method
    ));
    setEditMethodDialogOpen(false);
    setSelectedMethod(null);
    setSnackbar({
      open: true,
      message: 'Payment method updated successfully!',
      severity: 'success'
    });
  };

  const handleDeleteMethod = () => {
    setOfflineMethods(prev => prev.filter(method => method.id !== selectedMethod.id));
    setDeleteDialogOpen(false);
    setSelectedMethod(null);
    setSnackbar({
      open: true,
      message: 'Payment method deleted successfully!',
      severity: 'success'
    });
  };

  const openEditDialog = (method) => {
    setSelectedMethod(method);
    setEditMethodDialogOpen(true);
  };

  const openDeleteDialog = (method) => {
    setSelectedMethod(method);
    setDeleteDialogOpen(true);
  };

  // Filter offline methods based on search and tab
  const getFilteredOfflineMethods = () => {
    let filtered = offlineMethods;
    
    // Filter by search query
    if (offlineSearchQuery) {
      filtered = filtered.filter(method => 
        method.name.toLowerCase().includes(offlineSearchQuery.toLowerCase()) ||
        method.paymentInfo.toLowerCase().includes(offlineSearchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    if (offlineFilterTab === 'active') {
      filtered = filtered.filter(method => method.status);
    } else if (offlineFilterTab === 'inactive') {
      filtered = filtered.filter(method => !method.status);
    }
    
    return filtered;
  };

  // Gateway configuration components
  const PaymentGatewayCard = ({ gatewayKey, gateway, title, fields }) => (
    <Card sx={{ mb: 3, height: '100%' }}>
      <CardContent>
        {/* Header with toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Switch
            checked={gateway.enabled}
            onChange={(e) => handleGatewayChange(gatewayKey, 'enabled', e.target.checked)}
            color="primary"
          />
        </Box>

        {/* Logo Upload */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ 
            width: 120, 
            height: 80, 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            mx: 'auto', 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(gatewayKey, e)}
              style={{ display: 'none' }}
              id={`${gatewayKey}-logo-upload`}
            />
            <label htmlFor={`${gatewayKey}-logo-upload`} style={{ cursor: 'pointer' }}>
              {gateway.logo ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {gateway.logo.name}
                  </Typography>
                </Box>
              ) : (
                <UploadIcon sx={{ color: '#ccc', fontSize: 24 }} />
              )}
            </label>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Upload Logo
          </Typography>
        </Box>

        {/* Payment Gateway Title */}
        <TextField
          fullWidth
          label="Payment Gateway Title"
          value={gateway.title}
          onChange={(e) => handleGatewayChange(gatewayKey, 'title', e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Environment Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Environment</InputLabel>
          <Select
            value={gateway.environment}
            onChange={(e) => handleGatewayChange(gatewayKey, 'environment', e.target.value)}
            label="Environment"
          >
            <MenuItem value="live">Live</MenuItem>
            <MenuItem value="sandbox">Sandbox / Test</MenuItem>
          </Select>
        </FormControl>

        {/* Dynamic Fields Based on Gateway */}
        {fields.map((field) => (
          <TextField
            key={field.key}
            fullWidth
            label={field.label}
            type={field.type || 'text'}
            value={gateway[field.key] || ''}
            onChange={(e) => handleGatewayChange(gatewayKey, field.key, e.target.value)}
            required={field.required}
            sx={{ mb: 2 }}
            helperText={field.helperText}
          />
        ))}

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(gatewayKey)}
            disabled={!gateway.enabled}
          >
            Save
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Gateway field configurations
  const gatewayFields = {
    mercadopago: [
      { key: 'accessToken', label: 'Access Token *', required: true, helperText: 'Your Mercadopago access token' },
      { key: 'publicKey', label: 'Public Key *', required: true, helperText: 'Your Mercadopago public key' }
    ],
    liqpay: [
      { key: 'privateKey', label: 'Private Key *', required: true, helperText: 'Your LiqPay private key' },
      { key: 'publicKey', label: 'Public Key *', required: true, helperText: 'Your LiqPay public key' }
    ],
    paypal: [
      { key: 'clientId', label: 'Client ID *', required: true, helperText: 'Your PayPal client ID' },
      { key: 'clientSecret', label: 'Client Secret *', required: true, type: 'password', helperText: 'Your PayPal client secret' }
    ],
    stripe: [
      { key: 'apiKey', label: 'API Key *', required: true, helperText: 'Your Stripe secret key' },
      { key: 'publishedKey', label: 'Published Key *', required: true, helperText: 'Your Stripe publishable key' }
    ],
    razorpay: [
      { key: 'apiKey', label: 'API Key *', required: true, helperText: 'Your Razorpay key ID' },
      { key: 'apiSecret', label: 'API Secret *', required: true, type: 'password', helperText: 'Your Razorpay key secret' }
    ],
    sslcommerz: [
      { key: 'storeId', label: 'Store ID *', required: true, helperText: 'Your SSLCommerz store ID' },
      { key: 'storePassword', label: 'Store Password *', required: true, type: 'password', helperText: 'Your SSLCommerz store password' }
    ],
    paytm: [
      { key: 'merchantKey', label: 'Merchant Key *', required: true, helperText: 'Your Paytm merchant key' },
      { key: 'merchantId', label: 'Merchant ID *', required: true, helperText: 'Your Paytm merchant ID' },
      { key: 'merchantWebsiteLink', label: 'Merchant Website Link *', required: true, helperText: 'Your Paytm website URL' }
    ],
    paytabs: [
      { key: 'profileId', label: 'Profile ID *', required: true, helperText: 'Your PayTabs profile ID' },
      { key: 'serverKey', label: 'Server Key *', required: true, type: 'password', helperText: 'Your PayTabs server key' },
      { key: 'baseUrl', label: 'Base URL', helperText: 'PayTabs API base URL' }
    ],
    senangpay: [
      { key: 'callbackUrl', label: 'Callback URL *', required: true, helperText: 'Your callback URL for SenangPay' },
      { key: 'secretKey', label: 'Secret Key *', required: true, type: 'password', helperText: 'Your SenangPay secret key' },
      { key: 'merchantId', label: 'Merchant ID *', required: true, helperText: 'Your SenangPay merchant ID' }
    ],
    flutterwave: [
      { key: 'secretKey', label: 'Secret Key *', required: true, type: 'password', helperText: 'Your Flutterwave secret key' },
      { key: 'publicKey', label: 'Public Key *', required: true, helperText: 'Your Flutterwave public key' },
      { key: 'hash', label: 'Hash', helperText: 'Flutterwave hash for security' }
    ],
    bkash: [
      { key: 'appKey', label: 'App Key *', required: true, helperText: 'Your bKash app key' },
      { key: 'appSecret', label: 'App Secret *', required: true, type: 'password', helperText: 'Your bKash app secret' },
      { key: 'username', label: 'Username *', required: true, helperText: 'Your bKash username' },
      { key: 'password', label: 'Password *', required: true, type: 'password', helperText: 'Your bKash password' }
    ],
    paystack: [
      { key: 'publicKey', label: 'Public Key *', required: true, helperText: 'Your Paystack public key' },
      { key: 'secretKey', label: 'Secret Key *', required: true, type: 'password', helperText: 'Your Paystack secret key' },
      { key: 'merchantEmail', label: 'Merchant Email *', required: true, type: 'email', helperText: 'Your Paystack merchant email' }
    ],
    paymob: [
      { key: 'callbackUrl', label: 'Callback URL *', required: true, helperText: 'Your Paymob callback URL' },
      { key: 'apiKey', label: 'API Key *', required: true, type: 'password', helperText: 'Your Paymob API key' },
      { key: 'iframeId', label: 'Iframe ID *', required: true, helperText: 'Your Paymob iframe ID' },
      { key: 'integrationId', label: 'Integration ID *', required: true, helperText: 'Your Paymob integration ID' },
      { key: 'hmac', label: 'HMAC *', required: true, type: 'password', helperText: 'Your Paymob HMAC secret' }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          3rd Party – Payment Methods
        </Typography>
        <Chip 
          icon={<PaymentIcon />}
          label="Payment Configuration"
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex' }}>
          <Button
            onClick={() => setActiveTab('digital')}
            variant={activeTab === 'digital' ? 'contained' : 'text'}
            sx={{ 
              borderRadius: 0,
              textTransform: 'none',
              px: 3,
              py: 1,
              mr: 1
            }}
          >
            Digital Payment Methods
          </Button>
          <Button
            onClick={() => setActiveTab('offline')}
            variant={activeTab === 'offline' ? 'contained' : 'text'}
            sx={{ 
              borderRadius: 0,
              textTransform: 'none',
              px: 3,
              py: 1
            }}
          >
            Offline Payment Methods
          </Button>
        </Box>
      </Box>

      {/* Digital Payment Methods */}
      {activeTab === 'digital' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Configure digital payment gateways to enable online payments. Each gateway can be enabled/disabled independently.
        </Alert>
      )}

      {/* Offline Payment Methods */}
      {activeTab === 'offline' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Configure offline payment methods like bank transfers, cash on delivery, and other manual payment options.
        </Alert>
      )}

      {/* Payment Gateways Grid */}
      {activeTab === 'digital' && (
        <Grid container spacing={3}>
          {/* All Payment Gateways */}
          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="mercadopago"
              gateway={gateways.mercadopago}
              title="Mercadopago"
              fields={gatewayFields.mercadopago}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="liqpay"
              gateway={gateways.liqpay}
              title="LiqPay"
              fields={gatewayFields.liqpay}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="paypal"
              gateway={gateways.paypal}
              title="PayPal"
              fields={gatewayFields.paypal}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="stripe"
              gateway={gateways.stripe}
              title="Stripe"
              fields={gatewayFields.stripe}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="razorpay"
              gateway={gateways.razorpay}
              title="Razorpay"
              fields={gatewayFields.razorpay}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="sslcommerz"
              gateway={gateways.sslcommerz}
              title="SSLCommerz"
              fields={gatewayFields.sslcommerz}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="paytm"
              gateway={gateways.paytm}
              title="Paytm"
              fields={gatewayFields.paytm}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="paytabs"
              gateway={gateways.paytabs}
              title="PayTabs"
              fields={gatewayFields.paytabs}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="senangpay"
              gateway={gateways.senangpay}
              title="SenangPay"
              fields={gatewayFields.senangpay}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="paymob"
              gateway={gateways.paymob}
              title="Paymob Accept"
              fields={gatewayFields.paymob}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="flutterwave"
              gateway={gateways.flutterwave}
              title="Flutterwave"
              fields={gatewayFields.flutterwave}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="bkash"
              gateway={gateways.bkash}
              title="bKash"
              fields={gatewayFields.bkash}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PaymentGatewayCard
              gatewayKey="paystack"
              gateway={gateways.paystack}
              title="Paystack"
              fields={gatewayFields.paystack}
            />
          </Grid>
        </Grid>
      )}

      {/* Offline Payment Methods */}
      {activeTab === 'offline' && (
        <Box>
          {/* Header with Search and Add Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              placeholder="Search payment methods..."
              value={offlineSearchQuery}
              onChange={handleOfflineSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddMethodDialogOpen(true)}
            >
              + Add New Method
            </Button>
          </Box>

          {/* Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex' }}>
              <Button
                onClick={() => handleOfflineFilterTabChange('all')}
                variant={offlineFilterTab === 'all' ? 'contained' : 'text'}
                sx={{ 
                  borderRadius: 0,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  mr: 1,
                  backgroundColor: offlineFilterTab === 'all' ? 'primary.main' : 'transparent',
                  color: offlineFilterTab === 'all' ? 'white' : 'inherit'
                }}
              >
                All ({offlineMethods.length})
              </Button>
              <Button
                onClick={() => handleOfflineFilterTabChange('active')}
                variant={offlineFilterTab === 'active' ? 'contained' : 'text'}
                sx={{ 
                  borderRadius: 0,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  mr: 1,
                  backgroundColor: offlineFilterTab === 'active' ? 'primary.main' : 'transparent',
                  color: offlineFilterTab === 'active' ? 'white' : 'inherit'
                }}
              >
                Active ({offlineMethods.filter(m => m.status).length})
              </Button>
              <Button
                onClick={() => handleOfflineFilterTabChange('inactive')}
                variant={offlineFilterTab === 'inactive' ? 'contained' : 'text'}
                sx={{ 
                  borderRadius: 0,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  backgroundColor: offlineFilterTab === 'inactive' ? 'primary.main' : 'transparent',
                  color: offlineFilterTab === 'inactive' ? 'white' : 'inherit'
                }}
              >
                Inactive ({offlineMethods.filter(m => !m.status).length})
              </Button>
            </Box>
          </Box>

          {/* Payment Methods Table */}
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Method Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Info</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required Info From Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredOfflineMethods().map((method, index) => (
                  <TableRow 
                    key={method.id} 
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{method.name}</TableCell>
                    <TableCell>{method.paymentInfo}</TableCell>
                    <TableCell>{method.requiredInfo}</TableCell>
                    <TableCell>
                      <Switch
                        checked={method.status}
                        onChange={() => handleToggleMethodStatus(method.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(method)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(method)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {getFilteredOfflineMethods().length === 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No payment methods found matching your criteria.
            </Alert>
          )}
        </Box>
      )}

      {/* Add Method Dialog */}
      <Dialog open={addMethodDialogOpen} onClose={() => setAddMethodDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Payment Method</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {/* Payment Method Name */}
          <TextField
            autoFocus
            margin="dense"
            label="Payment Method Name"
            placeholder="Ex: Bkash"
            fullWidth
            variant="outlined"
            value={newMethod.name}
            onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 3 }}
          />

          {/* Payment Information Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                Payment Information
              </Typography>
              <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
            
            {newMethod.paymentFields.map((field, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="Input Field Name"
                  placeholder="Ex: Bank Name"
                  value={field.fieldName}
                  onChange={(e) => handlePaymentFieldChange(index, 'fieldName', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Input Data"
                  placeholder="Ex: AVC bank"
                  value={field.inputData}
                  onChange={(e) => handlePaymentFieldChange(index, 'inputData', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => handleRemovePaymentField(index)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddPaymentField}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              + Add New Field
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Required Information From Customer Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                Required Information From Customer
              </Typography>
              <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
            
            {newMethod.customerFields.map((field, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="Input Field Name"
                  placeholder="Ex: Payment By"
                  value={field.fieldName}
                  onChange={(e) => handleCustomerFieldChange(index, 'fieldName', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Placeholder"
                  placeholder="Ex: Enter name"
                  value={field.placeholder}
                  onChange={(e) => handleCustomerFieldChange(index, 'placeholder', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                  <Checkbox
                    checked={field.isRequired}
                    onChange={(e) => handleCustomerFieldChange(index, 'isRequired', e.target.checked)}
                  />
                  <Typography variant="body2">Is Required?</Typography>
                </Box>
                <IconButton
                  onClick={() => handleRemoveCustomerField(index)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddCustomerField}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              + Add New Field
            </Button>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={newMethod.status}
                onChange={(e) => setNewMethod(prev => ({ ...prev, status: e.target.checked }))}
              />
            }
            label="Enable this payment method"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddMethodDialogOpen(false)}>Reset</Button>
          <Button onClick={handleAddMethod} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Method Dialog */}
      <Dialog open={editMethodDialogOpen} onClose={() => setEditMethodDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Payment Method</DialogTitle>
        <DialogContent>
          {selectedMethod && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Payment Method Name"
                fullWidth
                variant="outlined"
                value={selectedMethod.name}
                onChange={(e) => setSelectedMethod(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Payment Info"
                fullWidth
                variant="outlined"
                value={selectedMethod.paymentInfo}
                onChange={(e) => setSelectedMethod(prev => ({ ...prev, paymentInfo: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Required Info From Customer"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={selectedMethod.requiredInfo}
                onChange={(e) => setSelectedMethod(prev => ({ ...prev, requiredInfo: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMethod.status}
                    onChange={(e) => setSelectedMethod(prev => ({ ...prev, status: e.target.checked }))}
                  />
                }
                label="Enable this payment method"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMethodDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditMethod} variant="contained">Update Method</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedMethod?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteMethod} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PaymentMethods;
