import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  TablePagination,
  Alert,
  Snackbar,
  Avatar,
} from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Balance as BalanceIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://admin-api.apnadecoration.com/api";

function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [page, setPage] = useState(0); // Start from page 0
  const [walletStats, setWalletStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    currentBalance: 0,
    transactionCount: 0,
  });

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    transactionType: "",
    customer: "",
  });
  const [customers, setCustomers] = useState([]);
  const [addFundDialogOpen, setAddFundDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundReference, setFundReference] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch wallet transactions from API
  const fetchWalletTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {
        search: searchQuery,
        transactionType: transactionType !== "all" ? transactionType : "",
        page,
        limit: 10,
      };

      // Add date filters if present
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.customer) params.customerId = filters.customer;

      const response = await axios.get(`${API_BASE_URL}/wallet`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(response.data.transactions || []);
      setWalletStats(response.data.stats || walletStats);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    setPage(0); // Reset to first page on mount/filter change
    fetchWalletTransactions();
  }, [
    searchQuery,
    transactionType,
    page,
    filters.dateFrom,
    filters.dateTo,
    filters.customer,
  ]);

  // Separate effect for page changes to avoid infinite loops
  useEffect(() => {
    fetchWalletTransactions();
  }, [page]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page
  };

  const handleFilter = () => {
    setPage(0); // Reset to first page
    fetchWalletTransactions();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const transactionTypes = [
    { value: "", label: "All" },
    { value: "Add", label: "Add" },
    { value: "Deduct", label: "Deduct" },
    { value: "Order Payment", label: "Order Payment" },
    { value: "Refund", label: "Refund" },
    { value: "Penalty", label: "Penalty" },
  ];

  // Remove client-side filtering since backend handles it
  const filteredTransactions = transactions;

  // Use stats from backend instead of calculating
  const totalDebit = walletStats.totalDebit || 0;
  const totalCredit = walletStats.totalCredit || 0;
  const closingBalance = walletStats.currentBalance || 0;

  const handleReset = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      transactionType: "",
      customer: "",
    });
  };

  const handleAddFund = async () => {
    if (!selectedCustomer || !fundAmount) {
      setSnackbar({
        open: true,
        message: "Please select customer and enter amount",
        severity: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/wallet`,
        {
          customerId: selectedCustomer,
          credit: parseFloat(fundAmount),
          debit: 0,
          transactionType: "Add",
          reference: fundReference || "Admin added funds",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAddFundDialogOpen(false);
      setSelectedCustomer("");
      setFundAmount("");
      setFundReference("");
      setSnackbar({
        open: true,
        message: "Funds added successfully",
        severity: "success",
      });

      // Refresh transactions
      fetchWalletTransactions();
    } catch (error) {
      console.error("Error adding fund:", error);
      setSnackbar({
        open: true,
        message: "Error adding funds",
        severity: "error",
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      [
        "SL",
        "Transaction ID",
        "Customer",
        "Credit",
        "Debit",
        "Balance",
        "Transaction Type",
        "Reference",
        "Created At",
      ],
      ...filteredTransactions.map((transaction, index) => [
        index + 1,
        transaction.transactionId,
        transaction.customerName,
        transaction.credit,
        transaction.debit,
        transaction.balance,
        transaction.transactionType,
        transaction.reference,
        transaction.createdAt,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallet-transactions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#F8F9FB", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WalletIcon sx={{ fontSize: 32, color: "#1976D2" }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#2C3E50" }}>
            Wallet
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddFundDialogOpen(true)}
          sx={{
            backgroundColor: "#1976D2",
            "&:hover": { backgroundColor: "#1565C0" },
            px: 3,
            py: 1,
          }}
        >
          Add Fund
        </Button>
      </Box>

      {/* Filter Options Section */}
      <Card
        sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Filter Options
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date From"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date To"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filters.transactionType}
                  onChange={(e) =>
                    setFilters({ ...filters, transactionType: e.target.value })
                  }
                  label="Transaction Type"
                >
                  {transactionTypes.map((type) => (
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
                  onChange={(e) =>
                    setFilters({ ...filters, customer: e.target.value })
                  }
                  label="Customer"
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Box sx={{ display: "flex", gap: 1 }}>
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
          <Card
            sx={{
              backgroundColor: "#FFF3E0",
              border: "1px solid #FFB74D",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <TrendingDownIcon
                sx={{ fontSize: 40, color: "#F57C00", mb: 1 }}
              />
              <Typography
                variant="h5"
                sx={{ color: "#F57C00", fontWeight: 600, mb: 0.5 }}
              >
                {formatCurrency(totalDebit)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#E65100" }}>
                Debit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: "#E3F2FD",
              border: "1px solid #90CAF9",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: "#1976D2", mb: 1 }} />
              <Typography
                variant="h5"
                sx={{ color: "#1976D2", fontWeight: 600, mb: 0.5 }}
              >
                {formatCurrency(totalCredit)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#1565C0" }}>
                Credit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: "#E8F5E8",
              border: "1px solid #81C784",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <BalanceIcon sx={{ fontSize: 40, color: "#388E3C", mb: 1 }} />
              <Typography
                variant="h5"
                sx={{ color: "#388E3C", fontWeight: 600, mb: 0.5 }}
              >
                {formatCurrency(closingBalance)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#2E7D32" }}>
                Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Transactions
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ backgroundColor: "#4CAF50", "&:hover": { backgroundColor: "#45A049" } }}
            >
              Export
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F5F5F5" }}>
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
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 8 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <ReceiptIcon
                          sx={{ fontSize: 64, color: "#CCCCCC", mb: 2 }}
                        />
                        <Typography variant="h6" color="#CCCCCC">
                          No data found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction, index) => (
                      <TableRow key={transaction.id || `transaction-${index}`} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar
                              sx={{ width: 32, height: 32, backgroundColor: "#E3F2FD" }}
                            >
                              <PersonIcon sx={{ fontSize: 16, color: "#1976D2" }} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {transaction.customerName}
                              </Typography>
                              <Typography variant="caption" color="#666">
                                {transaction.customerEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: "#4CAF50", fontWeight: 600 }}
                          >
                            {transaction.credit > 0
                              ? formatCurrency(transaction.credit)
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: "#F44336", fontWeight: 600 }}
                          >
                            {transaction.debit > 0
                              ? formatCurrency(transaction.debit)
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1976D2" }}
                          >
                            {formatCurrency(transaction.balance)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.transactionType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 150,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {transaction.reference}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {transaction.createdAt}
                          </Typography>
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
              count={walletStats.transactionCount || 0}
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

      {/* Add Fund Dialog */}
      <Dialog
        open={addFundDialogOpen}
        onClose={() => setAddFundDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Fund to Customer Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Customer</InputLabel>
              <Select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                label="Select Customer"
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Amount"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Reference (Optional)"
              value={fundReference}
              onChange={(e) => setFundReference(e.target.value)}
              placeholder="Add a note for this transaction"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFundDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFund} variant="contained">
            Add Fund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Wallet;
