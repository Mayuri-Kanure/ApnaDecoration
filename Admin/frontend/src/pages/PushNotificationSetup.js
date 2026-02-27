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
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const PushNotificationSetup = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [firebaseConfig, setFirebaseConfig] = useState({
    serviceAccountContent: '',
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  });
  const [messages, setMessages] = useState({
    customer: {
      orderPending: { text: 'Your order is pending and will be confirmed soon.', active: true },
      orderConfirmation: { text: 'Your order has been confirmed and is being prepared.', active: true },
      orderProcessing: { text: 'Your order is now being processed for delivery.', active: true },
      orderOutForDelivery: { text: 'Your order is out for delivery and will reach you soon.', active: true },
      orderDelivered: { text: 'Your order has been successfully delivered. Thank you for shopping with us!', active: true },
      orderReturned: { text: 'Your order return has been processed successfully.', active: true },
      orderFailed: { text: 'Your order delivery failed. Please contact support for assistance.', active: true },
      orderCanceled: { text: 'Your order has been canceled. Refund will be processed if applicable.', active: true },
      orderRefunded: { text: 'Your order refund has been processed successfully.', active: true },
      refundRequestCanceled: { text: 'Your refund request has been canceled.', active: true },
      messageFromDeliveryMan: { text: 'Delivery person has sent you a message regarding your order.', active: true },
      messageFromSeller: { text: 'Seller has sent you a message regarding your order.', active: true },
      fundAddedByAdmin: { text: 'Funds have been added to your account by the administrator.', active: true },
      messageFromAdmin: { text: 'Administrator has sent you an important message.', active: true }
    },
    vendor: {
      orderPending: { text: 'New order received! Please review and confirm.', active: true },
      orderConfirmation: { text: 'Order confirmed. Please prepare for shipment.', active: true },
      orderProcessing: { text: 'Your order is now being processed for delivery.', active: true },
      orderDelivered: { text: 'Order has been delivered successfully.', active: true },
      newOrder: { text: 'You received a new order!', active: true },
      productApproved: { text: 'Your product has been approved.', active: true },
      productRejected: { text: 'Your product has been rejected.', active: true },
      paymentReceived: { text: 'Payment received for your order.', active: true },
      messageFromAdmin: { text: 'Administrator has sent you an important message.', active: true }
    },
    deliveryMan: {
      newDeliveryTask: { text: 'New delivery task assigned to you.', active: true },
      orderPickedUp: { text: 'Order picked up successfully.', active: true },
      orderDelivered: { text: 'Order delivered successfully.', active: true },
      deliveryFailed: { text: 'Delivery failed. Please try again.', active: true },
      messageFromAdmin: { text: 'Administrator has sent you an important message.', active: true },
      messageFromCustomer: { text: 'Customer has sent you a message.', active: true }
    }
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadFirebaseConfig();
    loadPushNotificationMessages();
  }, []);

  const loadFirebaseConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin-settings/firebase`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setFirebaseConfig(response.data || {});
    } catch (error) {
      console.error('Error loading Firebase config:', error);
    }
  };

  const loadPushNotificationMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin-settings/push-messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading push notification messages:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleMessageChange = (messageKey, field) => (event) => {
    const value = field === 'active' ? event.target.checked : event.target.value;
    setMessages({
      ...messages,
      [selectedRole]: {
        ...messages[selectedRole],
        [messageKey]: {
          ...messages[selectedRole][messageKey],
          [field]: value
        }
      }
    });
  };

  const handleReset = () => {
    const defaultMessages = {
      customer: {
        orderPending: { text: 'Your order is pending and will be confirmed soon.', active: true },
        orderConfirmation: { text: 'Your order has been confirmed and is being prepared.', active: true },
        orderProcessing: { text: 'Your order is now being processed for delivery.', active: true },
        orderOutForDelivery: { text: 'Your order is out for delivery and will reach you soon.', active: true },
        orderDelivered: { text: 'Your order has been successfully delivered. Thank you for shopping with us!', active: true },
        orderReturned: { text: 'Your order return has been processed successfully.', active: true },
        orderFailed: { text: 'Your order delivery failed. Please contact support for assistance.', active: true },
        orderCanceled: { text: 'Your order has been canceled. Refund will be processed if applicable.', active: true },
        orderRefunded: { text: 'Your order refund has been processed successfully.', active: true },
        refundRequestCanceled: { text: 'Your refund request has been canceled.', active: true },
        messageFromDeliveryMan: { text: 'Delivery person has sent you a message regarding your order.', active: true },
        messageFromSeller: { text: 'Seller has sent you a message regarding your order.', active: true },
        fundAddedByAdmin: { text: 'Funds have been added to your account by the administrator.', active: true },
        messageFromAdmin: { text: 'Administrator has sent you an important message.', active: true }
      },
      vendor: {
        orderPending: { text: 'New order received! Please review and confirm.', active: true },
        orderConfirmation: { text: 'Order confirmed. Please prepare for shipment.', active: true },
        orderProcessing: { text: 'Your order is now being processed for delivery.', active: true },
        orderDelivered: { text: 'Order has been delivered successfully.', active: true },
        newOrder: { text: 'You received a new order!', active: true },
        productApproved: { text: 'Your product has been approved.', active: true },
        productRejected: { text: 'Your product has been rejected.', active: true },
        paymentReceived: { text: 'Payment received for your order.', active: true },
        messageFromAdmin: { text: 'Administrator has sent you an important message.', active: true }
      },
      deliveryMan: {
        newDeliveryTask: { text: 'New delivery task assigned to you.', active: true },
        orderPickedUp: { text: 'Order picked up successfully.', active: true },
        orderDelivered: { text: 'Order delivered successfully.', active: true },
        deliveryFailed: { text: 'Delivery failed. Please try again.', active: true },
        messageFromAdmin: { text: 'Administrator has sent you an important message.', active: true },
        messageFromCustomer: { text: 'Customer has sent you a message.', active: true }
      }
    };
    setMessages(defaultMessages);
  };

  const handleFirebaseChange = (field) => (event) => {
    setFirebaseConfig({
      ...firebaseConfig,
      [field]: event.target.value
    });
  };

  const handleFirebaseReset = () => {
    setFirebaseConfig({
      serviceAccountContent: '',
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: ''
    });
  };

  const handleFirebaseSubmit = async () => {
    // Validation
    if (!firebaseConfig.serviceAccountContent || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
      setAlert({ open: true, message: 'Please fill in all required fields: Service Account Content, API Key, and Project ID', severity: 'error' });
      return;
    }

    // Try to parse JSON
    try {
      if (firebaseConfig.serviceAccountContent) {
        JSON.parse(firebaseConfig.serviceAccountContent);
      }
    } catch (error) {
      setAlert({ open: true, message: 'Invalid JSON format in Service Account Content', severity: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/admin-settings/firebase`, 
        { firebaseConfig },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setAlert({ 
        open: true, 
        message: 'Firebase configuration saved successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving Firebase config:', error);
      setAlert({ 
        open: true, 
        message: 'Failed to save Firebase configuration', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/admin-settings/push-messages`, 
        { 
          role: selectedRole,
          messages: messages[selectedRole]
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setAlert({ 
        open: true, 
        message: 'Push notification messages saved successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving push notification messages:', error);
      setAlert({ 
        open: true, 
        message: 'Failed to save push notification messages', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowGuide = () => {
    alert('Guide: To get Firebase credentials:\n1. Go to Firebase Console\n2. Select your project\n3. Go to Project Settings\n4. Service Accounts tab\n5. Generate new private key\n6. Copy the JSON content to Service Account Content\n7. Copy other values from General tab');
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const messageFields = {
    customer: [
      { key: 'orderPending', label: 'Order Pending Message' },
      { key: 'orderConfirmation', label: 'Order Confirmation Message' },
      { key: 'orderProcessing', label: 'Order Processing Message' },
      { key: 'orderOutForDelivery', label: 'Order Out For Delivery Message' },
      { key: 'orderDelivered', label: 'Order Delivered Message' },
      { key: 'orderReturned', label: 'Order Returned Message' },
      { key: 'orderFailed', label: 'Order Failed Message' },
      { key: 'orderCanceled', label: 'Order Canceled Message' },
      { key: 'orderRefunded', label: 'Order Refunded Message' },
      { key: 'refundRequestCanceled', label: 'Refund Request/Canceled Message' },
      { key: 'messageFromDeliveryMan', label: 'Message From Delivery Man' },
      { key: 'messageFromSeller', label: 'Message From Seller' },
      { key: 'fundAddedByAdmin', label: 'Fund Added By Admin' },
      { key: 'messageFromAdmin', label: 'Message From Admin' }
    ],
    vendor: [
      { key: 'orderPending', label: 'Order Pending Message' },
      { key: 'orderConfirmation', label: 'Order Confirmation Message' },
      { key: 'orderProcessing', label: 'Order Processing Message' },
      { key: 'orderDelivered', label: 'Order Delivered Message' },
      { key: 'newOrder', label: 'New Order Message' },
      { key: 'productApproved', label: 'Product Approved Message' },
      { key: 'productRejected', label: 'Product Rejected Message' },
      { key: 'paymentReceived', label: 'Payment Received Message' },
      { key: 'messageFromAdmin', label: 'Message From Admin' }
    ],
    deliveryMan: [
      { key: 'newDeliveryTask', label: 'New Delivery Task Message' },
      { key: 'orderPickedUp', label: 'Order Picked Up Message' },
      { key: 'orderDelivered', label: 'Order Delivered Message' },
      { key: 'deliveryFailed', label: 'Delivery Failed Message' },
      { key: 'messageFromAdmin', label: 'Message From Admin' },
      { key: 'messageFromCustomer', label: 'Message From Customer' }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Push Notification Setup
      </Typography>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Push Notification" />
          <Tab label="Firebase Configuration" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              For {selectedRole === 'customer' ? 'Customer' : selectedRole === 'vendor' ? 'Vendor' : 'Delivery Man'}
            </Typography>
                        
            {/* Role Selector */}
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="role-select-label">Select Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  label="Select Role"
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="vendor">Vendor</MenuItem>
                  <MenuItem value="deliveryMan">Delivery Man</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {messageFields[selectedRole].map((field, index) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {field.label}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={messages[selectedRole][field.key].active}
                              onChange={handleMessageChange(field.key, 'active')}
                              size="small"
                            />
                          }
                          label=""
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={messages[selectedRole][field.key].text}
                        onChange={handleMessageChange(field.key, 'text')}
                        variant="outlined"
                        size="small"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: messages[selectedRole][field.key].active ? '#fff' : '#f5f5f5'
                          }
                        }}
                        disabled={!messages[selectedRole][field.key].active}
                      />
                    </Box>
                  </Grid>
                ))}

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      startIcon={<RefreshIcon />}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Submit'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Firebase Configuration
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={handleShowGuide}
              startIcon={<InfoIcon />}
              sx={{ color: '#1976d2' }}
            >
              Where To Get This Information
            </Button>
          </Box>

          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                Configure Firebase credentials to enable push notifications. Without these credentials, push notifications will NOT work.
              </Typography>

              {/* Service Account Content */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Service Account Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={firebaseConfig.serviceAccountContent}
                  onChange={handleFirebaseChange('serviceAccountContent')}
                  placeholder="Put your firebase server key here."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>

              {/* Firebase Configuration Fields */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="API Key"
                    value={firebaseConfig.apiKey}
                    onChange={handleFirebaseChange('apiKey')}
                    placeholder="AIzaSyAhMzGlR********Phf4KE9raM87"
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Auth Domain"
                    value={firebaseConfig.authDomain}
                    onChange={handleFirebaseChange('authDomain')}
                    placeholder="your-domain-2050.firebaseapp.com"
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Project ID"
                    value={firebaseConfig.projectId}
                    onChange={handleFirebaseChange('projectId')}
                    placeholder="my-app-12345"
                    variant="outlined"
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Storage Bucket"
                    value={firebaseConfig.storageBucket}
                    onChange={handleFirebaseChange('storageBucket')}
                    placeholder="****-2050.appspot.com"
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Messaging Sender ID"
                    value={firebaseConfig.messagingSenderId}
                    onChange={handleFirebaseChange('messagingSenderId')}
                    placeholder="54138740**********"
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="App ID"
                    value={firebaseConfig.appId}
                    onChange={handleFirebaseChange('appId')}
                    placeholder="1:54138740***********"
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Measurement ID"
                    value={firebaseConfig.measurementId}
                    onChange={handleFirebaseChange('measurementId')}
                    placeholder="LX3XK2M******"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleFirebaseReset}
                  startIcon={<RefreshIcon />}
                  sx={{ color: '#666', borderColor: '#ccc' }}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFirebaseSubmit}
                  startIcon={<SaveIcon />}
                  sx={{ backgroundColor: '#1976d2' }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Submit'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default PushNotificationSetup;
