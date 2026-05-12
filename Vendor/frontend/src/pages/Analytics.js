import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  BarChart as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import ReviewsRatings from "../components/ReviewsRatings";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import vendorApi from "../services/vendorApi";

const Analytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 Fetching vendor analytics...");

      const response = await vendorApi.getVendorAnalytics();
      console.log("📊 Vendor analytics response:", response);

      if (response && response.success) {
        setAnalyticsData(response.data);
      } else if (response && response.data) {
        // Handle direct data response
        setAnalyticsData(response.data);
      } else {
        console.error("❌ Unexpected analytics response format:", response);
        setError("Failed to load analytics data");
      }
    } catch (error) {
      console.error("❌ Error fetching vendor analytics:", error);

      // Check if it's a "not implemented" error
      if (error.message && error.message.includes("501")) {
        setError("Analytics feature is not available yet");
      } else {
        setError("Failed to load analytics data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Chart data preparation
  const prepareLineChartData = () => {
    if (!analyticsData?.monthlySales) return [];
    return analyticsData.monthlySales.map((month) => ({
      month: month.month,
      revenue: month.revenue,
      orders: month.orders,
    }));
  };

  const preparePieChartData = () => {
    if (!analyticsData?.stats) return [];
    const { stats } = analyticsData;
    return [
      { name: "Delivered", value: stats.deliveredOrders, color: "#28C76F" },
      { name: "Processing", value: stats.processingOrders, color: "#FF9F43" },
      { name: "Shipped", value: stats.shippedOrders, color: "#2F66FF" },
      { name: "Pending", value: stats.pendingOrders, color: "#EA5455" },
    ];
  };

  // Prepare earnings data for payments overview
  const prepareEarningsData = () => {
    if (!analyticsData?.monthlySales)
      return {
        totalEarnings: 0,
        pendingPayments: 0,
        completedPayments: 0,
        averageOrderValue: 0,
      };

    const totalRevenue = analyticsData.monthlySales.reduce(
      (sum, month) => sum + month.revenue,
      0,
    );
    const totalOrders = analyticsData.monthlySales.reduce(
      (sum, month) => sum + month.orders,
      0,
    );
    const pendingPayments = totalRevenue * 0.15; // Assume 15% pending
    const completedPayments = totalRevenue * 0.85; // Assume 85% completed
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalEarnings: totalRevenue,
      pendingPayments,
      completedPayments,
      averageOrderValue,
    };
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No analytics data available</Alert>
      </Box>
    );
  }

  const { stats, monthlySales, topProducts, lowStockProducts } = analyticsData;
  const lineChartData = prepareLineChartData();
  const pieChartData = preparePieChartData();
  const earningsData = prepareEarningsData();

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1e293b" }}>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <MoneyIcon sx={{ fontSize: 40, color: "#2F66FF", mb: 1 }} />
            <Typography variant="h4" color="#2F66FF" fontWeight="bold">
              {formatCurrency(stats.totalRevenue)}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Total Revenue
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <OrdersIcon sx={{ fontSize: 40, color: "#28C76F", mb: 1 }} />
            <Typography variant="h4" color="#28C76F" fontWeight="bold">
              {stats.totalOrders}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Total Orders
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <InventoryIcon sx={{ fontSize: 40, color: "#FF9F43", mb: 1 }} />
            <Typography variant="h4" color="#FF9F43" fontWeight="bold">
              {stats.approvedProducts}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Active Products
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <AnalyticsIcon sx={{ fontSize: 40, color: "#EA5455", mb: 1 }} />
            <Typography variant="h4" color="#EA5455" fontWeight="bold">
              {stats.lowStockAlerts}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Low Stock Alerts
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Earnings & Payments Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TrendingUpIcon />
              Earnings Overview
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="#64748b">
                  Total Earnings
                </Typography>
                <Typography variant="h6" color="#2F66FF" fontWeight="bold">
                  {formatCurrency(earningsData.totalEarnings)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="#64748b">
                  Completed Payments
                </Typography>
                <Typography variant="body1" color="#28C76F" fontWeight="bold">
                  {formatCurrency(earningsData.completedPayments)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="#64748b">
                  Pending Payments
                </Typography>
                <Typography variant="body1" color="#FF9F43" fontWeight="bold">
                  {formatCurrency(earningsData.pendingPayments)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="#64748b">
                  Avg Order Value
                </Typography>
                <Typography variant="body1" color="#EA5455" fontWeight="bold">
                  {formatCurrency(earningsData.averageOrderValue)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Payment Status
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">Completed</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 100,
                      bgcolor: "#e0e7ff",
                      borderRadius: 1,
                      height: 8,
                    }}
                  >
                    <Box
                      sx={{
                        width: "85%",
                        bgcolor: "#28C76F",
                        borderRadius: 1,
                        height: 8,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="#28C76F" fontWeight="bold">
                    85%
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">Pending</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 100,
                      bgcolor: "#e0e7ff",
                      borderRadius: 1,
                      height: 8,
                    }}
                  >
                    <Box
                      sx={{
                        width: "15%",
                        bgcolor: "#FF9F43",
                        borderRadius: 1,
                        height: 8,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="#FF9F43" fontWeight="bold">
                    15%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  color="#64748b"
                  sx={{ textAlign: "center" }}
                >
                  Next payout date: <strong>7 days</strong>
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Line Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TrendingUpIcon />
              Monthly Sales Trend
            </Typography>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2F66FF"
                    strokeWidth={2}
                    dot={{ fill: "#2F66FF" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body2" color="#64748b">
                  No sales data available for chart
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Order Status Distribution
            </Typography>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body2" color="#64748b">
                  No order status data available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={3}>
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Top Performing Products
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        color="#2F66FF"
                        fontWeight="bold"
                      >
                        {formatCurrency(product.revenue)}
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        {product.sales} sold
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="#64748b"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No sales data available
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Low Stock Alerts
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#EA5455"
                      fontWeight="bold"
                    >
                      Stock: {product.stock || 0}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="#64748b"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No low stock items
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews & Ratings Section */}
      <Box sx={{ mt: 4, px: { xs: 1.5, sm: 3 } }}>
        <ReviewsRatings />
      </Box>
    </Box>
  );
};

export default Analytics;
