import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Badge,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FileDownload as ExportIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const statusColors = {
  pending: "warning",
  confirmed: "info",
  processing: "secondary",
  "out-for-delivery": "warning",
  delivered: "success",
  returned: "error",
  cancelled: "error",
  failed: "error",
  canceled: "error",
  packaging: "secondary",
};

const paymentStatusColors = {
  paid: "success",
  unpaid: "error",
};

function Orders({ status: statusProp, showCancelled = false, title }) {
  const navigate = useNavigate();
  const { status: statusParam } = useParams();
  const location = useLocation();

  // Use status from prop first, then from URL params
  const currentStatus = statusProp || statusParam || "all";

  // Determine page title
  const pageTitle =
    title ||
    (currentStatus === "all"
      ? "All Orders"
      : `${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)} Orders`);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    orderType: "all",
    store: "all",
    customer: "all",
    dateType: "order",
    orderStatus: currentStatus,
    paymentStatus: "all",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Skip authentication for testing
      // const token = localStorage.getItem("token");

      // Build query parameters
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...filters,
      };

      // If showCancelled is true and currentStatus is 'failed', include both failed and cancelled orders
      if (showCancelled && currentStatus === "failed") {
        params.status = ["failed", "cancelled"];
      }

      const response = await axios.get(`${API_BASE_URL}/orders`, {
        params,
        // Remove auth headers for testing
      });

      console.log("🔍 ADMIN FRONTEND - API Response:", response.data);
      console.log(
        "🔍 ADMIN FRONTEND - Orders count:",
        response.data.orders?.length,
      );

      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.pages || 0);
      setTotalOrders(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setTotalPages(0);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, filters]);

  // Update orderStatus filter when status changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, orderStatus: currentStatus }));
  }, [currentStatus]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      orderType: "all",
      store: "all",
      customer: "all",
      dateType: "order",
      orderStatus: currentStatus || "all",
      paymentStatus: "all",
    });
    setPage(1);
  };

  const handleExportData = () => {
    // Export functionality
    const csvContent = [
      [
        "SL",
        "Order ID",
        "Order Date",
        "Customer Name",
        "Mobile",
        "Store",
        "Total Amount",
        "Payment Status",
        "Order Status",
      ],
      ...orders.map((order, index) => [
        index + 1,
        order.orderNumber || "",
        new Date(order.createdAt).toLocaleString(),
        `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`,
        order.customer?.phone || "",
        order.store || "In-house",
        order.pricing?.total ? `₹${order.pricing.total.toFixed(2)}` : "₹0.00",
        order.paymentStatus || "unpaid",
        order.status || "pending",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleDownloadInvoice = (orderId) => {
    // Download invoice functionality
    console.log("Downloading invoice for order:", orderId);
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Admin deleting order:", orderId);

      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Order deleted successfully:", response.data);

      // Refresh orders list
      await fetchOrders();
      alert("Order deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      alert(
        `Failed to delete order: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      console.log("🚫 Admin cancelling order:", orderId);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/cancel`,
        {
          reason: "Cancelled by admin",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("✅ Order cancelled successfully:", response.data);

      // Refresh orders list
      await fetchOrders();
      alert("Order cancelled successfully");
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      alert(
        `Failed to cancel order: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // Filter options
  const orderStatusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "out-for-delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "returned", label: "Returned" },
    { value: "cancelled", label: "Cancelled" },
    { value: "failed", label: "Failed" },
  ];

  const paymentStatusOptions = [
    { value: "all", label: "All Payment Status" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
  ];

  const orderTypeOptions = [
    { value: "all", label: "All Order Types" },
    { value: "delivery", label: "Delivery" },
    { value: "pickup", label: "Pickup" },
  ];

  const storeOptions = [
    { value: "all", label: "All Stores" },
    { value: "in-house", label: "In-house" },
    { value: "vendor", label: "Vendor" },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Title with Count Badge */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" fontWeight="600">
            {pageTitle}
          </Typography>
          <Badge
            badgeContent={totalOrders}
            color="primary"
            sx={{
              "& .MuiBadge-badge": { fontSize: "0.875rem", fontWeight: 500 },
            }}
          >
            <Box />
          </Badge>
        </Box>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: "white" }}>
        <Typography variant="h6" mb={2} fontWeight="500">
          Filter Orders
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Order Type</InputLabel>
              <Select
                value={filters.orderType}
                label="Order Type"
                onChange={(e) =>
                  handleFilterChange("orderType", e.target.value)
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="packaging">Packaging</MenuItem>
                <MenuItem value="out-for-delivery">Out for Delivery</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
                <MenuItem value="failed">Failed to Deliver orders</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Store</InputLabel>
              <Select
                value={filters.store}
                label="Store"
                onChange={(e) => handleFilterChange("store", e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="inhouse">Inhouse</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Customer</InputLabel>
              <Select
                value={filters.customer}
                label="Customer"
                onChange={(e) => handleFilterChange("customer", e.target.value)}
              >
                <MenuItem value="all">All Customers</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Type</InputLabel>
              <Select
                value={filters.dateType}
                label="Date Type"
                onChange={(e) => handleFilterChange("dateType", e.target.value)}
              >
                <MenuItem value="order">Order Date</MenuItem>
                <MenuItem value="delivery">Delivery Date</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  borderColor: "#d1d5db",
                  color: "#6b7280",
                  "&:hover": { borderColor: "#9ca3af" },
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={fetchOrders}
                sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
              >
                Show Data
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search and Export Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <TextField
            fullWidth
            placeholder="Search by Order ID"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { xs: "100%", sm: 400 } }}
          />
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={handleExportData}
            sx={{
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Export
          </Button>
        </Box>
      </Paper>

      {/* Orders Table */}
      <Box sx={{ overflowX: "auto" }}>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 600, minWidth: 800 }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  SL
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  Order ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  Order Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  Customer Info
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  Store
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  Total Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  Order Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8fafc" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow
                  key={order._id}
                  hover
                  sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
                >
                  <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {order.orderNumber || `#${order._id?.slice(-8)}`}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer?.phone || "N/A"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.store === "vendor" ? "Vendor" : "In-house"}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor:
                          order.store === "vendor" ? "#f59e0b" : "#6366f1",
                        color: order.store === "vendor" ? "#f59e0b" : "#6366f1",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {order.pricing?.total
                          ? `₹${order.pricing.total.toFixed(2)}`
                          : "₹0.00"}
                      </Typography>
                      <Chip
                        label={
                          order.paymentStatus === "paid" ? "Paid" : "Unpaid"
                        }
                        color={
                          paymentStatusColors[order.paymentStatus] || "default"
                        }
                        size="small"
                        sx={{ fontSize: "0.75rem", height: 20 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        order.status?.replace("-", " ").toUpperCase() ||
                        "PENDING"
                      }
                      color={statusColors[order.status] || "default"}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Order Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewOrder(order._id)}
                          sx={{
                            color: "#3b82f6",
                            "&:hover": {
                              bgcolor: "#eff6ff",
                              transform: "scale(1.1)",
                              transition: "all 0.2s ease",
                            },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Invoice PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadInvoice(order._id)}
                          sx={{
                            color: "#10b981",
                            "&:hover": {
                              bgcolor: "#f0fdf4",
                              transform: "scale(1.1)",
                              transition: "all 0.2s ease",
                            },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {order.status === "pending" && (
                        <Tooltip title="Cancel Order">
                          <IconButton
                            size="small"
                            onClick={() => handleCancelOrder(order._id)}
                            sx={{
                              color: "#ef4444",
                              "&:hover": {
                                bgcolor: "#fef2f2",
                                transform: "scale(1.1)",
                                transition: "all 0.2s ease",
                              },
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Order">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteOrder(order._id)}
                          sx={{
                            color: "#dc2626",
                            "&:hover": {
                              bgcolor: "#fef2f2",
                              transform: "scale(1.1)",
                              transition: "all 0.2s ease",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
          />
        </Box>
      )}
    </Box>
  );
}

export default Orders;
