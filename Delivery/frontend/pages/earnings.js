import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Download,
  Refresh,
  FilterList,
  CalendarToday,
  AccountBalanceWallet,
  History,
  CheckCircle,
  Pending,
  Error
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`earnings-tabpanel-${index}`}
      aria-labelledby={`earnings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EarningsPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  
  // Earnings data
  const [earnings, setEarnings] = useState([]);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [earningsStats, setEarningsStats] = useState({
    totalEarnings: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    monthlyEarnings: 0
  });

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('deliveryBoyToken');
    if (!token) {
      router.push('/delivery-boy/login');
      return;
    }
    
    // Load earnings data
    loadEarningsData();
    loadEarningsStats();
  }, []);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.get('http://localhost:5002/api/delivery-boys/earnings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data);
      setEarnings(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading earnings:', error);
      // Set empty array instead of mock data
      setEarnings([]);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load earnings data', 
        severity: 'error' 
      });
    }
    setLoading(false);
  };

  const loadEarningsStats = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.get('http://localhost:5002/api/delivery-boys/earnings/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Stats API Response:', response.data);
      setEarningsStats(response.data.data || response.data || {
        totalEarnings: 0,
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        monthlyEarnings: 0
      });
    } catch (error) {
      console.error('Error loading earnings stats:', error);
      // Set default values instead of mock data
      setEarningsStats({
        totalEarnings: 0,
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        monthlyEarnings: 0
      });
      setSnackbar({ 
        open: true, 
        message: 'Failed to load earnings statistics', 
        severity: 'error' 
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleWithdrawal = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.post('http://localhost:5002/api/delivery-boys/withdrawal', {
        amount: parseFloat(withdrawalAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Withdrawal Response:', response.data);
      setSnackbar({ open: true, message: 'Withdrawal request submitted!', severity: 'success' });
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount('');
      loadEarningsData();
      loadEarningsStats();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error creating withdrawal request', 
        severity: 'error' 
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getFilteredEarnings = () => {
    if (filter === 'all') return earnings;
    if (filter === 'completed') return earnings.filter(e => e.status === 'completed');
    if (filter === 'pending') return earnings.filter(e => e.status === 'pending');
    if (filter === 'withdrawal') return earnings.filter(e => e.type === 'withdrawal');
    return earnings;
  };

  const getTotalEarnings = () => {
    return getFilteredEarnings().reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#1e3a5f', color: 'white', p: 2, mb: 3 }}>
        <Typography variant="h6">Earnings & Withdrawals</Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#2d5a8c', color: 'white' }}>
            <CardContent>
                  <Typography variant="h6">Total Earnings</Typography>
                  <Typography variant="h4">₹{earningsStats.totalEarnings}</Typography>
                  <TrendingUp sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#2196F3', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Total Withdrawals</Typography>
                  <Typography variant="h4">₹{earningsStats.totalWithdrawals}</Typography>
                  <AccountBalanceWallet sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#FF9800', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Pending Withdrawals</Typography>
                  <Typography variant="h4">{earningsStats.pendingWithdrawals}</Typography>
                  <Pending sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#9C27B0', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Monthly Earnings</Typography>
                  <Typography variant="h4">₹{earningsStats.monthlyEarnings}</Typography>
                  <CalendarToday sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

      {/* Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#1e3a5f' }}>Filter</Typography>
          <Select
            value={filter}
            onChange={handleFilterChange}
            fullWidth
          >
            <MenuItem value="all">All Transactions</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="withdrawal">Withdrawals</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#1e3a5f' }}>Date Range</Typography>
          <Select
            value={dateRange}
            onChange={handleDateRangeChange}
            fullWidth
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadEarningsData}
            disabled={loading}
            fullWidth
          >
            Refresh Data
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            startIcon={<AttachMoney />}
            onClick={() => setWithdrawalDialogOpen(true)}
            fullWidth
          >
            Request Withdrawal
          </Button>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="earnings tabs">
          <Tab icon={<AccountBalanceWallet />} label="Earnings History" />
          <Tab icon={<History />} label="Withdrawal History" />
          <Tab icon={<TrendingUp />} label="Analytics" />
        </Tabs>
      </Box>

      {/* Earnings History Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Earnings History</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Order ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredEarnings().map((earning, index) => (
                        <TableRow key={earning.id}>
                          <TableCell>{earning.date}</TableCell>
                          <TableCell>
                            <Chip label={earning.type} color="primary" size="small" />
                          </TableCell>
                          <TableCell>₹{earning.amount}</TableCell>
                          <TableCell>
                            <Chip label={earning.status} color={getStatusColor(earning.status)} size="small" />
                          </TableCell>
                          <TableCell>{earning.orderId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Withdrawal History Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Withdrawal History</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Method</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {earnings.filter(e => e.type === 'withdrawal').map((withdrawal, index) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{withdrawal.date}</TableCell>
                          <TableCell>₹{withdrawal.amount}</TableCell>
                          <TableCell>
                            <Chip label={withdrawal.status} color={getStatusColor(withdrawal.status)} size="small" />
                          </TableCell>
                          <TableCell>Bank Transfer</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Earnings Analytics</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Total Earnings: ₹{getTotalEarnings()}
                </Typography>
                <Typography variant="body1">
                  Average per Day: ₹{(getTotalEarnings() / 30).toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  Average per Week: ₹{(getTotalEarnings() / 4).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawalDialogOpen} onClose={() => setWithdrawalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Withdrawal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleWithdrawal} variant="contained">Request</Button>
        </DialogActions>
      </Dialog>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading earnings data...</Typography>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

