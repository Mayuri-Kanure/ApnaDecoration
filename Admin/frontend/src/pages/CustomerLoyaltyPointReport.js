import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Alert,
  Snackbar,
  Avatar,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Balance as BalanceIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

function CustomerLoyaltyPointReport() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [page, setPage] = useState(0); // Start from page 0
  const [loyaltyStats, setLoyaltyStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    currentBalance: 0,
    transactionCount: 0
  });

  // Fetch loyalty points from API
  const fetchLoyaltyPoints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/loyalty-points', {
        params: {
          search: searchQuery,
          transactionType,
          page,
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTransactions(response.data.transactions || []);
      setLoyaltyStats(response.data.stats || loyaltyStats);
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    setPage(0); // Reset to first page on mount/filter change
    fetchLoyaltyPoints();
  }, [searchQuery, transactionType, page]);

  // Separate effect for page changes to avoid infinite loops
  useEffect(() => {
    fetchLoyaltyPoints();
  }, [page]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page
  };

  const handleTransactionTypeFilter = (event) => {
    setTransactionType(event.target.value);
    setPage(0); // Reset to first page
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transactionType: '',
    customer: ''
  });
  const [customers, setCustomers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const transactionTypes = [
    { value: '', label: 'All' },
    { value: 'credit', label: 'Credit' },
    { value: 'debit', label: 'Debit' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStartDate = !filters.startDate || transaction.createdAt >= filters.startDate;
    const matchesEndDate = !filters.endDate || transaction.createdAt <= filters.endDate;
    const matchesType = !filters.transactionType || 
      (filters.transactionType === 'credit' && transaction.credit > 0) ||
      (filters.transactionType === 'debit' && transaction.debit > 0);
    const matchesCustomer = !filters.customer || transaction.customerId === parseInt(filters.customer);
    
    return matchesStartDate && matchesEndDate && matchesType && matchesCustomer;
  });

  // Calculate summary totals
  const totalDebitPoints = filteredTransactions.reduce((sum, transaction) => sum + transaction.debit, 0);
  const totalCreditPoints = filteredTransactions.reduce((sum, transaction) => sum + transaction.credit, 0);
  const closingBalance = totalCreditPoints - totalDebitPoints;

  const handleFilter = () => {
    console.log('Filtering transactions:', filters);
    // API call to filter transactions
    setSnackbar({ open: true, message: 'Filters applied successfully', severity: 'success' });
  };

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      transactionType: '',
      customer: ''
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['SL', 'Transaction ID', 'Customer', 'Credit', 'Debit', 'Balance', 'Transaction Type', 'Reference', 'Created At'],
      ...filteredTransactions.map((transaction, index) => [
        index + 1,
        transaction.transactionId,
        transaction.customerName,
        transaction.credit,
        transaction.debit,
        transaction.balance,
        transaction.transactionType,
        transaction.reference,
        transaction.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loyalty-points-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Report exported successfully', severity: 'success' });
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'Order Place': return 'primary';
      case 'Purchase': return 'secondary';
      case 'Manual Adjust': return 'warning';
      case 'Redemption': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C3E50' }}>
          Customer Loyalty Point Report
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ 
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#45A049' },
            px: 3,
            py: 1
          }}
        >
          Export
        </Button>
      </Box>

      {/* Filter Options Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Filter Options</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filters.transactionType}
                  onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                  label="Transaction Type"
                >
                  {transactionTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={filters.customer}
                  onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                  label="Customer"
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleFilter}
                  startIcon={<FilterIcon />}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Filter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            backgroundColor: '#FFF3E0', 
            border: '1px solid #FFB74D',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <TrendingDownIcon sx={{ fontSize: 40, color: '#F57C00', mb: 1 }} />
              <Typography variant="h5" sx={{ color: '#F57C00', fontWeight: 600, mb: 0.5 }}>
                {totalDebitPoints.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#E65100' }}>Debit Points</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            backgroundColor: '#E3F2FD', 
            border: '1px solid #90CAF9',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#1976D2', mb: 1 }} />
              <Typography variant="h5" sx={{ color: '#1976D2', fontWeight: 600, mb: 0.5 }}>
                {totalCreditPoints.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1565C0' }}>Credit Points</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            backgroundColor: closingBalance >= 0 ? '#E8F5E8' : '#FFEBEE', 
            border: closingBalance >= 0 ? '1px solid #81C784' : '1px solid #EF9A9A',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <BalanceIcon sx={{ fontSize: 40, color: closingBalance >= 0 ? '#388E3C' : '#D32F2F', mb: 1 }} />
              <Typography variant="h5" sx={{ 
                color: closingBalance >= 0 ? '#388E3C' : '#D32F2F', 
                fontWeight: 600, 
                mb: 0.5 
              }}>
                {closingBalance.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: closingBalance >= 0 ? '#2E7D32' : '#B71C1C' }}>
                Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Transactions</Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Credit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Debit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ReceiptIcon sx={{ fontSize: 64, color: '#CCCCCC', mb: 2 }} />
                        <Typography variant="h6" color="#CCCCCC">No data found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction, index) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{transaction.transactionId}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#E3F2FD' }}>
                            <PersonIcon sx={{ fontSize: 16, color: '#1976D2' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {transaction.customerName}
                            </Typography>
                            <Typography variant="caption" color="#666">
                              {transaction.customerEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                          {transaction.credit > 0 ? transaction.credit.toLocaleString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 600 }}>
                          {transaction.debit > 0 ? transaction.debit.toLocaleString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                          {transaction.balance.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.transactionType}
                          color={getTransactionTypeColor(transaction.transactionType)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{transaction.reference}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{transaction.createdAt}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={loyaltyStats.transactionCount || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </CardContent>
      </Card>

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

export default CustomerLoyaltyPointReport;
