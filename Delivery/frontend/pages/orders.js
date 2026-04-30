import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { DELIVERY_ORDERS_API_URL } from "../config/constants";
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
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LocalShipping,
  CheckCircle,
  Cancel,
  Info,
  Refresh,
  Phone,
  Email,
  LocationOn,
  Map,
  FilterList,
  Search,
  AccessTime,
} from "@mui/icons-material";

function TabPanel({ children = null, value = 0, index = 0, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OrdersPage() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  // Orders data
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [ordersStats, setOrdersStats] = useState({
    totalOrders: 0,
    availableOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    rejectedOrders: 0,
  });

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem("deliveryBoyToken");
    if (!token) {
      router.push("/delivery-boy/login");
      return;
    }

    // Load orders data
    loadOrdersData();
    loadAvailableOrders();
    loadOrdersStats();
  }, []);

  const loadOrdersData = async () => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      const response = await axios.get(`${DELIVERY_ORDERS_API_URL}/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle response structure {success: true, data: [], pagination: {}}
      if (response.data && response.data.success && response.data.data) {
        setOrders(response.data.data);
      } else {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      // Set empty array for now to see real data
      setOrders([]);
    }
    setLoading(false);
  };

  const loadAvailableOrders = async () => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      const response = await axios.get(`${DELIVERY_ORDERS_API_URL}/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle response structure {success: true, data: [], pagination: {}}
      if (response.data && response.data.success && response.data.data) {
        setAvailableOrders(response.data.data);
      } else {
        setAvailableOrders(response.data || []);
      }
    } catch (error) {
      console.error("Error loading available orders:", error);
      setAvailableOrders([]);
    }
  };

  const loadOrdersStats = async () => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      const response = await axios.get(`${DELIVERY_ORDERS_API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle response structure {success: true, data: {}}
      if (response.data && response.data.success && response.data.data) {
        const stats = response.data.data;
        setOrdersStats({
          ...stats,
          availableOrders: availableOrders.length,
        });
      } else {
        setOrdersStats({
          ...response.data,
          availableOrders: availableOrders.length,
        });
      }
    } catch (error) {
      console.error("Error loading orders stats:", error);
      // Set empty stats for now to see real data
      setOrdersStats({
        totalOrders: 0,
        availableOrders: availableOrders.length,
        inProgressOrders: 0,
        completedOrders: 0,
        rejectedOrders: 0,
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      await axios.post(
        `${DELIVERY_ORDERS_API_URL}/${orderId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state - move order from available to my orders
      const acceptedOrder = availableOrders.find(
        (order) => order._id === orderId,
      );
      if (acceptedOrder) {
        setAvailableOrders(
          availableOrders.filter((order) => order._id !== orderId),
        );
        setOrders([...orders, { ...acceptedOrder, status: "accepted" }]);
      } else {
        // Update existing order
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: "accepted" } : order,
          ),
        );
      }

      setSnackbar({
        open: true,
        message: "Order accepted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error accepting order:", error);
      setSnackbar({
        open: true,
        message: "Error accepting order",
        severity: "error",
      });
    }
  };

  // Filter functions for different order statuses
  const getInProgressOrders = () => {
    return orders.filter((order) =>
      ["accepted", "picked_up"].includes(order.status),
    );
  };

  const getCompletedOrders = () => {
    return orders.filter((order) => order.status === "delivered");
  };

  const getRejectedOrders = () => {
    return orders.filter((order) => order.status === "rejected");
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      await axios.post(
        `${DELIVERY_ORDERS_API_URL}/${orderId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "rejected" } : order,
        ),
      );

      setSnackbar({ open: true, message: "Order rejected", severity: "info" });
    } catch (error) {
      console.error("Error rejecting order:", error);
      setSnackbar({
        open: true,
        message: "Error rejecting order",
        severity: "error",
      });
    }
  };

  const handleStartDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      await axios.post(
        `${DELIVERY_ORDERS_API_URL}/${orderId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "delivering" } : order,
        ),
      );

      setSnackbar({
        open: true,
        message: "Delivery started!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error starting delivery:", error);
      setSnackbar({
        open: true,
        message: "Error starting delivery",
        severity: "error",
      });
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryBoyToken");
      await axios.post(
        `${DELIVERY_ORDERS_API_URL}/${orderId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "completed" } : order,
        ),
      );

      setSnackbar({
        open: true,
        message: "Delivery completed!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error completing delivery:", error);
      setSnackbar({
        open: true,
        message: "Error completing delivery",
        severity: "error",
      });
    }
  };

  const handleContactCustomer = (order) => {
    // TODO: Implement customer contact
    setSnackbar({
      open: true,
      message: "Contacting customer...",
      severity: "info",
    });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const handleViewMap = (order) => {
    setSelectedOrder(order);
    setMapDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "primary";
      case "in_progress":
        return "warning";
      case "delivering":
        return "info";
      case "completed":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders || [];

    // Ensure filtered is always an array
    if (!Array.isArray(filtered)) {
      console.log("orders is not an array:", orders);
      filtered = [];
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerPhone.includes(searchTerm) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        pt: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mt: { xs: 1.5, sm: 2 },
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          px: { xs: 1, sm: 3 },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}
          >
            Order Management
          </Typography>
          <Typography variant="body1" color="#64748b">
            Manage and track your delivery orders
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadOrdersData}
          disabled={loading}
          sx={{
            borderColor: "#2F66FF",
            color: "#2F66FF",
            "&:hover": {
              borderColor: "#1e40af",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4, px: { xs: 1, sm: 3 }, mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: { xs: 2, sm: 3 },
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "white",
              border: "2px solid #e2e8f0",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}
            >
              Total Orders
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#2F66FF", mb: 2 }}
            >
              {ordersStats.totalOrders}
            </Typography>
            <LocalShipping sx={{ fontSize: 32, color: "#2F66FF" }} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "white",
              border: "2px solid #e2e8f0",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}
            >
              Available
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#28C76F", mb: 2 }}
            >
              {ordersStats.availableOrders}
            </Typography>
            <Badge badgeContent={ordersStats.availableOrders} color="success">
              <LocalShipping sx={{ fontSize: 32, color: "#28C76F" }} />
            </Badge>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "white",
              border: "2px solid #e2e8f0",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}
            >
              In Progress
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#FF9F43", mb: 2 }}
            >
              {ordersStats.inProgressOrders}
            </Typography>
            <AccessTime sx={{ fontSize: 32, color: "#FF9F43" }} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "white",
              border: "2px solid #e2e8f0",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}
            >
              Completed
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#28C76F", mb: 2 }}
            >
              {ordersStats.completedOrders}
            </Typography>
            <CheckCircle sx={{ fontSize: 32, color: "#28C76F" }} />
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Box sx={{ mb: 4, px: { xs: 1.5, sm: 3 }, mt: 2 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: "white",
            border: "2px solid #e2e8f0",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search orders by ID, customer name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "#64748b", mr: 1 }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select
                fullWidth
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<FilterList />}
                fullWidth
                sx={{
                  p: 2,
                  backgroundColor: "#2F66FF",
                  "&:hover": { backgroundColor: "#1e40af" },
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: { xs: 1.5, sm: 3 }, mt: 2 }}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: "white",
            border: "2px solid #e2e8f0",
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="orders tabs"
              sx={{
                "& .MuiTab-root": {
                  color: "#64748b",
                  minHeight: 64,
                  fontWeight: 500,
                  textTransform: "none",
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
              <Tab icon={<FilterList />} label="All Orders" />
              <Tab icon={<LocalShipping />} label="Available" />
              <Tab icon={<AccessTime />} label="In Progress" />
              <Tab icon={<CheckCircle />} label="Completed" />
            </Tabs>
          </Box>

          {/* Orders Table */}
          <TabPanel value={tabValue} index={0}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: "#1e293b",
              }}
            >
              <FilterList sx={{ mr: 1, color: "#2F66FF" }} />
              All Orders
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
              View and manage all your delivery orders
            </Typography>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: "white",
                border: "2px solid #e2e8f0",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  All Orders
                </Typography>
                {isMobile ? (
                  <Box>
                    {getFilteredOrders().map((order) => (
                      <Card key={order._id} sx={{ mb: 2, p: 2, boxShadow: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography fontWeight="bold" variant="body1">
                            {order.orderId || order.id}
                          </Typography>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {order.customerName}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ mb: 1, display: "block" }}
                        >
                          {order.customerPhone}
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 1 }}>
                          ₹{order.totalAmount || order.amount}
                        </Typography>

                        <Box
                          sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewOrder(order)}
                            sx={{ fontSize: "12px" }}
                          >
                            View
                          </Button>
                          {order.status === "available" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() =>
                                handleAcceptOrder(order._id || order.id)
                              }
                              sx={{ fontSize: "12px" }}
                            >
                              Accept
                            </Button>
                          )}
                          {order.status === "in_progress" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="info"
                              onClick={() =>
                                handleStartDelivery(order._id || order.id)
                              }
                              sx={{ fontSize: "12px" }}
                            >
                              Start
                            </Button>
                          )}
                          {order.status === "delivering" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() =>
                                handleCompleteDelivery(order._id || order.id)
                              }
                              sx={{ fontSize: "12px" }}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleContactCustomer(order)}
                            sx={{ fontSize: "12px" }}
                          >
                            Contact
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewMap(order)}
                            sx={{ fontSize: "12px" }}
                          >
                            Map
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                    <Table
                      size="small"
                      sx={{ minWidth: { xs: 600, md: 800 } }}
                      stickyHeader
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell
                            sx={{ display: { xs: "none", md: "table-cell" } }}
                          >
                            Address
                          </TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell
                            sx={{ display: { xs: "none", md: "table-cell" } }}
                          >
                            Distance
                          </TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(getFilteredOrders() || []).map((order) => (
                          <TableRow key={order._id || order.orderId}>
                            <TableCell>{order.orderId || order.id}</TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {order.customerName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {order.customerPhone}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {order.deliveryAddress &&
                              typeof order.deliveryAddress === "object"
                                ? `${order.deliveryAddress.street || ""}, ${order.deliveryAddress.city || ""}, ${order.deliveryAddress.state || ""}`
                                : order.deliveryAddress || "N/A"}
                            </TableCell>
                            <TableCell>
                              ₹{order.totalAmount || order.amount}
                            </TableCell>
                            <TableCell>{order.distance}</TableCell>
                            <TableCell>{order.estimatedTime}</TableCell>
                            <TableCell>
                              <Chip
                                label={order.status}
                                color={getStatusColor(order.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.5,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleViewOrder(order)}
                                  sx={{ fontSize: "12px" }}
                                >
                                  View
                                </Button>
                                {order.status === "available" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() =>
                                      handleAcceptOrder(order._id || order.id)
                                    }
                                    sx={{ fontSize: "11px", ml: 1 }}
                                  >
                                    Accept
                                  </Button>
                                )}
                                {order.status === "in_progress" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="info"
                                    onClick={() =>
                                      handleStartDelivery(order._id || order.id)
                                    }
                                    sx={{ fontSize: "11px", ml: 1 }}
                                  >
                                    Start Delivery
                                  </Button>
                                )}
                                {order.status === "delivering" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() =>
                                      handleCompleteDelivery(
                                        order._id || order.id,
                                      )
                                    }
                                    sx={{ fontSize: "11px", ml: 1 }}
                                  >
                                    Complete
                                  </Button>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleContactCustomer(order)}
                                  sx={{ fontSize: "11px", ml: 1 }}
                                >
                                  Contact
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleViewMap(order)}
                                >
                                  Map
                                </Button>
                              </Box>
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

          <TabPanel value={tabValue} index={1}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: "#1e293b",
              }}
            >
              <LocalShipping sx={{ mr: 1, color: "#2F66FF" }} />
              Available Orders
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
              Orders available for pickup
            </Typography>

            {availableOrders.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No available orders at the moment.
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          #{order.orderId || order._id?.slice(-6)}
                        </TableCell>
                        <TableCell>{order.customerId?.name || "N/A"}</TableCell>
                        <TableCell>
                          {order.vendorId?.shopName || "N/A"}
                        </TableCell>
                        <TableCell>
                          ₹{order.totalAmount || order.amount || 0}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.priority || "Normal"}
                            color={
                              order.priority === "high" ? "error" : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleAcceptOrder(order._id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectOrder(order._id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: "#1e293b",
              }}
            >
              <AccessTime sx={{ mr: 1, color: "#2F66FF" }} />
              In Progress
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
              Orders currently being delivered
            </Typography>

            {getInProgressOrders().length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No orders in progress at the moment.
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Accepted Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getInProgressOrders().map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          #{order.orderId || order._id?.slice(-6)}
                        </TableCell>
                        <TableCell>{order.customerId?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={
                              order.status === "accepted"
                                ? "warning"
                                : order.status === "picked_up"
                                  ? "info"
                                  : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          ₹{order.totalAmount || order.amount || 0}
                        </TableCell>
                        <TableCell>
                          {order.acceptedDate
                            ? new Date(order.acceptedDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {order.status === "accepted" && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleStartDelivery(order._id)}
                              >
                                Start Delivery
                              </Button>
                            )}
                            {order.status === "picked_up" && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() =>
                                  handleCompleteDelivery(order._id)
                                }
                              >
                                Complete
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: "#1e293b",
              }}
            >
              <CheckCircle sx={{ mr: 1, color: "#2F66FF" }} />
              Completed Orders
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
              Successfully delivered orders
            </Typography>

            {getCompletedOrders().length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No completed orders yet.
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Earnings</TableCell>
                      <TableCell>Delivery Date</TableCell>
                      <TableCell>Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCompletedOrders().map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          #{order.orderId || order._id?.slice(-6)}
                        </TableCell>
                        <TableCell>{order.customerId?.name || "N/A"}</TableCell>
                        <TableCell>
                          ₹{order.totalAmount || order.amount || 0}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#28C76F", fontWeight: "bold" }}
                        >
                          ₹{order.deliveryBoyEarnings || 0}
                        </TableCell>
                        <TableCell>
                          {order.deliveredDate
                            ? new Date(order.deliveredDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {order.rating ? (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {"⭐".repeat(order.rating)}
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                ({order.rating}/5)
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Not rated
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Card>
      </Box>

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
            Loading orders data...
          </Typography>
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Order ID</Typography>
                <Typography variant="body1">{selectedOrder.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Customer Name</Typography>
                <Typography variant="body1">
                  {selectedOrder.customerName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Customer Phone</Typography>
                <Typography variant="body1">
                  {selectedOrder.customerPhone}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Pickup Address</Typography>
                <Typography variant="body1">
                  {selectedOrder.pickupAddress || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Delivery Address</Typography>
                <Typography variant="body1">
                  {selectedOrder.deliveryAddress &&
                  typeof selectedOrder.deliveryAddress === "object"
                    ? `${selectedOrder.deliveryAddress.street || ""}, ${selectedOrder.deliveryAddress.city || ""}, ${selectedOrder.deliveryAddress.state || ""}`
                    : selectedOrder.deliveryAddress || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Amount</Typography>
                <Typography variant="body1">
                  ₹{selectedOrder.totalAmount || selectedOrder.amount}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Distance</Typography>
                <Typography variant="body1">
                  {selectedOrder.distance}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Estimated Time</Typography>
                <Typography variant="body1">
                  {selectedOrder.estimatedTime}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={selectedOrder.status}
                  color={getStatusColor(selectedOrder.status)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Order Date</Typography>
                <Typography variant="body1">
                  {selectedOrder.orderDate}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Priority</Typography>
                <Typography variant="body1">
                  {selectedOrder.priority}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Items</Typography>
                <Typography variant="body1">
                  {selectedOrder.items.join(", ")}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Map Dialog */}
      <Dialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Delivery Location</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Map view would show delivery location and route. This would
            integrate with Google Maps API for real-time tracking.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapDialogOpen(false)}>Close</Button>
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
