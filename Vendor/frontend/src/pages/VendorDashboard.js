import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import vendorApi from '../services/vendorApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as ProductIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchVendorStats();
  }, []);

  const fetchVendorStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching vendor dashboard stats...');
      
      const response = await vendorApi.getVendorProducts();
      console.log('📦 Vendor products response:', response);
      
      const products = response.products || [];
      
      // Calculate stats from real products
      const calculatedStats = {
        totalProducts: products.length,
        approved: products.filter(p => p.status === 'approved').length,
        pending: products.filter(p => p.status === 'pending').length,
        rejected: products.filter(p => p.status === 'rejected').length
      };
      
      setStats(calculatedStats);
      console.log('📊 Calculated stats:', calculatedStats);
      
    } catch (error) {
      console.error('❌ Error fetching vendor stats:', error);
      // Keep default stats (0) if there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleViewProducts = () => {
    navigate('/products');
  };

  const productStatusCards = [
    {
      title: 'Approved Products',
      count: stats.approved,
      icon: <ApprovedIcon sx={{ fontSize: 32 }} />,
      color: '#28C76F',
      bgColor: '#f0fdf4',
      borderColor: '#86efac'
    },
    {
      title: 'Pending Products',
      count: stats.pending,
      icon: <PendingIcon sx={{ fontSize: 32 }} />,
      color: '#FF9F43',
      bgColor: '#fffbeb',
      borderColor: '#fcd34d'
    },
    {
      title: 'Rejected Products',
      count: stats.rejected,
      icon: <RejectedIcon sx={{ fontSize: 32 }} />,
      color: '#EA5455',
      bgColor: '#fef2f2',
      borderColor: '#fca5a5'
    }
  ];

  return (
    <Box sx={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 4, pl: 3, pr: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
            Vendor Dashboard
          </Typography>
          <Typography variant="body1" color="#64748b">
            Welcome to your vendor dashboard - manage your products and track their status
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchVendorStats}
          disabled={loading}
          sx={{ 
            borderColor: '#2F66FF',
            color: '#2F66FF',
            '&:hover': { 
              borderColor: '#1e40af',
              backgroundColor: '#f8fafc'
            }
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Top Row - Main Statistics Card */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3, 
            boxShadow: 3, 
            bgcolor: 'white',
            border: '2px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #2F66FF20 0%, #2F66FF05 100%)',
              borderRadius: '0 0 0 100%'
            }} />
            {loading ? (
              <CircularProgress sx={{ position: 'relative', zIndex: 1 }} />
            ) : (
              <>
                <ProductIcon sx={{ fontSize: 60, color: '#2F66FF', mb: 2, position: 'relative', zIndex: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, position: 'relative', zIndex: 1 }}>
                  {stats.totalProducts}
                </Typography>
                <Typography variant="h6" color="#64748b" sx={{ position: 'relative', zIndex: 1 }}>
                  Total Products
                </Typography>
                <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>
                  All your products in one place
                </Typography>
              </>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'white', border: '2px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
              Quick Actions
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={handleAddProduct}
                  sx={{ 
                    p: 2,
                    backgroundColor: '#2F66FF',
                    '&:hover': { backgroundColor: '#1e40af' },
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  Add New Product
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<ProductIcon />}
                  fullWidth
                  onClick={handleViewProducts}
                  sx={{ 
                    p: 2,
                    borderColor: '#2F66FF',
                    color: '#2F66FF',
                    '&:hover': { 
                      borderColor: '#1e40af',
                      backgroundColor: '#f8fafc'
                    },
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  View All Products
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="body2" color="#64748b" sx={{ mb: 2 }}>
                <strong>Getting Started:</strong>
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 1 }}>
                1. Click "Add New Product" to create your first product
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 1 }}>
                2. Your products will be submitted for admin approval
              </Typography>
              <Typography variant="body2" color="#64748b">
                3. Once approved, your products will be visible to customers
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row - Product Status Breakdown */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
          Product Status Overview
        </Typography>
        <Grid container spacing={3}>
          {productStatusCards.map((status, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: 2, 
                bgcolor: 'white',
                border: `2px solid ${status.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {loading ? <CircularProgress size={24} /> : status.count}
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                    {status.title}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: status.bgColor,
                  color: status.color
                }}>
                  {status.icon}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Third Row - Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
          Recent Activity
        </Typography>
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 2, bgcolor: 'white', border: '2px solid #e2e8f0' }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {loading ? (
              <CircularProgress />
            ) : stats.totalProducts === 0 ? (
              <>
                <ProductIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                <Typography variant="h6" color="#64748b" sx={{ mb: 1 }}>
                  No products yet
                </Typography>
                <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                  Start by adding your first product to see activity here
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  sx={{ backgroundColor: '#2F66FF' }}
                >
                  Add Your First Product
                </Button>
              </>
            ) : (
              <>
                <ProductIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                <Typography variant="h6" color="#64748b" sx={{ mb: 1 }}>
                  No recent activity
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Your recent product updates and notifications will appear here
                </Typography>
              </>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default VendorDashboard;
