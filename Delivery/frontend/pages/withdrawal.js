import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { DELIVERY_API_URL } from "../config/constants";
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
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AttachMoney,
  AccountBalanceWallet,
  History,
  Refresh,
  Add,
  CheckCircle,
  Pending,
  Error,
  Schedule,
  Info,
} from "@mui/icons-material";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`withdrawal-tabpanel-${index}`}
      aria-labelledby={`withdrawal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1.5, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export default function WithdrawalPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("bank_transfer");
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [withdrawalStats, setWithdrawalStats] = useState({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem("deliveryBoyToken");
    if (!token) {
      router.push("/delivery-boy/login");
      return;
    }

    // Load withdrawal data
    loadWithdrawalHistory();
    loadWithdrawalStats();
  }, []);

  const loadWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      const response = await axios.get(`${DELIVERY_API_URL}/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response - Withdrawal History:", response.data);
      // Temporarily set empty data to test "no data" UI
      // setWithdrawalHistory(response.data);
      setWithdrawalHistory([]); // Uncomment this line to test empty state
    } catch (error) {
      console.error("Error loading withdrawal history:", error);
      setWithdrawalHistory([]);
      setSnackbar({
        open: true,
        message: "Failed to load withdrawal data",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const loadWithdrawalStats = async () => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      const response = await axios.get(
        `${DELIVERY_API_URL}/withdrawals/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("API Response - Withdrawal Stats:", response.data);
      // Temporarily set total withdrawals to 0 to test "no data" UI
      // setWithdrawalStats(response.data);
      setWithdrawalStats({
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        completedWithdrawals: 0,
        rejectedWithdrawals: 0,
        totalAmount: 0,
      }); // Uncomment this line to test empty state
    } catch (error) {
      console.error("Error loading withdrawal stats:", error);
      setWithdrawalStats({
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        completedWithdrawals: 0,
        rejectedWithdrawals: 0,
        totalAmount: 0,
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setSnackbar({
        open: true,
        message: "Please enter a valid amount",
        severity: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("deliveryBoyToken");
      const response = await axios.post(
        `${DELIVERY_API_URL}/withdrawals`,
        {
          amount: parseFloat(withdrawalAmount),
          method: withdrawalMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSnackbar({
        open: true,
        message: "Withdrawal request submitted!",
        severity: "success",
      });
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount("");
      loadWithdrawalHistory();
      loadWithdrawalStats();
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      setSnackbar({
        open: true,
        message: "Error creating withdrawal request",
        severity: "error",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      case "processing":
        return "info";
      default:
        return "default";
    }
  };

  const getFilteredWithdrawals = () => {
    if (tabValue === 0) return withdrawalHistory;
    if (tabValue === 1)
      return withdrawalHistory.filter((w) => w.status === "pending");
    if (tabValue === 2)
      return withdrawalHistory.filter((w) => w.status === "completed");
    return withdrawalHistory;
  };

  return (
    <Box
      sx={{
        pt: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 3 },
        backgroundColor: "#F5F5F5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#1e3a5f",
          color: "white",
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6">Withdrawal Management</Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#2d5a8c", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Total Withdrawals</Typography>
              <Typography variant="h4">
                {withdrawalStats.totalWithdrawals}
              </Typography>
              <History sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#FF9800", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Pending Withdrawals</Typography>
              <Typography variant="h4">
                {withdrawalStats.pendingWithdrawals}
              </Typography>
              <Pending sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#9C27B0", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Total Amount</Typography>
              <Typography variant="h4">
                ₹{withdrawalStats.totalAmount}
              </Typography>
              <AccountBalanceWallet sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#4CAF50", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Completed Withdrawals</Typography>
              <Typography variant="h4">
                {withdrawalStats.completedWithdrawals}
              </Typography>
              <CheckCircle sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setWithdrawalDialogOpen(true)}
              fullWidth
              sx={{ flex: 1 }}
            >
              Request Withdrawal
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                loadWithdrawalHistory();
                loadWithdrawalStats();
              }}
              fullWidth
              sx={{ flex: 1 }}
            >
              Refresh Data
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "white",
          borderRadius: 2,
          px: 1,
          mb: 2,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="withdrawal tabs"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            px: { xs: 1, sm: 0 },
            "& .MuiTab-root": {
              color: "#64748b",
              fontWeight: 500,
              minHeight: 60,
              fontSize: { xs: "12px", sm: "14px" },
            },
            "& .MuiTab-root.Mui-selected": {
              color: "#2F66FF",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#2F66FF",
              height: 3,
            },
          }}
        >
          <Tab icon={<History />} label="All Withdrawals" />
          <Tab icon={<Pending />} label="Pending" />
          <Tab icon={<CheckCircle />} label="Completed" />
        </Tabs>
      </Box>

      {/* Withdrawal History */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Withdrawals
            </Typography>
            {getFilteredWithdrawals().length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  textAlign: "center",
                }}
              >
                <AccountBalanceWallet
                  sx={{ fontSize: 64, color: "#ccc", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No withdrawal data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabValue === 1
                    ? "No pending withdrawals at the moment"
                    : tabValue === 2
                      ? "No completed withdrawals yet"
                      : "No withdrawals found"}
                </Typography>
              </Box>
            ) : isMobile ? (
              <Box>
                {getFilteredWithdrawals().map((withdrawal) => (
                  <Card
                    key={withdrawal.id}
                    sx={{ mb: 2, p: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        ₹{withdrawal.amount}
                      </Typography>
                      <Chip
                        label={withdrawal.status}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {withdrawal.date}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        label={withdrawal.method}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                      <IconButton
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        size="small"
                      >
                        <Info />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            ) : (
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
                          <Chip
                            label={withdrawal.method}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={withdrawal.status}
                            color={getStatusColor(withdrawal.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {withdrawal.transactionId || "N/A"}
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
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Pending Withdrawals */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Pending Withdrawals
            </Typography>
            {getFilteredWithdrawals().length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  textAlign: "center",
                }}
              >
                <AccountBalanceWallet
                  sx={{ fontSize: 64, color: "#ccc", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No withdrawal data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabValue === 1
                    ? "No pending withdrawals at the moment"
                    : tabValue === 2
                      ? "No completed withdrawals yet"
                      : "No withdrawals found"}
                </Typography>
              </Box>
            ) : isMobile ? (
              <Box>
                {getFilteredWithdrawals().map((withdrawal) => (
                  <Card
                    key={withdrawal.id}
                    sx={{ mb: 2, p: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        ₹{withdrawal.amount}
                      </Typography>
                      <Chip
                        label={withdrawal.status}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {withdrawal.date}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        label={withdrawal.method}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                      <IconButton
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        size="small"
                      >
                        <Info />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            ) : (
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
                          <Chip
                            label={withdrawal.method}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={withdrawal.status}
                            color={getStatusColor(withdrawal.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {withdrawal.transactionId || "N/A"}
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
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Completed Withdrawals */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Completed Withdrawals
            </Typography>
            {getFilteredWithdrawals().length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  textAlign: "center",
                }}
              >
                <AccountBalanceWallet
                  sx={{ fontSize: 64, color: "#ccc", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No withdrawal data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabValue === 1
                    ? "No pending withdrawals at the moment"
                    : tabValue === 2
                      ? "No completed withdrawals yet"
                      : "No withdrawals found"}
                </Typography>
              </Box>
            ) : isMobile ? (
              <Box>
                {getFilteredWithdrawals().map((withdrawal) => (
                  <Card
                    key={withdrawal.id}
                    sx={{ mb: 2, p: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        ₹{withdrawal.amount}
                      </Typography>
                      <Chip
                        label={withdrawal.status}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {withdrawal.date}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        label={withdrawal.method}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                      <IconButton
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        size="small"
                      >
                        <Info />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            ) : (
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
                          <Chip
                            label={withdrawal.method}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={withdrawal.status}
                            color={getStatusColor(withdrawal.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {withdrawal.transactionId || "N/A"}
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
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Withdrawal Request Dialog */}
      <Dialog
        open={withdrawalDialogOpen}
        onClose={() => setWithdrawalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
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
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#1e3a5f" }}>
                Withdrawal Method
              </Typography>
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
          <Button onClick={handleWithdrawalRequest} variant="contained">
            Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdrawal Details Dialog */}
      <Dialog
        open={Boolean(selectedWithdrawal)}
        onClose={() => setSelectedWithdrawal(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
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
                <Typography variant="body1">
                  {selectedWithdrawal.date}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Amount</Typography>
                <Typography variant="body1">
                  ₹{selectedWithdrawal.amount}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Method</Typography>
                <Typography variant="body1">
                  {selectedWithdrawal.method}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={selectedWithdrawal.status}
                  color={getStatusColor(selectedWithdrawal.status)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Transaction ID</Typography>
                <Typography variant="body1">
                  {selectedWithdrawal.transactionId || "N/A"}
                </Typography>
              </Grid>
              {selectedWithdrawal.bankDetails && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Bank Name</Typography>
                    <Typography variant="body1">
                      {selectedWithdrawal.bankDetails.bankName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Account Number</Typography>
                    <Typography variant="body1">
                      {selectedWithdrawal.bankDetails.accountNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">IFSC Code</Typography>
                    <Typography variant="body1">
                      {selectedWithdrawal.bankDetails.ifscCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">
                      Account Holder Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedWithdrawal.bankDetails.accountHolderName}
                    </Typography>
                  </Grid>
                </>
              )}
              {selectedWithdrawal.upiDetails && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">UPI ID</Typography>
                    <Typography variant="body1">
                      {selectedWithdrawal.upiDetails.upiId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Holder Name</Typography>
                    <Typography variant="body1">
                      {selectedWithdrawal.upiDetails.holderName}
                    </Typography>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 4,
          }}
        >
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading withdrawal data...
          </Typography>
        </Box>
      )}

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
