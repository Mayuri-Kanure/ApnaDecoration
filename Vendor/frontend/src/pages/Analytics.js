import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import vendorApi from "../services/vendorApi";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(30);
  
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [products, setProducts] = useState(null);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, [period]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 Fetching analytics...");

      const [dashRes, revRes, prodRes, earnRes] = await Promise.all([
        vendorApi.getVendorAnalytics().catch(e => ({ error: e.message })),
        vendorApi.getRevenueAnalytics(period).catch(e => ({ error: e.message })),
        vendorApi.getProductSalesAnalytics(period).catch(e => ({ error: e.message })),
        vendorApi.getEarningsSummary().catch(e => ({ error: e.message })),
      ]);

      console.log("📊 Responses:", { dashRes, revRes, prodRes, earnRes });

      setDashboard(dashRes?.data || dashRes || null);
      setRevenue(Array.isArray(revRes?.data) ? revRes.data : Array.isArray(revRes) ? revRes : []);
      setProducts(Array.isArray(prodRes?.data) ? prodRes.data : Array.isArray(prodRes) ? prodRes : []);
      setEarnings((earnRes?.data || earnRes) || {});

    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllAnalytics();
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(parseFloat(num) || 0);
  };

  const safeToFixed = (value, digits = 1) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0" : num.toFixed(digits);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={handleRefresh} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1e293b" }}>
          📊 Analytics Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period (Days)</InputLabel>
            <Select value={period} label="Period (Days)" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={60}>Last 60 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleRefresh}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <MoneyIcon sx={{ fontSize: 40, color: "#2F66FF" }} />
                <Box>
                  <Typography variant="body2" color="#64748b">Today's Revenue</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#2F66FF">
                    {formatCurrency(dashboard?.todayRevenue || 0)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <OrdersIcon sx={{ fontSize: 40, color: "#28C76F" }} />
                <Box>
                  <Typography variant="body2" color="#64748b">Total Orders</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#28C76F">
                    {formatNumber(dashboard?.totalOrders || 0)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <OrdersIcon sx={{ fontSize: 40, color: "#FF9F43" }} />
                <Box>
                  <Typography variant="body2" color="#64748b">Pending Orders</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#FF9F43">
                    {formatNumber(dashboard?.pendingOrders || 0)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <InventoryIcon sx={{ fontSize: 40, color: "#EA5455" }} />
                <Box>
                  <Typography variant="body2" color="#64748b">Low Stock Items</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#EA5455">
                    {formatNumber(dashboard?.lowStockProducts || 0)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Revenue & Earnings */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        {revenue && revenue.length > 0 && (
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Revenue Trend ({period} days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2F66FF"
                    strokeWidth={2}
                    name="Daily Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {/* Earnings Summary */}
        {earnings && typeof earnings === "object" && (
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Earnings Summary
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="#64748b">This Month</Typography>
                  <Typography variant="h6" fontWeight="bold" color="#28C76F">
                    {formatCurrency(earnings?.thisMonth || 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="#64748b">Last Month</Typography>
                  <Typography variant="body1" color="#64748b">
                    {formatCurrency(earnings?.lastMonth || 0)}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 1, border: "1px solid #86efac" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {parseFloat(earnings?.growth || 0) > 0 ? (
                      <TrendingUpIcon sx={{ color: "#28C76F" }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: "#EA5455" }} />
                    )}
                    <Box>
                      <Typography variant="body2" color="#64748b">Growth</Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={parseFloat(earnings?.growth || 0) > 0 ? "#28C76F" : "#EA5455"}
                      >
                        {parseFloat(earnings?.growth || 0) > 0 ? "+" : ""}
                        {safeToFixed(earnings?.growth, 1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Top Products */}
      {products && products.length > 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 4 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              🔥 Top Performing Products ({period} days)
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Units Sold</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Avg Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.slice(0, 10).map((product, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Typography variant="body2">{product?.name || "N/A"}</Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(product?.unitsSold || 0)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="#2F66FF">
                        {formatCurrency(product?.revenue || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(product?.avgPrice || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Total Products */}
      {dashboard && (
        <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="body2" color="#64748b">Total Active Products</Typography>
              <Typography variant="h5" fontWeight="bold" color="#2F66FF">
                {formatNumber(dashboard?.totalProducts || 0)}
              </Typography>
            </Box>
            <InventoryIcon sx={{ fontSize: 50, color: "#2F66FF", opacity: 0.2 }} />
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default Analytics;
