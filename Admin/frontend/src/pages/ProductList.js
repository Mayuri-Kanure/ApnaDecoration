import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Switch,
  Tabs,
  Tab,
} from '@mui/material';

import {
  SearchRounded,
  Edit,
  Delete,
  Visibility,
  Dashboard,
  Inventory,
  QrCode,
  Star,
  StarBorder,
  Warning,
  CheckCircle,
  Cancel,
  RemoveCircle,
  StarRate,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Event as EventIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function ProductList() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [featuredDialogOpen, setFeaturedDialogOpen] = useState(false);
  const [selectedProductForFeatured, setSelectedProductForFeatured] = useState(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedProductForStatus, setSelectedProductForStatus] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    checkUserRole();
  }, []);

  /* ================= ROLE ================= */
  const checkUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
      setIsAdmin(payload.role === 'admin');
    } catch {
      setUserRole(null);
      setIsAdmin(false);
    }
  };

  /* ================= API ================= */
  const fetchCategories = async () => {
    try {
      const res = await apiService.getCategories();
      setCategories(res || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiService.getProducts();
      setProducts(res || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */
  const getCategoryName = (id) =>
    categories.find((c) => c._id === id)?.name || id;

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }).map((_, i) =>
      i < rating ? (
        <Star key={i} sx={{ fontSize: 16, color: '#ffc107' }} />
      ) : (
        <StarBorder key={i} sx={{ fontSize: 16, color: '#ffc107' }} />
      )
    );

  /* ================= ACTIONS ================= */
  const handleEdit = (product) =>
    navigate('/dashboard/edit-product', { state: { product, isEdit: true } });

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await apiService.deleteProduct(selectedProduct._id);
    setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
    setDeleteDialogOpen(false);
  };

  const toggleFeatured = (product) => {
    setSelectedProductForFeatured(product);
    setFeaturedDialogOpen(true);
  };

  const confirmToggleFeatured = async () => {
    try {
      console.log('🔄 Toggling featured for product:', selectedProductForFeatured._id);
      const response = await apiService.toggleProductFeatured(selectedProductForFeatured._id);
      console.log('✅ Toggle response:', response);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProductForFeatured._id
            ? { ...p, featured: !p.featured }
            : p
        )
      );
      setFeaturedDialogOpen(false);
    } catch (error) {
      console.error('❌ Error toggling featured:', error);
      alert('Failed to toggle featured status: ' + error.message);
    }
  };

  const toggleStatus = (product) => {
    setSelectedProductForStatus(product);
    setStatusDialogOpen(true);
  };


  /* ================= RENDER ================= */
  return (
    <Box sx={{ p: 2, background: '#f5f5f5', minHeight: '100vh' }}>
      {loading ? (
        <Typography align="center">Loading products…</Typography>
      ) : (
        <>
          {/* HEADER */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Product List</Typography>
            <Button variant="contained" startIcon={<Dashboard />}>
              Dashboard
            </Button>
          </Box>

          {/* TABS */}
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="English (EN)" />
          </Tabs>

          {/* FILTERS */}
          <Card sx={{ my: 3 }}>
            <CardContent sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchRounded /> }}
              />

              <FormControl size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* TABLE */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredProducts.map((p) => {
                  if (p.vendorId) {
                    console.log('🔍 Admin Vendor Product:', {
                      name: p.name,
                      thumbnail: p.thumbnail,
                      images: p.images,
                      vendorId: p.vendorId,
                      hasThumbnail: !!p.thumbnail,
                      hasImages: !!(p.images && p.images.length > 0),
                      isVendorProduct: !!p.vendorId
                    });
                  }

                  return (
                    <TableRow key={p._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {(() => {
                            const resolveImageUrl = (path) => {
                              if (!path) return null;
                              // Handle Cloudinary URLs (they start with https://res.cloudinary.com)
                              if (path.startsWith('https://')) return path;
                              // Handle localhost URLs
                              if (path.startsWith('http://')) return path;
                              // Handle relative paths
                              return `${API_BASE_URL}${path}`;
                            };
                            
                            const imageUrl = resolveImageUrl(p.thumbnail || p.images?.[0]);
                            
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={p.name}
                                style={{ 
                                  width: 40, 
                                  height: 40, 
                                  borderRadius: 2, 
                                  objectFit: 'cover',
                                  border: '1px solid #e0e0e0'
                                }}
                                onError={(e) => {
                                  console.error('❌ IMAGE FAILED:', imageUrl);
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }}
                                onLoad={() => {
                                  console.log('✅ Admin - Image loaded successfully:', {
                                    product: p.name,
                                    url: imageUrl
                                  });
                                }}
                              />
                            ) : (
                              <Box sx={{ color: '#666', fontSize: '12px' }}>
                                No image data
                              </Box>
                            );
                          })()}
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: 2, 
                            backgroundColor: '#f5f5f5', 
                            display: (p.thumbnail || (p.images && p.images.length > 0)) ? 'none' : 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid #e0e0e0'
                          }}>
                            <Inventory sx={{ fontSize: 20, color: '#999' }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {p.name}
                            </Typography>
                            {p.vendorId && (
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                Vendor: {p.vendorId?.name || 'Unknown Vendor'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>
                        <Chip label={getCategoryName(p.category)} />
                      </TableCell>
                      <TableCell>
                        <Switch checked={p.status === 'active'} onChange={() => toggleStatus(p)} />
                      </TableCell>
                      <TableCell>
                        <Switch checked={p.featured} disabled={!isAdmin} onChange={() => toggleFeatured(p)} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton onClick={() => setDetailsDialogOpen(true)}>
                            <Visibility />
                          </IconButton>
                          <IconButton onClick={() => handleEdit(p)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(p)}>
                            <Delete />
                          </IconButton>
                          <IconButton onClick={() => navigate('/dashboard/generate-barcode', { state: { product: p } })}>
                            <QrCode />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* DELETE DIALOG */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button color="error" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* FEATURED DIALOG */}
          <Dialog open={featuredDialogOpen} onClose={() => setFeaturedDialogOpen(false)}>
            <DialogTitle>Toggle Featured Status</DialogTitle>
            <DialogContent>
              <Typography>
                {selectedProductForFeatured?.featured
                  ? 'Remove this product from featured?'
                  : 'Mark this product as featured?'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFeaturedDialogOpen(false)}>Cancel</Button>
              <Button color="primary" onClick={confirmToggleFeatured}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>


        </>

      )}
    </Box>
  );
}

export default ProductList;
