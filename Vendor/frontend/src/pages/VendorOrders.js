import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import vendorApi from "../services/vendorApi";
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Pending as PendingIcon,
  Cancel as CancelledIcon,
} from "@mui/icons-material";

const VendorOrders = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch vendor orders from API
  const fetchVendorOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching vendor orders...");

      const response = await vendorApi.getVendorOrders();
      console.log("📦 Vendor orders response:", response);

      // Handle different response formats
      let ordersData = [];
      if (response && response.orders) {
        ordersData = response.orders;
      } else if (Array.isArray(response)) {
        ordersData = response;
      }

      console.log("📦 Orders data to process:", ordersData.length, "items");
      setOrders(ordersData);
    } catch (error) {
      console.error("❌ Error fetching vendor orders:", error);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      confirmed: "info",
      processing: "secondary",
      shipped: "primary",
      delivered: "success",
      cancelled: "error",
      returned: "error",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <PendingIcon />,
      confirmed: <DeliveredIcon />,
      processing: <PendingIcon />,
      shipped: <ShippingIcon />,
      delivered: <DeliveredIcon />,
      cancelled: <CancelledIcon />,
      returned: <CancelledIcon />,
    };
    return icons[status] || <PendingIcon />;
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrderForStatus(order);
    setNewStatus(order.status || "pending");
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      if (!selectedOrderForStatus || !newStatus) {
        return;
      }

      console.log("🔄 Updating order status:", {
        orderId: selectedOrderForStatus._id,
        currentStatus: selectedOrderForStatus.status,
        newStatus: newStatus,
      });

      // Update order status via API
      await vendorApi.updateOrderStatus(selectedOrderForStatus._id, newStatus);

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrderForStatus._id
            ? { ...order, status: newStatus }
            : order,
        ),
      );

      setSnackbar({
        open: true,
        message: `Order status updated to ${newStatus}`,
        severity: "success",
      });

      setStatusDialogOpen(false);
      setSelectedOrderForStatus(null);
      setNewStatus("");
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update order status",
        severity: "error",
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading orders...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#1e293b">
          My Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchVendorOrders}
          disabled={loading}
          fullWidth={isMobile}
          sx={{
            borderColor: "#2F66FF",
            color: "#2F66FF",
            "&:hover": {
              borderColor: "#1e40af",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <Typography variant="h4" color="#2F66FF" fontWeight="bold">
              {orders.length}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Total Orders
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <Typography variant="h4" color="#FF9F43" fontWeight="bold">
              {orders.filter((o) => o.status === "pending").length}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Pending
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <Typography variant="h4" color="#2F66FF" fontWeight="bold">
              {orders.filter((o) => o.status === "shipped").length}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Shipped
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{ p: 3, textAlign: "center", borderRadius: 2, boxShadow: 2 }}
          >
            <Typography variant="h4" color="#28C76F" fontWeight="bold">
              {orders.filter((o) => o.status === "delivered").length}
            </Typography>
            <Typography variant="body2" color="#64748b">
              Delivered
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filter}
            label="Filter by Status"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table/Cards */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {filteredOrders.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="#64748b">
                No orders found
              </Typography>
            </Box>
          ) : (
            <>
              {/* Mobile Card View */}
              {isMobile ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  {filteredOrders.map((order) => (
                    <Card
                      key={order._id}
                      sx={{
                        width: "100%",
                        boxSizing: "border-box",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        {/* Order ID and Status */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                wordBreak: "break-word",
                              }}
                            >
                              #
                              {order._id?.slice(-8) || order.orderId?.slice(-8)}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                wordBreak: "break-word",
                              }}
                            >
                              {order.customerName ||
                                order.customerEmail ||
                                "N/A"}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status || "pending"}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ textTransform: "capitalize", flexShrink: 0 }}
                          />
                        </Box>

                        {/* Date and Amount */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {formatDate(order.createdAt)}
                          </Typography>
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontWeight: 600,
                            }}
                          >
                            {formatCurrency(
                              order.pricing?.total || order.total || 0,
                            )}
                          </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(order)}
                            sx={{ color: "#2F66FF" }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusUpdate(order)}
                            sx={{ color: "#1976d2" }}
                            title="Update Status"
                          >
                            <ShippingIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                /* Desktop Table View */
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              #
                              {order._id?.slice(-8) || order.orderId?.slice(-8)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.customerName ||
                                order.customerEmail ||
                                "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(order.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(
                                order.pricing?.total || order.total || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status || "pending"}
                              color={getStatusColor(order.status)}
                              size="small"
                              sx={{ textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(order)}
                                sx={{ color: "#2F66FF" }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleStatusUpdate(order)}
                                sx={{ color: "#1976d2" }}
                                title="Update Status"
                              >
                                <ShippingIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - #{selectedOrder?._id?.slice(-8)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="#64748b">
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedOrder.customerName || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="#64748b">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.customerEmail || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="#64748b">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.customerPhone || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="#64748b">
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedOrder.createdAt)}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Items
              </Typography>
              {selectedOrder.items?.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: "1px solid #e2e8f0",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {item.product?.name || item.productName || "Product"}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Quantity: {item.quantity} ×{" "}
                    {formatCurrency(item.unitPrice || item.price)}
                  </Typography>
                </Box>
              ))}

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: "#f8fafc",
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Total:{" "}
                  {formatCurrency(
                    selectedOrder.pricing?.total || selectedOrder.total || 0,
                  )}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Order ID: #{selectedOrderForStatus?._id?.slice(-8)}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="New Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmStatusUpdate}
            variant="contained"
            color="primary"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorOrders;
