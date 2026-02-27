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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Check as ApproveIcon,
  Close as RejectIcon
} from '@mui/icons-material';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const NewProductsRequests = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch pending vendor products
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/vendor-products/status/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Pending products response:', data);
        
        if (data.success && data.products) {
          // Transform products data for display
          const transformedProducts = data.products.map(product => ({
            id: product._id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            description: product.description,
            vendorName: `Vendor ${product.vendorId}`, // You might want to fetch vendor details
            vendorId: product.vendorId,
            image: product.images && product.images.length > 0 
  ? (
      // Handle Cloudinary URLs (they start with https://res.cloudinary.com)
      product.images[0].startsWith('https://')
        ? product.images[0]
        // Handle full HTTP URLs
        : product.images[0].startsWith('http://')
          ? product.images[0]
          // Handle relative paths
          : `${API_BASE_URL}/uploads/vendor-products/${product.images[0].replace(/^.*[/\\]/, '')}`
    ) 
  : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8cGF0aCBkPSJNMjUgMTVDMjUuNTUyMyAxNSAyNiAxNS40NDc3IDI2IDE2VjI0SDM0QzM0LjU1MjMgMjQgMzUgMjQuNDQ3NyAzNSAyNUMzNSAyNS41NTIzIDM0LjU1MjMgMjYgMzQgMjZIMjZW MzRDMjYgMzQuNTUyMyAyNS41NTIzIDM1IDI1IDM1QzI0LjQ0NzcgMzUgMjQgMzQuNTUyMyAyNCAzNFYyNkgxNkMxNS40NDc3IDI2IDE1IDI1LjU1MjMgMTUgMjVDMTUgMjQuNDQ3NyAxNS40NDc3IDI0IDE2IDI0SDI0VjE2QzI0IDE1LjQ0NzcgMjQuNDQ3NyAxNSAyNSAxNVoiIGZpbGw9IiM5Y2EzYWYiLz4KICA8Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSI4IiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K',
            createdAt: product.createdAt,
            status: product.status
          }));
          
          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch pending products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching pending products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const handleApprove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/vendor-products/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Product approved:', data);
        alert('Product approved successfully!');
        // Refresh the list
        fetchPendingProducts();
      } else {
        console.error('Failed to approve product:', response.status);
        alert('Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Error approving product');
    }
  };

  const handleReject = async (productId) => {
    try {
      const reason = prompt('Please enter rejection reason (optional):');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/vendor-products/${productId}/deny`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Rejected by admin' })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Product rejected:', data);
        alert('Product rejected successfully!');
        // Refresh the list
        fetchPendingProducts();
      } else {
        console.error('Failed to reject product:', response.status);
        alert('Failed to reject product');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Error rejecting product');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        New Product Requests
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
                No pending product requests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All vendor products have been reviewed
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
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            component="img"
                            src={product.image || '/placeholder.png'}
                            sx={{ width: 50, height: 50, borderRadius: 1 }}
                          />
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
                      <TableCell>{product.vendorName}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleViewDetails(product)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleApprove(product.id)}
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleReject(product.id)}
                        >
                          <RejectIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedProduct.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                SKU: {selectedProduct.sku}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Price: ₹{selectedProduct.price}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Vendor: {selectedProduct.vendorName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Description: {selectedProduct.description}
              </Typography>
              <Chip label="Pending" color="warning" size="small" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewProductsRequests;
