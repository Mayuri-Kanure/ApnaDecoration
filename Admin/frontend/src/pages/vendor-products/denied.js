import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ArrowBack as ReconsiderIcon
} from '@mui/icons-material';

const DeniedProducts = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const fetchDeniedProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${API_BASE_URL}/vendor-products/status/denied`;
      console.log('🔍 Fetching denied products from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Denied products data:', data);
      setProducts(data.data || data.products || []);
    } catch (error) {
      console.error('❌ Error fetching denied products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeniedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleReconsider = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/vendor-products/${productId}/reconsider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Product sent for reconsideration successfully!');
        fetchDeniedProducts(); // Refresh the list
      } else {
        alert('Failed to send product for reconsideration');
      }
    } catch (error) {
      console.error('Error reconsidering product:', error);
      alert('Error sending product for reconsideration');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading denied products...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#374151' }}>
          Denied Vendor Products
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDeniedProducts}
          sx={{ borderColor: '#d1d5db', color: '#6b7280' }}
        >
          Refresh
        </Button>
      </Box>

      {products.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              No denied products found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Products that have been rejected will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {(() => {
                        const resolveImageUrl = (path) => {
                          if (!path) return null;
                          // Handle Cloudinary URLs (they start with https://res.cloudinary.com)
                          if (path.startsWith('https://')) return path;
                          // Handle full HTTP URLs
                          if (path.startsWith('http://')) return path;
                          // Handle relative paths
                          return `${API_BASE_URL}${path}`;
                        };
                        
                        const imageUrl = resolveImageUrl(product.images?.[0] || product.thumbnail || product.image);
                        
                        return imageUrl ? (
                          <Box
                            component="img"
                            src={imageUrl}
                            sx={{ width: 50, height: 50, borderRadius: 1 }}
                            onError={(e) => {
                              console.error('❌ Denied Products - Image failed:', imageUrl);
                              e.target.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('✅ Denied Products - Image loaded:', imageUrl);
                            }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src="/placeholder.png"
                            sx={{ width: 50, height: 50, borderRadius: 1 }}
                          />
                        );
                      })()}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {product.name || product.product_name_en}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.sku || product.product_sku || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {(() => {
                        const vendor = product.vendorId;
                        if (!vendor) return 'Unknown Vendor';
                        
                        // Try different name fields in order of preference
                        if (vendor.name) return vendor.name;
                        if (vendor.firstName && vendor.lastName) return `${vendor.firstName} ${vendor.lastName}`;
                        if (vendor.firstName) return vendor.firstName;
                        if (vendor.username) return vendor.username;
                        if (vendor.email) return vendor.email;
                        
                        return 'Unknown Vendor';
                      })()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {product.category?.name || product.category_name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{product.price || product.unit_price || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Denied"
                      color="error"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(product)}
                        sx={{ color: '#3b82f6' }}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleReconsider(product._id)}
                        sx={{ color: '#10b981' }}
                        title="Send for Reconsideration"
                      >
                        <ReconsiderIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Product Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                {(() => {
                  const resolveImageUrl = (path) => {
                    if (!path) return null;
                    if (path.startsWith('https://')) return path;
                    if (path.startsWith('http://')) return path;
                    return `${API_BASE_URL}${path}`;
                  };
                  
                  const imageUrl = resolveImageUrl(selectedProduct.images?.[0] || selectedProduct.thumbnail || selectedProduct.image);
                  
                  return imageUrl ? (
                    <Box
                      component="img"
                      src={imageUrl}
                      sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('❌ Dialog - Image failed:', imageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src="/placeholder.png"
                      sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover' }}
                    />
                  );
                })()}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {selectedProduct.name || selectedProduct.product_name_en}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    SKU: {selectedProduct.sku || selectedProduct.product_sku || 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    ₹{selectedProduct.price || selectedProduct.unit_price || 0}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Description:</strong> {selectedProduct.description || selectedProduct.description_en || 'No description available'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Category:</strong> {selectedProduct.category?.name || selectedProduct.category_name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Vendor:</strong> {(() => {
                  const vendor = selectedProduct.vendorId;
                  if (!vendor) return 'Unknown Vendor';
                  
                  // Try different name fields in order of preference
                  if (vendor.name) return vendor.name;
                  if (vendor.firstName && vendor.lastName) return `${vendor.firstName} ${vendor.lastName}`;
                  if (vendor.firstName) return vendor.firstName;
                  if (vendor.username) return vendor.username;
                  if (vendor.email) return vendor.email;
                  
                  return 'Unknown Vendor';
                })()}
              </Typography>
              {selectedProduct.rejection_reason && (
                <Typography variant="body2" sx={{ mb: 1, color: '#ef4444' }}>
                  <strong>Rejection Reason:</strong> {selectedProduct.rejection_reason}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeniedProducts;
