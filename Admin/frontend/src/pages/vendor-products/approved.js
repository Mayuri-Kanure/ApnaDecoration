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
  IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const ApprovedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedProducts();
  }, []);

  const fetchApprovedProducts = async () => {
    console.log('🚀 fetchApprovedProducts called!');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vendor-products/status/approved`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Approved products response:', data);
      console.log('Products array length:', data.products?.length);
      
      if (data.products && data.products.length > 0) {
        console.log('First product sample:', data.products[0]);
        console.log('First product vendorId:', data.products[0].vendorId);
      }
      
      setProducts(data.products || data.vendorProducts || []);
    } catch (error) {
      console.error('Error fetching approved products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (productId) => {
    try {
      // API call to toggle featured status
      console.log('Toggling featured status for product:', productId);
      // Refresh the list
      fetchApprovedProducts();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Approved Vendor Products
      </Typography>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No approved vendor products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No vendor products have been approved yet
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Approved</TableCell>
                    <TableCell>Featured</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => {
                    console.log('🔍 Approved Product:', product);
                    console.log('🔍 Product vendorId:', product.vendorId);
                    console.log('🔍 Product vendorId type:', typeof product.vendorId);
                    console.log('🔍 Product vendorId keys:', product.vendorId ? Object.keys(product.vendorId) : 'undefined');
                    console.log('🔍 Product vendorId.name:', product.vendorId?.name);
                    console.log('🔍 Product vendorId.name type:', typeof product.vendorId?.name);
                    
                    return (
                      <TableRow key={product._id || product.id} hover>
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
                            
                            const imageUrl = resolveImageUrl(product.images?.[0] || product.thumbnail);
                            
                            return imageUrl ? (
                              <Box
                                component="img"
                                src={imageUrl}
                                sx={{ width: 50, height: 50, borderRadius: 1 }}
                                onError={(e) => {
                                  console.error('❌ Approved Products - Image failed:', imageUrl);
                                  e.target.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('✅ Approved Products - Image loaded:', imageUrl);
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
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.sku}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const vendorName = product.vendorId?.name || 'Unknown Vendor';
                          console.log('🔍 Rendering vendor name for product:', product.name, '->', vendorName);
                          // Test with hardcoded value
                          return 'TEST: ' + vendorName;
                        })()}
                      </TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{new Date(product.approvedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color={product.isFeatured ? 'warning' : 'default'}
                          onClick={() => handleToggleFeatured(product.id)}
                        >
                          {product.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApprovedProducts;
