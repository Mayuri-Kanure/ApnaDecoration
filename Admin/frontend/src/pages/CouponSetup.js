import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const CouponSetup = () => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    limitForSameUser: '',
    discountType: '',
    discountAmount: '',
    maxDiscount: '',
    minimumPurchase: '',
    startDate: null,
    expireDate: ''
  });

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    // Auto uppercase coupon code
    if (field === 'code') {
      value = value.toUpperCase();
    }
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const generateCode = () => {
    const words = ['SAVE', 'WELCOME', 'FIRST', 'NEW', 'SPECIAL', 'DEAL'];
    const num = Math.floor(Math.random() * 900) + 100;
    const code = words[Math.floor(Math.random() * words.length)] + num;
    setFormData({
      ...formData,
      code: code
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse numeric values first
    const discountAmount = parseFloat(formData.discountAmount);
    const maxDiscount = parseFloat(formData.maxDiscount);
    const minPurchase = parseFloat(formData.minimumPurchase);
    
    // Validation
    if (!formData.title.trim() || !formData.code.trim()) {
      alert('Title and Code are required');
      return;
    }
    
    if (!formData.discountType) {
      alert('Please select discount type');
      return;
    }
    
    if (!discountAmount || discountAmount <= 0) {
      alert('Please enter a valid discount amount');
      return;
    }
    
    if (formData.discountType === 'percentage') {
      if (discountAmount > 100) {
        alert('Percentage must be between 1 and 100');
        return;
      }
      // Require max discount for percentage coupons
      if (!maxDiscount || maxDiscount <= 0) {
        alert('Percentage coupons must have a max discount limit');
        return;
      }
    }
    
    if (formData.startDate && formData.expireDate) {
      if (new Date(formData.expireDate) <= new Date(formData.startDate)) {
        alert('Expire date must be after start date');
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Format dates to end of day
      const formatDateToEndOfDay = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        d.setHours(23, 59, 59, 999);
        return d;
      };
      
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        discountType: formData.discountType,
        discountAmount,
        maxDiscount: formData.discountType === 'percentage' ? maxDiscount : null,
        minPurchase: minPurchase || 0,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formatDateToEndOfDay(formData.expireDate),
        usageLimit: parseInt(formData.limitForSameUser) || null,
        applicableFor: 'all'
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/coupons/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Coupon updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE_URL}/coupons`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Coupon created successfully!');
      }
      fetchCoupons();
      handleReset();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      code: '',
      limitForSameUser: '',
      discountType: '',
      discountAmount: '',
      maxDiscount: '',
      minimumPurchase: '',
      startDate: null,
      expireDate: ''
    });
    setEditingId(null);
  };

  const handleEdit = (coupon) => {
    setFormData({
      title: coupon.title,
      code: coupon.code,
      limitForSameUser: coupon.usageLimit || '',
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      maxDiscount: coupon.maxDiscount || '',
      minimumPurchase: coupon.minPurchase || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : null,
      expireDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : ''
    });
    setEditingId(coupon._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCouponStatus = async (id) => {
    const coupon = coupons.find(c => c._id === id);
    
    // Frontend guard against expired coupons
    if (isExpired(coupon)) {
      alert('Cannot update expired coupon');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/coupons/${id}`, {
        isActive: !coupon.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert(error.response?.data?.message || 'Failed to update coupon status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/coupons/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  // Check if coupon is expired (end of day logic) - Null-safe
  const isExpired = (coupon) => {
    if (!coupon?.endDate) return false;
    
    const now = new Date();
    const end = new Date(coupon.endDate);
    
    // Check for invalid date
    if (isNaN(end.getTime())) return false;
    
    end.setHours(23, 59, 59, 999);
    return now > end;
  };

  // Get coupon status with exhausted check
  const getCouponStatus = (coupon) => {
    if (isExpired(coupon)) return { label: 'Expired', color: 'error' };
    if (!coupon.isActive) return { label: 'Disabled', color: 'default' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return { label: 'Exhausted', color: 'warning' };
    return { label: 'Active', color: 'success' };
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Coupon Setup
        </Typography>

        {/* Coupon Creation Form */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {editingId ? 'Edit Coupon' : 'Add New Coupon'}
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Row 1: Title, Code, Discount Type */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Title"
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    placeholder="Enter coupon title"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Code"
                    value={formData.code}
                    onChange={handleInputChange('code')}
                    placeholder="Enter coupon code"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={generateCode}
                            sx={{ textTransform: 'none' }}
                          >
                            Generate
                          </Button>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={formData.discountType}
                      onChange={handleInputChange('discountType')}
                      label="Discount Type"
                    >
                      <MenuItem value="percentage">Percentage (%)</MenuItem>
                      <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Row 2: Discount Amount, Max Discount, Min Purchase */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label={formData.discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount (₹)'}
                    value={formData.discountAmount}
                    onChange={handleInputChange('discountAmount')}
                    placeholder={formData.discountType === 'percentage' ? 'Ex: 20' : 'Ex: 500'}
                    type="number"
                    inputProps={{ min: 0 }}
                    disabled={!formData.discountType}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Discount (₹)"
                    value={formData.maxDiscount}
                    onChange={handleInputChange('maxDiscount')}
                    placeholder="Ex: 1000"
                    type="number"
                    inputProps={{ min: 0 }}
                    helperText={formData.discountType === 'percentage' ? 'Required for percentage' : 'Not applicable for fixed'}
                    disabled={formData.discountType !== 'percentage'}
                    required={formData.discountType === 'percentage'}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Minimum Purchase (₹)"
                    value={formData.minimumPurchase}
                    onChange={handleInputChange('minimumPurchase')}
                    placeholder="Ex: 1000"
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {/* Row 3: Usage Limit, Start Date, Expire Date */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Usage Limit (Total)"
                    value={formData.limitForSameUser}
                    onChange={handleInputChange('limitForSameUser')}
                    placeholder="Ex: 100 (leave empty for unlimited)"
                    type="number"
                    inputProps={{ min: 0 }}
                    helperText="Total times this coupon can be used"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Expire Date"
                    type="date"
                    value={formData.expireDate || ''}
                    onChange={(e) => setFormData({...formData, expireDate: e.target.value})}
                    InputLabelProps={{
                      shrink: true
                    }}
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
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                    >
                      {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Submit')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Coupon List */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Coupon List
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search by Title or Code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ width: 250 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                >
                  Export
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell>SL</TableCell>
                    <TableCell>Coupon</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Min / Max Purchase</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCoupons.map((coupon, index) => (
                    <TableRow key={coupon._id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {coupon.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {coupon.code}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip 
                            label={coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`}
                            color="primary"
                            size="small"
                          />
                          {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                              Max ₹{coupon.maxDiscount}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {coupon.startDate
                            ? new Date(coupon.startDate).toLocaleDateString()
                            : 'No Start'}
                          {' to '}
                          {coupon.endDate
                            ? new Date(coupon.endDate).toLocaleDateString()
                            : 'No End'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Limit: {coupon.usageLimit || 'Unlimited'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Used: {coupon.usedCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Min: ₹{coupon.minPurchase || 0}
                          {coupon.maxDiscount && ` | Max: ₹${coupon.maxDiscount}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            label={getCouponStatus(coupon).label}
                            color={getCouponStatus(coupon).color}
                            size="small"
                          />
                          {!isExpired(coupon) && getCouponStatus(coupon).label !== 'Exhausted' && (
                            <Switch
                              checked={coupon.isActive}
                              onChange={() => toggleCouponStatus(coupon._id)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(coupon)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(coupon._id)}
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
          </CardContent>
        </Card>
      </Box>
  );
};

export default CouponSetup;
