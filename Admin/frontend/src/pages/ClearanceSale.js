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
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Chip,
  Tab,
  Tabs,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  PriorityHigh as PriorityIcon,
  Sort as SortIcon,
  Settings as SettingsIcon,
  DragIndicator as DragIndicatorIcon,
  ShoppingBasket as ProductIcon
} from '@mui/icons-material';

const ClearanceSale = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clearanceData, setClearanceData] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeOffer, setActiveOffer] = useState(false);
  const [defaultSorting, setDefaultSorting] = useState(true);
  const [customSorting, setCustomSorting] = useState(false);
  const [defaultSortBy, setDefaultSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [itemsPerPage, setItemsPerPage] = useState('12');
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [vendorOffers, setVendorOffers] = useState([]);

  const [formData, setFormData] = useState({
    discountType: 'flat',
    discountAmount: '0',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    offerActiveTime: 'always',
    showInHomePage: false,
    applicableProducts: [],
    description: ''
  });

  const [vendorFormData, setVendorFormData] = useState({
    vendorId: '',
    vendorName: '',
    discountType: 'flat',
    discountAmount: '0',
    startDate: '',
    endDate: '',
    applicableProducts: [],
    description: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

  // Fetch products data
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/clearance-sale/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: 'Error fetching products', severity: 'error' });
    }
  };

  // Fetch vendors data
  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/clearance-sale/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setSnackbar({ open: true, message: 'Error fetching vendors', severity: 'error' });
    }
  };

  // Fetch all data
  const fetchClearanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/clearance-sale`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClearanceData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clearance data:', error);
      setSnackbar({ open: true, message: 'Error loading clearance data', severity: 'error' });
      setLoading(false);
    }
  };

  // Fetch vendors and products
  const fetchFormData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [vendorsResponse, productsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/clearance-sale/vendors`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/clearance-sale/products`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setVendors(vendorsResponse.data.data);
      setProducts(productsResponse.data.data);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  useEffect(() => {
    fetchClearanceData();
    fetchProducts();
    fetchVendors();
  }, []);

  // Update form data when clearance data changes
  useEffect(() => {
    if (clearanceData?.inhouseOffer) {
      setFormData({
        discountType: clearanceData.inhouseOffer.discountType,
        discountAmount: clearanceData.inhouseOffer.discountAmount.toString(),
        startDate: clearanceData.inhouseOffer.startDate ? new Date(clearanceData.inhouseOffer.startDate).toISOString().split('T')[0] : '',
        endDate: clearanceData.inhouseOffer.endDate ? new Date(clearanceData.inhouseOffer.endDate).toISOString().split('T')[0] : '',
        applicableProducts: clearanceData.inhouseOffer.applicableProducts || [],
        description: clearanceData.inhouseOffer.description || ''
      });
      setActiveOffer(clearanceData.inhouseOffer.isActive);
      
      // Update selectedProducts with full product objects from backend
      const backendProducts = clearanceData.inhouseOffer.applicableProducts || [];
      if (backendProducts.length > 0) {
        // If backend has product IDs, fetch full product objects
        const fullProducts = backendProducts.map(product => {
          if (typeof product === 'string') {
            // It's an ID, find in our products list
            const foundProduct = products.find(p => p._id === product);
            return foundProduct || { _id: product, displayName: 'Unknown Product', name: 'Unknown Product', price: 0 };
          } else {
            // It's already a product object, but might be missing fields
            // Find the complete product from our products list to get all fields including images
            const completeProduct = products.find(p => p._id === product._id);
            return completeProduct || product;
          }
        });
        setSelectedProducts(fullProducts);
      } else {
        setSelectedProducts([]);
      }
    }
    
    // Update vendor offers from backend
    if (clearanceData?.vendorOffers) {
      setVendorOffers(clearanceData.vendorOffers);
    }
    
    // Update sorting state
    if (clearanceData?.prioritySettings) {
      setDefaultSorting(clearanceData.prioritySettings.useDefaultSorting);
      setCustomSorting(clearanceData.prioritySettings.useCustomSorting);
      setDefaultSortBy(clearanceData.prioritySettings.defaultSortBy || 'createdAt');
      setSortOrder(clearanceData.prioritySettings.sortOrder || 'desc');
      setItemsPerPage(clearanceData.prioritySettings.itemsPerPage || '12');
    }
  }, [clearanceData, products]);
  // Update inhouse offer
  const handleUpdateInhouseOffer = async () => {
    try {
      const token = localStorage.getItem('token');
      const inhouseOfferData = {
        isActive: activeOffer,
        discountType: formData.discountType,
        discountAmount: parseFloat(formData.discountAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        applicableProducts: formData.applicableProducts,
        description: formData.description
      };

      const response = await axios.put(`${API_BASE_URL}/clearance-sale/inhouse-offer`, inhouseOfferData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClearanceData(prev => ({
        ...prev,
        inhouseOffer: response.data.data
      }));

      setSnackbar({ open: true, message: 'Inhouse offer updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating inhouse offer:', error);
      setSnackbar({ open: true, message: 'Error updating inhouse offer', severity: 'error' });
    }
  };

  // Handle active offer toggle with confirmation
  const handleActiveOfferToggle = async (checked) => {
    const action = checked ? 'activate' : 'deactivate';
    const confirmMessage = `Are you sure you want to ${action} the clearance sale offer?`;
    
    if (!window.confirm(confirmMessage)) {
      return; // User cancelled
    }

    try {
      const token = localStorage.getItem('token');
      const inhouseOfferData = {
        isActive: checked,
        discountType: formData.discountType,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        applicableProducts: formData.applicableProducts,
        description: formData.description
      };

      const response = await axios.put(`${API_BASE_URL}/clearance-sale/inhouse-offer`, inhouseOfferData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setActiveOffer(checked);
      
      // Update clearance data
      setClearanceData(prev => ({
        ...prev,
        inhouseOffer: response.data.data
      }));

      // Show success message
      setSnackbar({ 
        open: true, 
        message: `Clearance sale offer ${checked ? 'activated' : 'deactivated'} successfully!`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating inhouse offer:', error);
      setSnackbar({ 
        open: true, 
        message: `Error ${checked ? 'activating' : 'deactivating'} offer: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleReset = () => {
    setFormData({
      discountType: 'flat',
      discountAmount: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      offerActiveTime: 'always',
      showInHomePage: false,
      applicableProducts: [],
      description: ''
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const inhouseOfferData = {
        isActive: activeOffer,
        discountType: formData.discountType,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        applicableProducts: selectedProducts, // Use selectedProducts directly
        description: formData.description
      };

      const response = await axios.put(`${API_BASE_URL}/clearance-sale/inhouse-offer`, inhouseOfferData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClearanceData(prev => ({
        ...prev,
        inhouseOffer: response.data.data
      }));

      // Update selectedProducts to match what was saved
      setSelectedProducts(selectedProducts);

      setSnackbar({ 
        open: true, 
        message: 'Inhouse offer configuration saved successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving inhouse offer:', error);
      setSnackbar({ 
        open: true, 
        message: `Error saving configuration: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  // Vendor offer management functions
  const handleAddVendorOffer = () => {
    setVendorDialogOpen(true);
  };

  const handleSaveVendorOffer = async () => {
    try {
      const token = localStorage.getItem('token');
      const vendorOfferData = {
        vendorId: vendorFormData.vendorId,
        vendorName: vendorFormData.vendorName,
        discountType: vendorFormData.discountType,
        discountAmount: parseFloat(vendorFormData.discountAmount) || 0,
        startDate: vendorFormData.startDate,
        endDate: vendorFormData.endDate,
        applicableProducts: vendorFormData.applicableProducts,
        description: vendorFormData.description
      };

      const response = await axios.post(`${API_BASE_URL}/clearance-sale/vendor-offers`, vendorOfferData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVendorOffers([...vendorOffers, response.data.data]);
      setVendorDialogOpen(false);
      setVendorFormData({
        vendorId: '',
        vendorName: '',
        discountType: 'flat',
        discountAmount: '0',
        startDate: '',
        endDate: '',
        applicableProducts: [],
        description: ''
      });

      setSnackbar({ 
        open: true, 
        message: 'Vendor offer added successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving vendor offer:', error);
      setSnackbar({ 
        open: true, 
        message: `Error saving vendor offer: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to remove this vendor offer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/clearance-sale/vendor-offers/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVendorOffers(vendorOffers.filter(offer => offer.vendorId !== vendorId));
      setSnackbar({ 
        open: true, 
        message: 'Vendor offer removed successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error deleting vendor offer:', error);
      setSnackbar({ 
        open: true, 
        message: `Error removing vendor offer: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleAddProduct = () => {
    setProductDialogOpen(true);
  };

  const handleProductSelect = (product) => {
    const isSelected = selectedProducts.some(p => p._id === product._id);
    
    if (isSelected) {
      // Remove product
      setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
    } else {
      // Add product
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleSaveSelectedProducts = () => {
    // Update form data with selected products
    setFormData(prev => ({
      ...prev,
      applicableProducts: selectedProducts
    }));
    
    // Auto-save to backend
    handleSave();
    
    setProductDialogOpen(false);
    setSnackbar({ 
      open: true, 
      message: `${selectedProducts.length} product(s) added to clearance sale!`, 
      severity: 'success' 
    });
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
    setFormData(prev => ({
      ...prev,
      applicableProducts: selectedProducts.filter(p => p._id !== productId)
    }));
    // Auto-save after removing
    handleSave();
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleDefaultSortingChange = (checked) => {
    setDefaultSorting(checked);
    if (checked) {
      setCustomSorting(false);
    }
  };

  const handleCustomSortingChange = (checked) => {
    setCustomSorting(checked);
    if (checked) {
      setDefaultSorting(false);
    }
  };

  const handleResetPriorityOrder = () => {
    // Reset to default priority order
    setDefaultSorting(true);
    setCustomSorting(false);
    setDefaultSortBy('createdAt');
    setSortOrder('desc');
    setItemsPerPage('12');
    
    setSnackbar({ 
      open: true, 
      message: 'Priority settings reset to default!', 
      severity: 'info' 
    });
  };

  const handleSavePrioritySetup = async () => {
    try {
      const token = localStorage.getItem('token');
      const prioritySettingsData = {
        useDefaultSorting: defaultSorting,
        useCustomSorting: customSorting,
        defaultSortBy: defaultSortBy,
        sortOrder: sortOrder,
        itemsPerPage: itemsPerPage,
        customSortOrder: []
      };

      const response = await axios.put(`${API_BASE_URL}/clearance-sale/priority-settings`, prioritySettingsData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClearanceData(prev => ({
        ...prev,
        prioritySettings: response.data.data
      }));

      setSnackbar({ 
        open: true, 
        message: 'Priority settings saved successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving priority settings:', error);
      setSnackbar({ 
        open: true, 
        message: `Error saving priority settings: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Clearance Sale
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Manage Inhouse Offer" />
          <Tab label="Vendor Offers" />
          <Tab label="Priority setup" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Active Offer Toggle */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Active clearance sale offer?
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Switch
                    checked={clearanceData?.inhouseOffer?.isActive ?? false}
                    onChange={(e) => handleActiveOfferToggle(e.target.checked)}
                    color="primary"
                  />
                  <Typography variant="body1" sx={{ fontWeight: 500, color: clearanceData?.inhouseOffer?.isActive ? 'success.main' : 'text.secondary' }}>
                    {clearanceData?.inhouseOffer?.isActive ? 'Active Offer' : 'Inactive'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Offer Configuration */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Inhouse Offer Configuration
              </Typography>
              
              <Grid container spacing={3}>
                {/* Discount Type */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Discount Type
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={formData.discountType || 'flat'}
                      onChange={handleInputChange('discountType')}
                    >
                      <FormControlLabel
                        value="flat"
                        control={<Radio />}
                        label="Flat Discount"
                      />
                      <FormControlLabel
                        value="product"
                        control={<Radio />}
                        label="Product Wise Discount"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* Discount Amount */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Discount Amount (%)"
                    value={formData.discountAmount}
                    onChange={handleInputChange('discountAmount')}
                    type="number"
                    InputProps={{
                      inputProps: { min: 0, max: 100 }
                    }}
                  />
                </Grid>

                {/* Duration */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Duration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange('startDate')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Start Time"
                        type="time"
                        value={formData.startTime}
                        onChange={handleInputChange('startTime')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="End Date"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange('endDate')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="End Time"
                        type="time"
                        value={formData.endTime}
                        onChange={handleInputChange('endTime')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Offer Active Time */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Offer Active Time
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={formData.offerActiveTime}
                      onChange={handleInputChange('offerActiveTime')}
                    >
                      <FormControlLabel
                        value="always"
                        control={<Radio />}
                        label="Always"
                      />
                      <FormControlLabel
                        value="specific"
                        control={<Radio />}
                        label="Specific Time In a Day"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* Show in Home Page */}
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.showInHomePage}
                        onChange={handleInputChange('showInHomePage')}
                      />
                    }
                    label="Also Show in Home Page"
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      startIcon={<RefreshIcon />}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Product List */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Product List
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                >
                  Add Product
                </Button>
              </Box>

              {selectedProducts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ProductIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                    No products selected
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                    Click "Add Product" to select items for the clearance sale
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Debug: selectedProducts.length = {selectedProducts.length}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddProduct}
                  >
                    Add Product
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell>SL</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Original Price</TableCell>
                        <TableCell>Discounted Price</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProducts.map((product, index) => (
                        <TableRow key={`product-${product._id}-${index}`} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={product.thumbnail || product.images?.[0] || product.image}
                                alt={product.displayName || product.name || 'Product'}
                                sx={{ width: 40, height: 40 }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '';
                                }}
                              >
                                {(product.displayName || product.name || 'P')?.charAt(0)?.toUpperCase() || 'P'}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {product.displayName || product.name || 'Unknown Product'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{product.sku || 'N/A'}</TableCell>
                          <TableCell>₹{product.price || 0}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              ₹{formData.discountType === 'flat'
                                ? Math.max(0, (product.price || 0) - (formData.discountAmount || 0))
                                : Math.max(0, (product.price || 0) * (1 - (formData.discountAmount || 0) / 100))
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" color="primary">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveProduct(product._id)}
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
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 1 && (
        <>
          {/* Add Vendor Offer Button */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Vendor Offers Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddVendorOffer}
                  sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
                >
                  Add Vendor Offer
                </Button>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                Add vendor-specific clearance offers to include their products in the sale
              </Typography>
            </CardContent>
          </Card>

          {/* Vendor Offers List */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Active Vendor Offers
              </Typography>
              
              {vendorOffers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <FolderIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                    No vendor offers added
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                    Add vendor offers to include their products in clearance sale
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddVendorOffer}
                  >
                    Add Vendor Offer
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell>SL</TableCell>
                        <TableCell>Vendor Name</TableCell>
                        <TableCell>Discount Type</TableCell>
                        <TableCell>Discount Amount</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vendorOffers.map((offer, index) => (
                        <TableRow key={offer.vendorId} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {offer.vendorName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={offer.discountType}
                              size="small"
                              color={offer.discountType === 'flat' ? 'primary' : 'secondary'}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {offer.discountAmount}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Active"
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
                              <IconButton size="small" color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteVendor(offer.vendorId)}
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
              )}
            </CardContent>
          </Card>

          {/* Available Vendors */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Available Vendors
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search Vendors"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ width: 300 }}
                />
              </Box>

              {/* Vendor List */}
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell>SL</TableCell>
                      <TableCell>Vendor Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <FolderIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                              No vendors available
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#999' }}>
                              Vendors will appear here once they register
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendors.map((vendor, index) => (
                        <TableRow key={vendor._id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{vendor.name || vendor.vendorName}</TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>{vendor.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={vendor.status || 'Active'}
                              size="small"
                              color={vendor.status === 'Active' ? 'success' : 'default'}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" color="info">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteVendor(vendor._id)}
                              >
                                <DeleteIcon fontSize="sm" />
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

          {/* Vendor Offer Dialog */}
          <Dialog open={vendorDialogOpen} onClose={() => setVendorDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add Vendor Offer</DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Vendor</InputLabel>
                    <Select
                      value={vendorFormData.vendorId}
                      onChange={(e) => {
                        const selectedVendor = vendors.find(v => v._id === e.target.value);
                        setVendorFormData({
                          ...vendorFormData,
                          vendorId: e.target.value,
                          vendorName: selectedVendor?.name || selectedVendor?.vendorName || ''
                        });
                      }}
                      label="Select Vendor"
                    >
                      {vendors.map((vendor) => (
                        <MenuItem key={vendor._id} value={vendor._id}>
                          {vendor.name || vendor.vendorName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Discount Amount (%)"
                    type="number"
                    value={vendorFormData.discountAmount}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, discountAmount: e.target.value })}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={vendorFormData.startDate}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={vendorFormData.endDate}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={vendorFormData.description}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setVendorDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveVendorOffer} variant="contained">Save Offer</Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {activeTab === 2 && (
        <>
          {/* Priority Settings Cards */}
          <Grid container spacing={3}>
            {/* Display Priority Settings */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <PriorityIcon sx={{ mr: 1, color: '#1976d2' }} />
                    Display Priority Settings
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Clearance Sale Display Order
                    </Typography>
                    
                    <List sx={{ backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <ListItem sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <ListItemIcon>
                          <DragIndicatorIcon sx={{ color: '#666' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Inhouse Offers" 
                          secondary="Your own products and services"
                        />
                        <Chip label="Priority 1" size="small" color="primary" />
                      </ListItem>
                      <ListItem sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <ListItemIcon>
                          <DragIndicatorIcon sx={{ color: '#666' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Vendor Offers" 
                          secondary="Partner vendor products"
                        />
                        <Chip label="Priority 2" size="small" color="secondary" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <DragIndicatorIcon sx={{ color: '#666' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Featured Products" 
                          secondary="Highlighted clearance items"
                        />
                        <Chip label="Priority 3" size="small" color="default" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Drag to reorder display priority
                    </Typography>
                    <Button variant="outlined" size="small" onClick={handleResetPriorityOrder}>
                      Reset Order
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sorting Options */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <SortIcon sx={{ mr: 1, color: '#1976d2' }} />
                    Sorting Options
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            Use Default Sorting
                          </Typography>
                          <Switch
                            checked={defaultSorting}
                            onChange={(e) => handleDefaultSortingChange(e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.4 }}>
                          Sort by latest added products first
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            Use Custom Sorting
                          </Typography>
                          <Switch
                            checked={customSorting}
                            onChange={(e) => handleCustomSortingChange(e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.4 }}>
                          Sort by custom criteria (price, name, discount)
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Advanced Settings */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 1, color: '#1976d2' }} />
                    Advanced Priority Settings
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Default Sort By</InputLabel>
                        <Select
                          value={defaultSortBy}
                          label="Default Sort By"
                          size="small"
                          onChange={(e) => setDefaultSortBy(e.target.value)}
                        >
                          <MenuItem value="createdAt">Date Added</MenuItem>
                          <MenuItem value="name">Product Name</MenuItem>
                          <MenuItem value="price">Price</MenuItem>
                          <MenuItem value="discountAmount">Discount Amount</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Sort Order</InputLabel>
                        <Select
                          value={sortOrder}
                          label="Sort Order"
                          size="small"
                          onChange={(e) => setSortOrder(e.target.value)}
                        >
                          <MenuItem value="desc">Descending</MenuItem>
                          <MenuItem value="asc">Ascending</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Items Per Page</InputLabel>
                        <Select
                          value={itemsPerPage}
                          label="Items Per Page"
                          size="small"
                          onChange={(e) => setItemsPerPage(e.target.value)}
                        >
                          <MenuItem value="6">6 Items</MenuItem>
                          <MenuItem value="12">12 Items</MenuItem>
                          <MenuItem value="24">24 Items</MenuItem>
                          <MenuItem value="48">48 Items</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Priority Configuration
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Configure how clearance sale items are displayed and sorted
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" size="large">
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSavePrioritySetup}
                        sx={{ px: 4, py: 1.5 }}
                      >
                        Save Priority Settings
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Product Selection Dialog */}
      <Dialog 
        open={productDialogOpen} 
        onClose={() => setProductDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Products for Clearance Sale</DialogTitle>
        <DialogContent>
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {products.map((product) => {
              const isSelected = selectedProducts.some(p => p._id === product._id);
              return (
                <ListItem 
                  key={product._id}
                  button
                  onClick={() => handleProductSelect(product)}
                  selected={isSelected}
                >
                  <ListItemIcon>
                    <Avatar 
                      src={product.thumbnail || product.image}
                      alt={product.displayName || product.name || 'Product'}
                      sx={{ width: 40, height: 40 }}
                    >
                      {(product.displayName || product.name || 'P')?.charAt(0)?.toUpperCase() || 'P'}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {product.displayName || product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {product.type === 'product' && '📦 Product'}
                          {product.type === 'service' && '🛠️ Service'}
                          {product.type === 'vendor_product' && '🏪 Vendor Product'}
                        </Typography>
                      </Box>
                    }
                    secondary={`Price: ₹${product.price || 0} | SKU: ${product.sku || 'N/A'} | ${(product.type || '').replace('_', ' ').toUpperCase() || 'UNKNOWN'}`}
                  />
                  <Checkbox 
                    checked={isSelected}
                    color="primary"
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSelectedProducts}
            variant="contained"
            color="primary"
          >
            Save {selectedProducts.length} Product(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClearanceSale;
