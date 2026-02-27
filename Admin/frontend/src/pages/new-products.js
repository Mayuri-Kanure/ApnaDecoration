import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  NewReleases as NewIcon,
  TrendingUp as TrendingIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const NewProducts = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or table

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Food & Beverage', label: 'Food & Beverage' },
    { value: 'Clothing', label: 'Clothing' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  useEffect(() => {
    fetchNewProducts();
  }, []);

  const fetchNewProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/products/new-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching new products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (stock) => {
    if (stock > 20) return 'success';
    if (stock > 5) return 'warning';
    return 'error';
  };

  const getStatusText = (stock) => {
    if (stock > 20) return 'In Stock';
    if (stock > 5) return 'Low Stock';
    return 'Out of Stock';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const ProductCard = ({ product }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
      onClick={() => handleProductClick(product)}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="div"
          sx={{
            height: 200,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Avatar
            sx={{ 
              width: 80, 
              height: 80,
              backgroundColor: theme.palette.primary.main,
              fontSize: '2rem'
            }}
          >
            {product.name.charAt(0)}
          </Avatar>
        </CardMedia>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Chip
            icon={<NewIcon />}
            label="NEW"
            color="primary"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <Chip
            label={getStatusText(product.stock)}
            color={getStatusColor(product.stock)}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.brand} • {product.sku}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2, 
          height: 40, 
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {product.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatPrice(product.price)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(product.createdAt)}
          </Typography>
        </Box>
      </CardContent>
      
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<CartIcon />}
          onClick={(e) => {
            e.stopPropagation();
            // Handle add to cart
          }}
        >
          Add to Cart
        </Button>
      </Box>
    </Card>
  );

  const ProductTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Added</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product._id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                    {product.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.brand}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{formatPrice(product.price)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(product.stock)}
                  color={getStatusColor(product.stock)}
                  size="small"
                />
              </TableCell>
              <TableCell>{formatDate(product.createdAt)}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleProductClick(product)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add to Cart">
                    <IconButton size="small">
                      <CartIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          New Products
          <Badge badgeContent={products.length} color="primary" sx={{ ml: 2 }}>
            <NewIcon />
          </Badge>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            size="small"
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            size="small"
          >
            Table View
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNewProducts}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Products Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : paginatedProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No new products found
          </Typography>
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <ProductTable />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Product Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedProduct.name}</Typography>
                <Chip
                  icon={<NewIcon />}
                  label="NEW"
                  color="primary"
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2
                    }}
                  >
                    <Avatar sx={{ width: 100, height: 100, fontSize: '3rem' }}>
                      {selectedProduct.name.charAt(0)}
                    </Avatar>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Brand: {selectedProduct.brand}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    SKU: {selectedProduct.sku}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {selectedProduct.category}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {selectedProduct.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatPrice(selectedProduct.price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock: {selectedProduct.stock} units
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Added: {formatDate(selectedProduct.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
              <Button variant="contained" startIcon={<CartIcon />}>
                Add to Cart
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default NewProducts;
