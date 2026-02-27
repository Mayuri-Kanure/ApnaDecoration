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
  AccountBalanceWallet,
  History,
  Refresh,
  Add,
  CheckCircle,
  Pending,
  Error,
  Schedule
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`withdrawal-tabpanel-${index}`}
      aria-labelledby={`withdrawal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function WithdrawalPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank_transfer');
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [withdrawalStats, setWithdrawalStats] = useState({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalAmount: 0
  });

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('deliveryBoyToken');
    if (!token) {
      router.push('/delivery-boy/login');
      return;
    }
    
    // Load withdrawal data
    loadWithdrawalHistory();
    loadWithdrawalStats();
  }, []);

  const loadWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_DELIVERY_API_URL}/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawalHistory(response.data);
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
      // Use mock data for demo
      setWithdrawalHistory([
        {
          id: 'WD-001',
          date: '2026-02-20',
          amount: 1000,
          method: 'bank_transfer',
          status: 'completed',
          transactionId: 'TXN123456789',
          processingDate: '2026-02-20',
          completedDate: '2026-02-21',
          bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank',
            accountHolderName: 'John Doe'
          }
        },
        {
          id: 'WD-002',
          date: '2026-02-15',
          amount: 500,
          method: 'upi',
          status: 'completed',
          transactionId: 'UPI987654321',
          processingDate: '2026-02-15',
          completedDate: '2026-02-16',
          upiDetails: {
            upiId: 'john@upi',
            holderName: 'John Doe'
          }
        },
        {
          id: 'WD-003',
          date: '2026-02-10',
          amount: 750,
          method: 'bank_transfer',
          status: 'pending',
          transactionId: null,
          processingDate: '2026-02-10',
          completedDate: null,
          bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank',
            accountHolderName: 'John Doe'
          }
        }
      ]);
    }
    setLoading(false);
  };

  const loadWithdrawalStats = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_DELIVERY_API_URL}/withdrawals/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawalStats(response.data);
    } catch (error) {
      console.error('Error loading withdrawal stats:', error);
      // Use mock data for demo
      setWithdrawalStats({
        totalWithdrawals: 3,
        pendingWithdrawals: 1,
        completedWithdrawals: 2,
        rejectedWithdrawals: 0,
        totalAmount: 2250
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('deliveryBoyToken');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_DELIVERY_API_URL}/withdrawal`, {
        amount: parseFloat(withdrawalAmount),
        method: withdrawalMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Withdrawal request submitted!', severity: 'success' });
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount('');
      loadWithdrawalHistory();
      loadWithdrawalStats();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      setSnackbar({ open: true, message: 'Error creating withdrawal request', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  };

  const getFilteredWithdrawals = () => {
    if (tabValue === 0) return withdrawalHistory;
    if (tabValue === 1) return withdrawalHistory.filter(w => w.status === 'pending');
    if (tabValue === 2) return withdrawalHistory.filter(w => w.status === 'completed');
    return withdrawalHistory;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#1e3a5f', color: 'white', p: 2, mb: 3 }}>
        <Typography variant="h6">Withdrawal Management</Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#2d5a8c', color: 'white' }}>
            <CardContent>
                  <Typography variant="h6">Total Withdrawals</Typography>
                  <Typography variant="h4">{withdrawalStats.totalWithdrawals}</Typography>
                  <History sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ backgroundColor: '#FF9800', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Pending Withdrawals</Typography>
                  <Typography variant="h4">{withdrawalStats.pendingWithdrawals}</Typography>
                  <Pending sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ backgroundColor: '#9C27B0', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h4">₹{withdrawalStats.totalAmount}</Typography>
                  <AccountBalanceWallet sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

      {/* Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setWithdrawalDialogOpen(true)}
            fullWidth
          >
            Request Withdrawal
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => {
              loadWithdrawalHistory();
              loadWithdrawalStats();
            }}
            fullWidth
          >
            Refresh Data
          </Button>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="withdrawal tabs">
          <Tab icon={<History />} label="All Withdrawals" />
          <Tab icon={<Pending />} label="Pending" />
          <Tab icon={<CheckCircle />} label="Completed" />
        </Tabs>
      </Box>

      {/* Withdrawal History */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>All Withdrawals</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredWithdrawals().map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{withdrawal.date}</TableCell>
                          <TableCell>₹{withdrawal.amount}</TableCell>
                          <TableCell>
                            <Chip label={withdrawal.method} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={withdrawal.status} color={getStatusColor(withdrawal.status)} size="small" />
                          </TableCell>
                          <TableCell>
                            {withdrawal.transactionId || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => setSelectedWithdrawal(withdrawal)}
                              size="small"
                            >
                              <Info />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Withdrawal Request Dialog */}
      <Dialog open={withdrawalDialogOpen} onClose={() => setWithdrawalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Withdrawal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#1e3a5f' }}>Withdrawal Method</Typography>
              <Select
                value={withdrawalMethod}
                onChange={(e) => setWithdrawalMethod(e.target.value)}
                fullWidth
              >
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="paytm">PayTM</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleWithdrawalRequest} variant="contained">Request</Button>
        </DialogActions>
      </Dialog>

      {/* Withdrawal Details Dialog */}
      <Dialog open={Boolean(selectedWithdrawal)} onClose={() => setSelectedWithdrawal(null)} maxWidth="md" fullWidth>
        <DialogTitle>Withdrawal Details</DialogTitle>
        <DialogContent>
          {selectedWithdrawal && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Withdrawal ID</Typography>
                <Typography variant="body1">{selectedWithdrawal.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Date</Typography>
                <Typography variant="body1">{selectedWithdrawal.date}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Amount</Typography>
                <Typography variant="body1">₹{selectedWithdrawal.amount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Method</Typography>
                <Typography variant="body1">{selectedWithdrawal.method}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip label={selectedWithdrawal.status} color={getStatusColor(selectedWithdrawal.status)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Transaction ID</Typography>
                <Typography variant="body1">{selectedWithdrawal.transactionId || 'N/A'}</Typography>
              </Grid>
              {selectedWithdrawal.bankDetails && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Bank Name</Typography>
                    <Typography variant="body1">{selectedWithdrawal.bankDetails.bankName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Account Number</Typography>
                    <Typography variant="body1">{selectedWithdrawal.bankDetails.accountNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">IFSC Code</Typography>
                    <Typography variant="body1">{selectedWithdrawal.bankDetails.ifscCode}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Account Holder Name</Typography>
                    <Typography variant="body1">{selectedWithdrawal.bankDetails.accountHolderName}</Typography>
                  </Grid>
                </>
              )}
              {selectedWithdrawal.upiDetails && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">UPI ID</Typography>
                    <Typography variant="body1">{selectedWithdrawal.upiDetails.upiId}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Holder Name</Typography>
                    <Typography variant="body1">{selectedWithdrawal.upiDetails.holderName}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedWithdrawal(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading withdrawal data...</Typography>
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

