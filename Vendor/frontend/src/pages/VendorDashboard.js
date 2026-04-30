import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import vendorApi from "../services/vendorApi";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Inventory as ProductIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchVendorStats();
  }, []);

  const fetchVendorStats = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching vendor dashboard stats...");

      const response = await vendorApi.getVendorProducts();
      console.log("📦 Vendor products response:", response);

      const products = response.products || [];

      // Calculate stats from real products
      const calculatedStats = {
        totalProducts: products.length,
        approved: products.filter((p) => p.status === "approved").length,
        pending: products.filter((p) => p.status === "pending").length,
        rejected: products.filter((p) => p.status === "rejected").length,
      };

      setStats(calculatedStats);
      console.log("📊 Calculated stats:", calculatedStats);
    } catch (error) {
      console.error("❌ Error fetching vendor stats:", error);
      // Keep default stats (0) if there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigate("/products/add");
  };

  const handleViewProducts = () => {
    navigate("/products");
  };

  const productStatusCards = [
    {
      title: "Approved Products",
      count: stats.approved,
      icon: <ApprovedIcon sx={{ fontSize: 32 }} />,
      color: "#28C76F",
      bgColor: "#f0fdf4",
      borderColor: "#86efac",
    },
    {
      title: "Pending Products",
      count: stats.pending,
      icon: <PendingIcon sx={{ fontSize: 32 }} />,
      color: "#FF9F43",
      bgColor: "#fffbeb",
      borderColor: "#fcd34d",
    },
    {
      title: "Rejected Products",
      count: stats.rejected,
      icon: <RejectedIcon sx={{ fontSize: 32 }} />,
      color: "#EA5455",
      bgColor: "#fef2f2",
      borderColor: "#fca5a5",
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          pt: 4,
          px: { xs: 1.5, sm: 3 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              wordBreak: "break-word",
            }}
          >
            Vendor Dashboard
          </Typography>
          <Typography
            variant="body1"
            color="#64748b"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
            }}
          >
            Welcome to your vendor dashboard - manage your products and track
            their status
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchVendorStats}
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
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      {/* Top Row - Main Statistics Card */}
      <Grid container spacing={3} mb={4} px={{ xs: 1.5, sm: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "white",
              border: "2px solid #e2e8f0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                background:
                  "linear-gradient(135deg, #2F66FF20 0%, #2F66FF05 100%)",
                borderRadius: "0 0 0 100%",
              }}
            />
            {loading ? (
              <CircularProgress sx={{ position: "relative", zIndex: 1 }} />
            ) : (
              <>
                <ProductIcon
                  sx={{
                    fontSize: { xs: 40, sm: 60 },
                    color: "#2F66FF",
                    mb: 2,
                    position: "relative",
                    zIndex: 1,
                  }}
                />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: "#1e293b",
                    mb: 1,
                    position: "relative",
                    zIndex: 1,
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  {stats.totalProducts}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#64748b",
                    position: "relative",
                    zIndex: 1,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  Total Products
                </Typography>
              </>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "white",
              border: "2px solid #e2e8f0",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#1e293b",
                mb: 1,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              Quick Actions
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={handleAddProduct}
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
                  Add New Product
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<ProductIcon />}
                  fullWidth
                  onClick={handleViewProducts}
                  sx={{
                    p: 2,
                    borderColor: "#2F66FF",
                    color: "#2F66FF",
                    "&:hover": {
                      borderColor: "#1e40af",
                      backgroundColor: "#f8fafc",
                    },
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  View All Products
                </Button>
              </Grid>
            </Grid>

            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                backgroundColor: "#f8fafc",
                color: "#64748b",
              }}
            >
              <Typography variant="body2" color="#64748b" sx={{ mb: 2 }}>
                <strong>Getting Started:</strong>
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 1 }}>
                1. Click "Add New Product" to create your first product
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 1 }}>
                2. Your products will be submitted for admin approval
              </Typography>
              <Typography variant="body2" color="#64748b">
                3. Once approved, your products will be visible to customers
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row - Product Status Breakdown */}
      <Box px={{ xs: 1.5, sm: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#1e293b", mb: 3 }}
        >
          Product Status Overview
        </Typography>
        <Grid container spacing={3}>
          {productStatusCards.map((status, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  boxShadow: 2,
                  bgcolor: "white",
                  border: `2px solid ${status.borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : status.count}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#64748b"
                    sx={{
                      mt: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    backgroundColor: status.bgColor,
                    color: status.color,
                    flexShrink: 0,
                  }}
                >
                  {status.icon}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Third Row - Recent Activity */}
      <Box sx={{ mt: 4, px: { xs: 1.5, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#1e293b", mb: 3 }}
        >
          Recent Activity
        </Typography>
        <Card
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            boxShadow: 2,
            bgcolor: "white",
            border: "2px solid #e2e8f0",
          }}
        >
          <Box sx={{ textAlign: "center", py: { xs: 2, sm: 4 } }}>
            {loading ? (
              <CircularProgress />
            ) : stats.totalProducts === 0 ? (
              <>
                <ProductIcon
                  sx={{ fontSize: { xs: 36, sm: 48 }, color: "#cbd5e1", mb: 2 }}
                />
                <Typography
                  variant="h6"
                  color="#64748b"
                  sx={{
                    mb: 1,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  No products yet
                </Typography>
                <Typography
                  variant="body2"
                  color="#94a3b8"
                  sx={{
                    mb: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    wordBreak: "break-word",
                  }}
                >
                  Start by adding your first product to see activity here
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  fullWidth={isMobile}
                  sx={{
                    backgroundColor: "#2F66FF",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  Add Your First Product
                </Button>
              </>
            ) : (
              <>
                <ProductIcon
                  sx={{ fontSize: { xs: 36, sm: 48 }, color: "#cbd5e1", mb: 2 }}
                />
                <Typography
                  variant="h6"
                  color="#64748b"
                  sx={{
                    mb: 1,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  No recent activity
                </Typography>
                <Typography
                  variant="body2"
                  color="#94a3b8"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    wordBreak: "break-word",
                  }}
                >
                  Your recent product updates and notifications will appear here
                </Typography>
              </>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default VendorDashboard;
