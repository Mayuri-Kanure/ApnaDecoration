import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
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
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  Description as DetailsIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' }
];

const emptySummary = {
  products: 0,
  totalOrders: 0,
  canceledOrders: 0,
  ongoingOrders: 0,
  completedOrders: 0,
  totalDeliveryman: 0,
  totalShopEarnings: 0
};

const VendorSales = () => {
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([{ value: 'all', label: 'All Vendors' }]);
  const [vendorTableData, setVendorTableData] = useState([]);
  const [orderStatsData, setOrderStatsData] = useState([]);
  const [summaryData, setSummaryData] = useState(emptySummary);

  const fetchVendorSalesData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryResponse, earningsResponse, detailsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/vendor-summary`, {
          params: { timeFilter: selectedDateRange },
          headers
        }),
        axios.get(`${API_BASE_URL}/reports/vendor-earnings`, {
          params: { timeFilter: selectedDateRange },
          headers
        }),
        axios.get(`${API_BASE_URL}/reports/vendor-details`, {
          params: { timeFilter: selectedDateRange, limit: 1000 },
          headers
        })
      ]);

      const allVendorRows = Array.isArray(detailsResponse.data)
        ? detailsResponse.data
        : Array.isArray(detailsResponse.data?.vendors)
          ? detailsResponse.data.vendors
          : [];

      const options = Array.from(
        new Map(
          allVendorRows.map((row) => [
            String(row.id),
            { value: String(row.id), label: row.vendorName || 'Unknown Vendor' }
          ])
        ).values()
      );
      setVendors([{ value: 'all', label: 'All Vendors' }, ...options]);

      const scopedRows = selectedVendor === 'all'
        ? allVendorRows
        : allVendorRows.filter((row) => String(row.id) === String(selectedVendor));

      const mappedRows = scopedRows.map((row) => ({
        id: row.id,
        name: row.vendorName || 'Unknown Vendor',
        email: row.email || 'N/A',
        totalOrders: Number(row.totalOrders || 0),
        commission: Number(row.commissionGiven || 0),
        refundRate: 0,
        totalRevenue: Number(row.totalRevenue || 0)
      }));

      const summary = summaryResponse.data || {};
      const productsApproved = Number(summary.totalProducts?.approved || 0);
      const productsPending = Number(summary.totalProducts?.pending || 0);
      const totalOrders = mappedRows.reduce((sum, row) => sum + row.totalOrders, 0);
      const totalShopEarnings = mappedRows.reduce((sum, row) => sum + row.totalRevenue, 0);

      const mappedChartData = (Array.isArray(earningsResponse.data) ? earningsResponse.data : []).map((item) => ({
        month: item.month,
        orders: Number(item.earnings || 0)
      }));

      setVendorTableData(mappedRows);
      setOrderStatsData(mappedChartData);
      setSummaryData({
        products: productsApproved + productsPending,
        totalOrders,
        canceledOrders: 0,
        ongoingOrders: 0,
        completedOrders: 0,
        totalDeliveryman: 0,
        totalShopEarnings
      });
    } catch (err) {
      console.error('Error fetching vendor sales data:', err);
      setError('Failed to load vendor sales reports. Please check backend/API data.');
      setVendorTableData([]);
      setOrderStatsData([]);
      setSummaryData(emptySummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorSalesData();
  }, [selectedVendor, selectedDateRange]);

  const handleFilter = () => {
    fetchVendorSalesData();
  };

  const filteredVendorTableData = vendorTableData.filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      String(row.name || '').toLowerCase().includes(query) ||
      String(row.email || '').toLowerCase().includes(query)
    );
  });

  const LineChart = ({ data }) => (
    <Box sx={{ height: 200, p: 2, position: 'relative' }}>
      {data.length === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">No chart data available</Typography>
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, #e0e0e0 0px, transparent 1px, transparent 39px, #e0e0e0 40px)',
          opacity: 0.5
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'repeating-linear-gradient(90deg, #e0e0e0 0px, transparent 1px, transparent 39px, #e0e0e0 40px)',
          opacity: 0.5
        }}
      />
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', px: 1 }}>
        {(() => {
          const maxValue = Math.max(1, ...data.map((d) => Number(d.orders || 0)));
          return data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <Box
                sx={{
                  width: 4,
                  height: (Number(item.orders || 0) / maxValue) * 160,
                  backgroundColor: '#1976d2',
                  borderRadius: 2,
                  mb: 1
                }}
              />
              <Typography variant="caption" sx={{ fontSize: 10, color: '#666' }}>
                {(item.month || '').slice(0, 3)}
              </Typography>
            </Box>
          ));
        })()}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#f7f8fc', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
        Vendor Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="medium">
                    <Select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      displayEmpty
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}
                    >
                      {vendors.map((vendor) => (
                        <MenuItem key={vendor.value} value={vendor.value}>
                          {vendor.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="medium">
                    <Select
                      value={selectedDateRange}
                      onChange={(e) => setSelectedDateRange(e.target.value)}
                      displayEmpty
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}
                    >
                      {dateRanges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<FilterIcon />}
                      onClick={handleFilter}
                      sx={{ backgroundColor: '#1976d2', borderRadius: 2, px: 4, py: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                      Filter
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <ShoppingCartIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    {summaryData.products}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Products</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    {summaryData.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Total Orders</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 600 }}>{summaryData.canceledOrders}</Typography>
                      <Typography variant="caption" color="text.secondary">Canceled</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>{summaryData.ongoingOrders}</Typography>
                      <Typography variant="caption" color="text.secondary">Ongoing</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>{summaryData.completedOrders}</Typography>
                      <Typography variant="caption" color="text.secondary">Completed</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <LocalShippingIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    {summaryData.totalDeliveryman}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Deliveryman</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Order Statistics</Typography>
                  <LineChart data={orderStatsData} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <MoneyIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    Rs {Number(summaryData.totalShopEarnings || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Shop Earnings</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Vendor Table</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    placeholder="Search vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                    sx={{ width: 250 }}
                  />
                  <Button variant="contained" startIcon={<ExportIcon />} sx={{ backgroundColor: '#4caf50', borderRadius: 2, textTransform: 'none' }}>
                    Export
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vendor Info</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Total Order</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Commission</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Refund Rate</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVendorTableData.map((row, index) => (
                      <TableRow key={row.id || index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#666'
                              }}
                            >
                              {String(row.name || 'U').charAt(0)}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{row.totalOrders}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#1976d2' }}>
                          ${Number(row.commission || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: row.refundRate > 2 ? '#f44336' : '#4caf50' }}>
                          {Number(row.refundRate || 0)}%
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button size="small" startIcon={<ViewIcon />} variant="outlined">View</Button>
                            <Button size="small" startIcon={<DetailsIcon />} variant="outlined">Details</Button>
                            <Button size="small" startIcon={<DownloadIcon />} variant="outlined" color="success">Export</Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default VendorSales;
