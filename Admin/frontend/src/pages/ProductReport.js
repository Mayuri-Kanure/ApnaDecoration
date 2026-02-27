import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon
} from '@mui/icons-material';

const ProductReport = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';
  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  });

  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('thisYear');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState([]);
  const [kpiData, setKpiData] = useState({ totalProducts: { total: 0 }, totalProductSale: 0, totalDiscountGiven: 0 });
  const [stockData, setStockData] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [productStats, setProductStats] = useState([]);
  const [wishlistData, setWishlistData] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [stockTypeFilter, setStockTypeFilter] = useState('all');
  const [stockSortFilter, setStockSortFilter] = useState('DESC');
  const [wishlistSearch, setWishlistSearch] = useState('');
  const [wishlistPage, setWishlistPage] = useState(1);
  const [wishlistPagination, setWishlistPagination] = useState({ pages: 1, total: 0 });

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const timeOptions = [
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  // Load product data
  const loadProductData = async () => {
    console.log('🔍 FRONTEND - Loading product data...');
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/product-report/products`, {
        params: {
          status: statusFilter,
          timeFilter: timeFilter,
          search: searchQuery,
          page: page,
          limit: 10
        },
        headers: authHeaders()
      });
      
      console.log('🔍 ADMIN PRODUCT REPORT - API Response:', response.data);
      console.log('🔍 ADMIN PRODUCT REPORT - Products count:', response.data.products?.length);
      console.log('🔍 ADMIN PRODUCT REPORT - KPI Data:', response.data.kpiData);
      console.log('🔍 ADMIN PRODUCT REPORT - Pagination:', response.data.pagination);
      
      setProductData(response.data.products || []);
      setKpiData(response.data.kpiData || { totalProducts: { total: 0 }, totalProductSale: 0, totalDiscountGiven: 0 });
      setProductStats(response.data.productStats || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load stock data
  const loadStockData = async () => {
    setStockLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/product-report/stock`, {
        params: {
          type: stockTypeFilter,
          category: 'all',
          sortBy: stockSortFilter
        },
        headers: authHeaders()
      });
      setStockData(response.data.products || []);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setStockLoading(false);
    }
  };

  // Load wishlist data
  const loadWishlistData = async () => {
    setWishlistLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/product-report/wishlist`, {
        params: {
          search: wishlistSearch,
          page: wishlistPage,
          limit: 10
        },
        headers: authHeaders()
      });
      const rawWishlist = Array.isArray(response.data.products) ? response.data.products : [];
      const filteredWishlist = rawWishlist.filter((item) => Number(item?.totalInWishlist || 0) > 0);
      setWishlistData(filteredWishlist);
      if (response.data.pagination) {
        setWishlistPagination({
          ...response.data.pagination,
          total: filteredWishlist.length,
          pages: Math.max(1, Math.ceil(filteredWishlist.length / 10))
        });
      } else {
        setWishlistPagination({
          total: filteredWishlist.length,
          pages: Math.max(1, Math.ceil(filteredWishlist.length / 10))
        });
      }
    } catch (error) {
      console.error('Error loading wishlist data:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    console.log('🔍 FRONTEND - useEffect triggered, activeTab:', activeTab);
    if (activeTab === 0) {
      loadProductData();
    } else if (activeTab === 1) {
      loadStockData();
    } else if (activeTab === 2) {
      loadWishlistData();
    }
  }, [activeTab, statusFilter, timeFilter, searchQuery, page, stockTypeFilter, stockSortFilter, wishlistSearch, wishlistPage]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product-report/export`, {
        params: {
          status: statusFilter,
          timeFilter: timeFilter,
          search: searchQuery
        },
        headers: authHeaders(),
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-services-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }
    
    return (
      <Typography variant="body2" sx={{ color: '#ffa726' }}>
        {stars.join('')} ({rating})
      </Typography>
    );
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
        Products & Services Report
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Typography>Loading data...</Typography>
        </Box>
      )}

      {!loading && (
        <>
          <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="All Products" />
                <Tab label="Product Stock" />
                <Tab label="Wish Listed Products" />
              </Tabs>
            </CardContent>
          </Card>

          {activeTab === 0 && (
            <>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ShoppingCartIcon sx={{ fontSize: 32, color: '#1976d2', mr: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Total Products
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2 }}>
                        {kpiData.totalProducts.total}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              {kpiData.totalProducts.active}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Active
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#ff9800' }}>
                              {kpiData.totalProducts.pending}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pending
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#f44336' }}>
                              {kpiData.totalProducts.rejected}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Rejected
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InventoryIcon sx={{ fontSize: 32, color: '#4caf50', mr: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Total Product Sale
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        {kpiData.totalProductSale}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Items sold this period
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StoreIcon sx={{ fontSize: 32, color: '#ff5722', mr: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Total Discount Given
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        ₹{(kpiData.totalDiscountGiven || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Total discount amount
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Filters
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={timeFilter}
                          onChange={(e) => setTimeFilter(e.target.value)}
                        >
                          {timeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 200 }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                      >
                        Export
                      </Button>
                    </Box>
                  </Box>

                  <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Product Unit Price</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Amount Sold</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Quantity Sold</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Average Product Value</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Current Stock Amount</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Average Ratings</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productData && productData.length > 0 ? (
                          productData.map((product, index) => (
                            <TableRow 
                              key={product.id} 
                              sx={{ 
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                              }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Box sx={{ 
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  backgroundColor: product.type === 'service' ? '#e3f2fd' : '#f3e5f5',
                                  color: product.type === 'service' ? '#1976d2' : '#7b1fa2'
                                }}>
                                  {product.type || 'product'}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                {(product.productName || 'Unknown Product').length > 30 ? (product.productName || 'Unknown Product').substring(0, 30) + '...' : (product.productName || 'Unknown Product')}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '#4caf50' }}>
                                ₹{(product.unitPrice || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                ₹{(product.totalAmountSold || 0).toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {product.totalQuantitySold || 0}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                ₹{product.totalQuantitySold > 0 ? ((product.totalAmountSold || 0) / product.totalQuantitySold).toFixed(2) : '0.00'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {product.stockAmount || 0}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ color: '#ffc107', fontSize: 16 }}>★</Typography>
                                  <Typography variant="body2">
                                    {product.rating || 0} ({product.reviews || 0})
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                              <Typography variant="body1" color="text.secondary">
                                No products or services found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {productData.length} of {pagination.total} items
                    </Typography>
                    <Pagination
                      count={pagination.pages}
                      page={page}
                      onChange={handlePageChange}
                      shape="rounded"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: 2,
                          fontWeight: 500,
                        },
                        '& .MuiPaginationItem-page.Mui-selected': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#1565c0',
                          }  
                        },
                        '& .MuiPaginationItem-page': {
                          color: '#546e7a',
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderColor: '#1976d2',
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Product Stock Information
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={stockTypeFilter}
                          onChange={(e) => setStockTypeFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="product">Products</MenuItem>
                          <MenuItem value="service">Services</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={stockSortFilter}
                          onChange={(e) => setStockSortFilter(e.target.value)}
                        >
                          <MenuItem value="DESC">High to Low Stock</MenuItem>
                          <MenuItem value="ASC">Low to High Stock</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Current Stock</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stockData && stockData.length > 0 ? (
                          stockData.map((item, index) => (
                            <TableRow 
                              key={item.id} 
                              sx={{ 
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                              }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Box sx={{ 
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  backgroundColor: item.type === 'service' ? '#e3f2fd' : '#f3e5f5',
                                  color: item.type === 'service' ? '#1976d2' : '#7b1fa2'
                                }}>
                                  {item.type || 'product'}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                {item.name}
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>
                                {item.stock}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ 
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  backgroundColor: 
                                    item.status === 'Active' ? '#e8f5e8' :
                                    item.status === 'In Stock' ? '#e8f5e8' :
                                    '#fff3cd',
                                  color: 
                                    item.status === 'Active' ? '#2e7d32' :
                                    item.status === 'In Stock' ? '#2e7d32' :
                                    '#856404'
                                }}>
                                  {item.status}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.875rem' }}>
                                {item.lastUpdated}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              <Typography variant="body1" color="text.secondary">
                                No stock data available
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 2 && (
            <>
              <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Wish Listed Products
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        size="small"
                        placeholder="Search products..."
                        value={wishlistSearch}
                        onChange={(e) => {
                          setWishlistSearch(e.target.value);
                          setWishlistPage(1);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 200 }}
                      />
                    </Box>
                  </Box>

                  <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Total in Wishlist</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {wishlistData && wishlistData.length > 0 ? (
                          wishlistData.map((item, index) => (
                            <TableRow 
                              key={item.id} 
                              sx={{ 
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                              }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Box sx={{ 
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  backgroundColor: item.type === 'service' ? '#e3f2fd' : '#f3e5f5',
                                  color: item.type === 'service' ? '#1976d2' : '#7b1fa2'
                                }}>
                                  {item.type || 'product'}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                {item.productName}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.875rem' }}>
                                {item.date}
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ 
                                  display: 'inline-block',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 1,
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  backgroundColor: item.totalInWishlist > 0 ? '#e8f5e8' : '#f5f5f5',
                                  color: item.totalInWishlist > 0 ? '#2e7d32' : '#666'
                                }}>
                                  {item.totalInWishlist}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography variant="body1" color="text.secondary">
                                No items in wishlist
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Pagination
                      count={wishlistPagination.pages || 1}
                      page={wishlistPage}
                      onChange={(event, newPage) => setWishlistPage(newPage)}
                      shape="rounded"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: 2,
                          fontWeight: 500,
                        },
                        '& .MuiPaginationItem-page.Mui-selected': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#1565c0',
                          }  
                        },
                        '& .MuiPaginationItem-page': {
                          color: '#546e7a',
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderColor: '#1976d2',
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ProductReport;
