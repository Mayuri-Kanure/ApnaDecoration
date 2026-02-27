import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  Tabs,
  Tab,
  Pagination,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const emptySummary = {
  totalOrders: 0,
  inhouseOrders: 0,
  vendorOrders: 0,
  totalProducts: 0,
  inhouseProducts: 0,
  vendorProducts: 0,
  totalStores: 0
};

const emptyExpenseSummary = {
  totalExpense: 0,
  freeDelivery: 0,
  couponDiscount: 0
};

const LineChart = ({ data, label }) => (
  <Box sx={{ height: 240, p: 2, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
    {(Array.isArray(data) ? data : []).map((item, index) => {
      const maxVal = Math.max(1, ...(data || []).map((d) => Number(d[label] || 0)));
      return (
        <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              mx: 'auto',
              width: 8,
              height: `${(Number(item[label] || 0) / maxVal) * 180}px`,
              backgroundColor: '#1976d2',
              borderRadius: 1
            }}
          />
          <Typography variant="caption">{item.month}</Typography>
        </Box>
      );
    })}
  </Box>
);

const DonutChart = ({ data }) => {
  const items = Array.isArray(data) ? data : [];
  let cumulative = 0;
  const gradient = items.length
    ? `conic-gradient(${items
      .map((item) => {
        const start = cumulative;
        cumulative += Number(item.value || 0) * 3.6;
        return `${item.color || '#999'} ${start}deg ${cumulative}deg`;
      })
      .join(', ')})`
    : '#e0e0e0';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2 }}>
      <Box sx={{ width: 140, height: 140, borderRadius: '50%', background: gradient }} />
      <Box>
        {items.map((item, idx) => (
          <Typography key={idx} variant="body2">
            {item.name}: {Number(item.value || 0)}%
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const TransactionReport = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [orderStatus, setOrderStatus] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [expenseYear, setExpenseYear] = useState('thisYear');
  const [expenseData, setExpenseData] = useState([]);
  const [expenseStats, setExpenseStats] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(emptyExpenseSummary);

  const [refundDate, setRefundDate] = useState('all');
  const [refundCategory, setRefundCategory] = useState('all');
  const [refundSubCategory, setRefundSubCategory] = useState('all');
  const [refundBrand, setRefundBrand] = useState('all');
  const [refundSearchQuery, setRefundSearchQuery] = useState('');
  const [refundPage, setRefundPage] = useState(1);
  const [refundData, setRefundData] = useState([]);
  const [refundPagination, setRefundPagination] = useState({ current: 1, pages: 1, total: 0 });

  const [transactionData, setTransactionData] = useState([]);
  const [summaryData, setSummaryData] = useState(emptySummary);
  const [orderStatsData, setOrderStatsData] = useState([]);
  const [paymentStatsData, setPaymentStatsData] = useState([]);
  const [orderPagination, setOrderPagination] = useState({ current: 1, pages: 1, total: 0 });

  const orderStatuses = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' }
  ];

  const yearRanges = [
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' }
  ];

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('Missing auth token');
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadOrderTransactions = async () => {
    const response = await axios.get(`${API_BASE_URL}/transaction-report/orders`, {
      params: {
        status: orderStatus,
        customer: customerFilter,
        vendor: vendorFilter,
        dateRange,
        search: searchQuery,
        page,
        limit: 10
      },
      ...authHeaders()
    });
    setTransactionData(Array.isArray(response.data?.orders) ? response.data.orders : []);
    setSummaryData(response.data?.summary || emptySummary);
    setOrderStatsData(Array.isArray(response.data?.orderStats) ? response.data.orderStats : []);
    setPaymentStatsData(Array.isArray(response.data?.paymentStats) ? response.data.paymentStats : []);
    setOrderPagination(response.data?.pagination || { current: 1, pages: 1, total: 0 });
  };

  const loadExpenseTransactions = async () => {
    const response = await axios.get(`${API_BASE_URL}/transaction-report/expenses`, {
      params: { year: expenseYear },
      ...authHeaders()
    });
    setExpenseData(Array.isArray(response.data?.expenses) ? response.data.expenses : []);
    setExpenseSummary(response.data?.summary || emptyExpenseSummary);
    setExpenseStats(Array.isArray(response.data?.expenseStats) ? response.data.expenseStats : []);
  };

  const loadRefundTransactions = async () => {
    const response = await axios.get(`${API_BASE_URL}/transaction-report/refunds`, {
      params: {
        date: refundDate,
        category: refundCategory,
        subCategory: refundSubCategory,
        brand: refundBrand,
        search: refundSearchQuery,
        page: refundPage,
        limit: 10
      },
      ...authHeaders()
    });
    setRefundData(Array.isArray(response.data?.refunds) ? response.data.refunds : []);
    setRefundPagination(response.data?.pagination || { current: 1, pages: 1, total: 0 });
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 0) await loadOrderTransactions();
        if (activeTab === 1) await loadExpenseTransactions();
        if (activeTab === 2) await loadRefundTransactions();
      } catch (err) {
        console.error('Transaction report load error:', err);
        if (String(err?.message || '').includes('Missing auth token')) {
          setError('Session not found. Please login again.');
        } else {
          setError('Unable to load transaction report data.');
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [
    activeTab,
    orderStatus,
    customerFilter,
    vendorFilter,
    dateRange,
    searchQuery,
    page,
    expenseYear,
    refundDate,
    refundCategory,
    refundSubCategory,
    refundBrand,
    refundSearchQuery,
    refundPage
  ]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f7f8fc', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
        Transaction Report
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
            <Tab label="Order Transactions" />
            <Tab label="Expense Transactions" />
            <Tab label="Refund Transactions" />
          </Tabs>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && (
            <>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <Select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                          {orderStatuses.map((status) => (
                            <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <Select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
                          <MenuItem value="all">All Customers</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <Select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
                          <MenuItem value="all">All Vendors</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                          {dateRanges.map((range) => (
                            <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Order ID"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">Total Orders</Typography><Typography variant="h4">{summaryData.totalOrders}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">In-house Orders</Typography><Typography variant="h4">{summaryData.inhouseOrders}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">Vendor Orders</Typography><Typography variant="h4">{summaryData.vendorOrders}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">Total Products</Typography><Typography variant="h4">{summaryData.totalProducts}</Typography></CardContent></Card></Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}><Card><CardContent><Typography variant="h6">Order Statistics</Typography><LineChart data={orderStatsData} label="orders" /></CardContent></Card></Grid>
                <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Payment Statistics</Typography><DonutChart data={paymentStatsData} /></CardContent></Card></Grid>
              </Grid>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Total Transactions</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>SL</TableCell>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Shop Name</TableCell>
                          <TableCell>Customer Name</TableCell>
                          <TableCell align="right">Total Product Amount</TableCell>
                          <TableCell align="right">Product Discount</TableCell>
                          <TableCell align="right">Coupon Discount</TableCell>
                          <TableCell align="right">Discounted Amount</TableCell>
                          <TableCell align="right">VAT/TAX</TableCell>
                          <TableCell align="right">Shipping Charge</TableCell>
                          <TableCell align="right">Order Amount</TableCell>
                          <TableCell>Delivered By</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactionData.map((row, index) => (
                          <TableRow key={row.id || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.orderId}</TableCell>
                            <TableCell>{row.shopName}</TableCell>
                            <TableCell>{row.customerName}</TableCell>
                            <TableCell align="right">${Number(row.totalProductAmount || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">-${Number(row.productDiscount || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">-${Number(row.couponDiscount || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">${Number(row.discountedAmount || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">${Number(row.vatTax || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">${Number(row.shippingCharge || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">${Number(row.orderAmount || 0).toFixed(2)}</TableCell>
                            <TableCell>{row.deliveredBy}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Pagination
                      count={Math.max(1, Number(orderPagination.pages || 1))}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <Select value={expenseYear} onChange={(e) => setExpenseYear(e.target.value)}>
                          {yearRanges.map((range) => (
                            <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button variant="contained" startIcon={<FilterIcon />} onClick={loadExpenseTransactions}>Filter</Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}><Card><CardContent><Typography variant="body2">Total Expense</Typography><Typography variant="h4">Rs {Number(expenseSummary.totalExpense || 0).toFixed(2)}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} md={4}><Card><CardContent><Typography variant="body2">Free Delivery</Typography><Typography variant="h4">Rs {Number(expenseSummary.freeDelivery || 0).toFixed(2)}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} md={4}><Card><CardContent><Typography variant="body2">Coupon Discount</Typography><Typography variant="h4">Rs {Number(expenseSummary.couponDiscount || 0).toFixed(2)}</Typography></CardContent></Card></Grid>
              </Grid>

              <Card>
                <CardContent>
                  <Typography variant="h6">Expense Statistics</Typography>
                  <LineChart data={expenseStats} label="expense" />
                  {expenseData.length === 0 && <Typography variant="body2" color="text.secondary">No expense transactions found</Typography>}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 2 && (
            <>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <Select value={refundDate} onChange={(e) => setRefundDate(e.target.value)}>
                          <MenuItem value="all">All Dates</MenuItem>
                          {dateRanges.map((range) => (
                            <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField size="small" value={refundCategory} onChange={(e) => setRefundCategory(e.target.value)} label="Category" fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField size="small" value={refundSubCategory} onChange={(e) => setRefundSubCategory(e.target.value)} label="Sub Category" fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField size="small" value={refundBrand} onChange={(e) => setRefundBrand(e.target.value)} label="Brand" fullWidth />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        size="small"
                        value={refundSearchQuery}
                        onChange={(e) => setRefundSearchQuery(e.target.value)}
                        placeholder="Search refunds"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Refund Transactions</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>SL</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Refund ID</TableCell>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Shop Name</TableCell>
                          <TableCell>Payment Method</TableCell>
                          <TableCell>Paid By</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Transaction Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {refundData.map((row, index) => (
                          <TableRow key={row.id || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.productName}</TableCell>
                            <TableCell>{row.refundId}</TableCell>
                            <TableCell>{row.orderId}</TableCell>
                            <TableCell>{row.shopName}</TableCell>
                            <TableCell>{row.paymentMethod}</TableCell>
                            <TableCell>{row.paidBy}</TableCell>
                            <TableCell align="right">${Number(row.amount || 0).toFixed(2)}</TableCell>
                            <TableCell>{row.transactionType}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Pagination
                      count={Math.max(1, Number(refundPagination.pages || 1))}
                      page={refundPage}
                      onChange={(e, value) => setRefundPage(value)}
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

export default TransactionReport;
