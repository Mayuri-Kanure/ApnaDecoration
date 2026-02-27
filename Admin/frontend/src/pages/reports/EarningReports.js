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
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const emptyAdminSummary = {
  totalRevenue: 0,
  totalCommission: 0,
  totalTax: 0,
  totalRefunds: 0,
  netEarnings: 0,
  totalOrders: 0,
  averageOrderValue: 0
};

const emptyVendorSummary = {
  totalVendors: 0,
  totalProducts: { pending: 0, approved: 0 },
  walletStatus: {
    withdrawableBalance: 0,
    pendingWithdrawals: 0,
    alreadyWithdrawn: 0
  }
};

const EarningReports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeFilter, setTimeFilter] = useState('thisMonth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [adminSummaryData, setAdminSummaryData] = useState(emptyAdminSummary);
  const [adminEarningsData, setAdminEarningsData] = useState([]);
  const [paymentStatusData, setPaymentStatusData] = useState([]);
  const [totalSalesData, setTotalSalesData] = useState([]);

  const [vendorSummaryData, setVendorSummaryData] = useState(emptyVendorSummary);
  const [vendorEarningsData, setVendorEarningsData] = useState([]);
  const [vendorTableData, setVendorTableData] = useState([]);

  const fetchAdminSummaryData = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin-earnings/summary`, {
      params: { timeFilter },
      headers: { Authorization: `Bearer ${token}` }
    });
    setAdminSummaryData(response.data || emptyAdminSummary);
  };

  const fetchAdminEarningsChart = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin-earnings/chart`, {
      params: { timeFilter },
      headers: { Authorization: `Bearer ${token}` }
    });
    setAdminEarningsData(Array.isArray(response.data) ? response.data : []);
  };

  const fetchAdminPaymentStatus = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin-earnings/payment-status`, {
      params: { timeFilter },
      headers: { Authorization: `Bearer ${token}` }
    });
    setPaymentStatusData(Array.isArray(response.data) ? response.data : []);
  };

  const fetchAdminTotalSales = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin-earnings/total-sales`, {
      params: { timeFilter },
      headers: { Authorization: `Bearer ${token}` }
    });
    setTotalSalesData(Array.isArray(response.data?.sales) ? response.data.sales : []);
  };

  const fetchVendorSummaryData = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/reports/vendor-summary`, {
      params: { timeFilter },
      headers: { Authorization: `Bearer ${token}` }
    });
    setVendorSummaryData(response.data || emptyVendorSummary);
  };

  const fetchVendorEarningsData = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/reports/vendor-earnings`, {
      params: { timeFilter },
      headers: { Authorization: `Bearer ${token}` }
    });
    setVendorEarningsData(Array.isArray(response.data) ? response.data : []);
  };

  const fetchVendorTableData = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/reports/vendor-details`, {
      params: { timeFilter, limit: 1000 },
      headers: { Authorization: `Bearer ${token}` }
    });
    const rows = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.vendors)
        ? response.data.vendors
        : [];
    setVendorTableData(rows);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 0) {
          await Promise.all([
            fetchAdminSummaryData(),
            fetchAdminEarningsChart(),
            fetchAdminPaymentStatus(),
            fetchAdminTotalSales()
          ]);
        } else {
          await Promise.all([
            fetchVendorSummaryData(),
            fetchVendorEarningsData(),
            fetchVendorTableData()
          ]);
        }
      } catch (err) {
        console.error('Error loading earning reports:', err);
        setError('Unable to load earning report data.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [activeTab, timeFilter]);

  const handleExport = () => {
    console.log('Export data for:', timeFilter, activeTab === 0 ? 'admin' : 'vendor');
  };

  const LineChart = ({ data, title }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', p: 2 }}>
          {(Array.isArray(data) ? data : []).map((item, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: (Number(item.earnings || 0) / Math.max(1, ...(data || []).map((d) => Number(d.earnings || 0)))) * 150,
                  backgroundColor: '#1976d2',
                  borderRadius: 1,
                  mb: 1
                }}
              />
              <Typography variant="caption">{item.month}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const DonutChart = ({ data, title }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', p: 2 }}>
          <Box sx={{ position: 'relative', width: 120, height: 120 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: (() => {
                  const items = Array.isArray(data) ? data : [];
                  if (items.length === 0) return '#e0e0e0';
                  let cumulative = 0;
                  const segments = items.map((item) => {
                    const start = cumulative;
                    cumulative += Number(item.value || 0) * 3.6;
                    return `${item.color} ${start}deg ${cumulative}deg`;
                  });
                  return `conic-gradient(${segments.join(', ')})`;
                })(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'white' }} />
            </Box>
          </Box>
          <Box>
            {(Array.isArray(data) ? data : []).map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: item.color, mr: 1, borderRadius: 1 }} />
                <Typography variant="body2">{item.name}: {item.value}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Earnings Reports
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} displayEmpty>
                <MenuItem value="thisYear">This Year</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
                <MenuItem value="thisWeek">This Week</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="lastYear">Last Year</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
              Export
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(event, value) => setActiveTab(value)}>
          <Tab label="Admin Earning" />
          <Tab label="Vendor Earning" />
        </Tabs>
      </Box>

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
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <LineChart data={adminEarningsData} title="Earning Statistics" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DonutChart data={paymentStatusData} title="Payment Status" />
                </Grid>
              </Grid>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h6">Rs {Number(adminSummaryData.totalRevenue || 0).toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Commission</Typography>
                      <Typography variant="h6">Rs {Number(adminSummaryData.totalCommission || 0).toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Refunds</Typography>
                      <Typography variant="h6">Rs {Number(adminSummaryData.totalRefunds || 0).toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Net Earnings</Typography>
                      <Typography variant="h6" color="success.main">Rs {Number(adminSummaryData.netEarnings || 0).toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Total Sales</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Customer Name</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Commission</TableCell>
                          <TableCell align="right">VAT/TAX</TableCell>
                          <TableCell align="right">Refund Given</TableCell>
                          <TableCell align="right">Net Earning</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {totalSalesData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.orderId}</TableCell>
                            <TableCell>{row.customerName}</TableCell>
                            <TableCell align="right">Rs {Number(row.totalAmount || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">Rs {Number(row.commission || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">Rs {Number(row.vatTax || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">Rs {Number(row.refundGiven || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                Rs {Number(row.netEarning || 0).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                        {Number(vendorSummaryData.totalVendors || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Total Vendors</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                        {Number(vendorSummaryData.totalProducts?.approved || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Approved Products</Typography>
                      <Typography variant="caption" color="warning.main">
                        {Number(vendorSummaryData.totalProducts?.pending || 0)} Pending
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                        ${Number(vendorSummaryData.walletStatus?.withdrawableBalance || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Withdrawable Balance</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Vendor Wallet Status</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'success.main', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main" sx={{ fontWeight: 600 }}>
                          ${Number(vendorSummaryData.walletStatus?.withdrawableBalance || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2">Withdrawable Balance</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'warning.main', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 600 }}>
                          ${Number(vendorSummaryData.walletStatus?.pendingWithdrawals || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2">Pending Withdrawals</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'info.main', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="h5" color="info.main" sx={{ fontWeight: 600 }}>
                          ${Number(vendorSummaryData.walletStatus?.alreadyWithdrawn || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2">Already Withdrawn</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <LineChart data={vendorEarningsData} title="Vendor Earnings Statistics" />
                </Grid>
              </Grid>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Vendor Details</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vendor Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell align="right">Total Orders</TableCell>
                          <TableCell align="right">Total Revenue</TableCell>
                          <TableCell align="right">Commission Given</TableCell>
                          <TableCell align="right">Deliveryman Incentive</TableCell>
                          <TableCell align="right">Wallet Balance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(Array.isArray(vendorTableData) ? vendorTableData : []).map((row) => (
                          <TableRow key={row.id}>
                            <TableCell sx={{ fontWeight: 600 }}>{row.vendorName}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell align="right">{Number(row.totalOrders || 0)}</TableCell>
                            <TableCell align="right">${Number(row.totalRevenue || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">${Number(row.commissionGiven || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">${Number(row.deliverymanIncentive || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                ${Number(row.walletBalance || 0).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default EarningReports;
