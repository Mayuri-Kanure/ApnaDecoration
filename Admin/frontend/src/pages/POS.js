import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Clear as ClearIcon,
  ShoppingCart as CartIcon,
  CurrencyRupee as RupeeIcon,
  CreditCard as CardIcon,
  Pause as HoldIcon,
  PlayArrow as ResumeIcon,
  Visibility as ViewIcon,
  Inventory as ProductIcon
} from '@mui/icons-material';
import CustomerForm from '../components/CustomerForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

// Helper function to resolve image URLs
const resolveImageUrl = (path) => {
  if (!path) return null;
  // Handle Cloudinary URLs (they start with https://res.cloudinary.com)
  if (path.startsWith('https://')) return path;
  // Handle localhost URLs
  if (path.startsWith('http://')) return path;
  // Handle relative paths
  return `${API_BASE_URL}${path}`;
};

function POS() {
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('walking');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [holdOrders, setHoldOrders] = useState([]);
  const [holdOrdersDialogOpen, setHoldOrdersDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([
    { id: 'walking', name: 'Walking Customer' },
    { id: 'walking-customer-78', name: 'walking-customer-78' },
    { id: 'john', name: 'John Doe' },
    { id: 'jane', name: 'Jane Smith' }
  ]);

  // Fetch hold orders
  const fetchHoldOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/pos/hold-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHoldOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hold orders:', error);
    }
  };

  useEffect(() => {
    fetchHoldOrders();
  }, []);

  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' }
  ]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const apiCategories = response.data.categories || response.data.data || [];
        setCategories([
          { value: 'all', label: 'All Categories' },
          ...apiCategories.map(cat => ({
            value: cat._id,
            label: cat.name
          }))
        ]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep default categories if API fails
      }
    };

    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data.data || response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  };

  const calculateProductDiscount = () => {
    return 0; // 10% discount on subtotal
  };

  const calculateExtraDiscount = () => {
    return 0; // Additional discount
  };

  const calculateCouponDiscount = () => {
    return 0; // Coupon discount
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateProductDiscount() - calculateExtraDiscount() - calculateCouponDiscount()) * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateProductDiscount() - calculateExtraDiscount() - calculateCouponDiscount() + calculateTax();
  };

  const calculateChange = () => {
    if (paidAmount && !isNaN(paidAmount)) {
      return parseFloat(paidAmount) - calculateTotal();
    }
    return 0;
  };

  const clearCart = () => {
    setCart([]);
    setPaidAmount('');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!paidAmount || parseFloat(paidAmount) < calculateTotal()) {
      alert('Insufficient paid amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/pos/orders`, {
        customer: customers.find(c => c.id === selectedCustomer)?.name || 'Walking Customer',
        items: cart,
        subtotal: calculateSubtotal(),
        productDiscount: calculateProductDiscount(),
        extraDiscount: calculateExtraDiscount(),
        couponDiscount: calculateCouponDiscount(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        paidAmount: parseFloat(paidAmount),
        changeAmount: calculateChange()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert(`Order placed successfully! Order #${response.data.data.orderNumber}`);
        clearCart();
      }
    } catch (error) {
      console.error('Order error:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    }
  };

  const handleHoldOrder = async () => {
    if (cart.length === 0) {
      alert('Cannot hold empty order');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/pos/hold-orders`, {
        customer: customers.find(c => c.id === selectedCustomer)?.name || 'Walking Customer',
        items: cart,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Order held successfully!');
        clearCart();
        fetchHoldOrders();
      }
    } catch (error) {
      console.error('Hold order error:', error);
      alert(error.response?.data?.message || 'Failed to hold order');
    }
  };

  const handleResumeOrder = (holdOrder) => {
    setCart(holdOrder.items);
    setSelectedCustomer(customers.find(c => c.name === holdOrder.customer)?.id || 'walking');
    setHoldOrdersDialogOpen(false);
  };

  const handleDeleteHoldOrder = async (holdOrderId) => {
    if (!window.confirm('Delete this held order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/pos/hold-orders/${holdOrderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHoldOrders();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete order');
    }
  };

  const handleOpenHoldOrders = () => {
    setHoldOrdersDialogOpen(true);
  };

  const handleCloseHoldOrders = () => {
    setHoldOrdersDialogOpen(false);
  };

  const handleOpenCustomerForm = () => {
    setCustomerFormOpen(true);
  };

  const handleCloseCustomerForm = () => {
    setCustomerFormOpen(false);
  };

  const handleSaveCustomer = (customerData) => {
    // Generate a unique ID for the new customer
    const newCustomerId = `customer-${Date.now()}`;
    const newCustomer = {
      id: newCustomerId,
      name: `${customerData.firstName} ${customerData.lastName}`,
      ...customerData
    };
    
    // Add to customers list
    setCustomers(prev => [...prev, newCustomer]);
    
    // Select the new customer
    setSelectedCustomer(newCustomerId);
    
    // Close the form
    setCustomerFormOpen(false);
    
    // Show success message
    alert(`Customer "${newCustomer.name}" added successfully!`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Point of Sale (POS)
      </Typography>

      <Grid container spacing={3}>
        {/* Left Panel - Product Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 600 }}>
            {/* Category Filter and Search */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>All categories</InputLabel>
                <Select
                  value={selectedCategory}
                  label="All categories"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search by name or sku"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            {/* Product Grid */}
            <Grid container spacing={2}>
              {paginatedProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => addToCart(product)}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          mb: 1,
                          mx: 'auto',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {product.thumbnail ? (
                          <img
                            src={resolveImageUrl(product.thumbnail)}
                            alt={product.product_name_en}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 8
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: '#f3f4f6',
                            borderRadius: 2,
                            display: product.thumbnail ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ProductIcon sx={{ fontSize: 30, color: '#9ca3af' }} />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        ₹{(product.price || 0).toFixed(2)}
                      </Typography>
                      <Chip
                        label={`${product.stock_qty || 0} Pcs`}
                        size="small"
                        color={(product.stock_qty || 0) > 100 ? 'success' : (product.stock_qty || 0) > 50 ? 'warning' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setCurrentPage(index + 1)}
                  sx={{ minWidth: 40 }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Billing Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 600 }}>
            {/* Hold Orders Button */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Badge badgeContent={holdOrders.length} color="error">
                  <CartIcon />
                </Badge>}
                sx={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={handleOpenHoldOrders}
              >
                View All Hold Orders
              </Button>
            </Box>

            {/* Customer Management */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Customer
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <Select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  sx={{ flex: 1 }}
                  onClick={handleOpenCustomerForm}
                >
                  Add New Customer
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Cart Actions */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearCart}
                sx={{ flex: 1 }}
              >
                Clear Cart
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CartIcon />}
                sx={{ flex: 1 }}
              >
                New Order
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="warning"
                startIcon={<HoldIcon />}
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
                sx={{ flex: 1 }}
              >
                Hold Order
              </Button>
            </Box>

            {/* Cart Table */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Cart ({cart.length} items)
              </Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Cart is empty
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map(item => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{(item.price || 0).toFixed(2)} each
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ₹{((item.price || 0) * item.quantity).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => removeFromCart(item._id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Bill Summary */}
<Box sx={{ mb: 3 }}>
  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
    Bill Summary
  </Typography>

  {/* Subtotal */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">Subtotal:</Typography>
    <Typography variant="body2">₹{calculateSubtotal().toFixed(2)}</Typography>
  </Box>

  {/* Product Discount */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">Product Discount:</Typography>
    <Typography variant="body2" color="success.main">-₹0.00</Typography>
  </Box>

  {/* Extra Discount */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">Extra Discount:</Typography>
    <Typography variant="body2" color="success.main">-₹0.00</Typography>
  </Box>

  {/* Coupon Discount */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">Coupon Discount:</Typography>
    <Typography variant="body2" color="success.main">-₹0.00</Typography>
  </Box>

  {/* Tax */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">Tax (8%):</Typography>
    <Typography variant="body2">₹{calculateTax().toFixed(2)}</Typography>
  </Box>

  <Divider sx={{ my: 1 }} />

  {/* Total */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
      Total:
    </Typography>
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
      ₹{calculateTotal().toFixed(2)}
    </Typography>
  </Box>
</Box>


            {/* Payment Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Payment
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Paid By</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Paid By"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                label="Paid Amount"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                InputProps={{
                  startAdornment: <RupeeIcon sx={{ mr: 1, fontSize: 20, color: 'action.active' }} />
                }}
              />
              {paidAmount && !isNaN(paidAmount) && calculateChange() >= 0 && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    Change: ₹{calculateChange().toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Order Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                size="large"
                sx={{ flex: 1 }}
                onClick={clearCart}
              >
                Cancel Order
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="large"
                sx={{ flex: 1 }}
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
              >
                Hold Order
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ flex: 1 }}
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
              >
                Place Order
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Customer Form Dialog */}
      <CustomerForm
        open={customerFormOpen}
        onClose={handleCloseCustomerForm}
        onSave={handleSaveCustomer}
      />

      {/* Hold Orders Dialog */}
      <Dialog
        open={holdOrdersDialogOpen}
        onClose={handleCloseHoldOrders}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CartIcon color="primary" />
            <Typography variant="h6">Hold Orders ({holdOrders.length})</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {holdOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No hold orders found
              </Typography>
            </Box>
          ) : (
            <List>
              {holdOrders.map((holdOrder) => (
                <ListItem key={holdOrder._id} divider>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {holdOrder.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Customer: {holdOrder.customer}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(holdOrder.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          ₹{holdOrder.total.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {holdOrder.items.length} items
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ResumeIcon />}
                        onClick={() => handleResumeOrder(holdOrder)}
                      >
                        Resume
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteHoldOrder(holdOrder._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHoldOrders}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default POS;
