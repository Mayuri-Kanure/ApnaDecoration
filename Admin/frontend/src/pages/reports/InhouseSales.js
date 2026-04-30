import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const InhouseSales = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [categories, setCategories] = useState([
    { value: "all", label: "All" },
  ]); // Initialize with 'all' option

  // Add refs to prevent infinite loops
  const isFetchingCategories = useRef(false);
  const isFetchingSales = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Fallback data for when API calls fail
  const fallbackCategories = [
    { value: "photo-frames", label: "Photo Frames" },
    { value: "cushions", label: "Cushions" },
    { value: "rock-slate", label: "Rock Slate" },
    { value: "wall-art", label: "Wall Art" },
    { value: "decorative-items", label: "Decorative Items" },
  ];

  const fallbackSalesData = [
    { id: 1, productName: "Vintage Photo Frame", totalSale: 145 },
    { id: 2, productName: "Modern Cushion Set", totalSale: 89 },
    { id: 3, productName: "Rock Slate Art", totalSale: 67 },
    { id: 4, productName: "Canvas Wall Art", totalSale: 234 },
    { id: 5, productName: "Decorative Vase", totalSale: 112 },
    { id: 6, productName: "Wooden Frame", totalSale: 178 },
    { id: 7, productName: "Silk Cushion", totalSale: 93 },
    { id: 8, productName: "Stone Slate", totalSale: 45 },
    { id: 9, productName: "Abstract Art Print", totalSale: 156 },
    { id: 10, productName: "Ceramic Decor", totalSale: 78 },
  ];

  // API functions to fetch real data
  const fetchCategories = async () => {
    // Prevent infinite loops
    if (isFetchingCategories.current) {
      console.log("Already fetching categories, skipping...");
      return;
    }

    try {
      isFetchingCategories.current = true;
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/inhouse-sales/categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("CATEGORIES API RESPONSE:", response.data);
      setCategories([{ value: "all", label: "All" }, ...response.data]);
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      console.error("Error fetching categories:", error);
      retryCountRef.current++;

      // Use fallback data after max retries
      if (retryCountRef.current >= maxRetries) {
        console.log("Using fallback categories after max retries");
        setCategories([{ value: "all", label: "All" }, ...fallbackCategories]);
        retryCountRef.current = 0;
      }
    } finally {
      isFetchingCategories.current = false;
    }
  };

  const fetchSalesData = async () => {
    // Prevent infinite loops
    if (isFetchingSales.current) {
      console.log("Already fetching sales data, skipping...");
      return;
    }

    try {
      isFetchingSales.current = true;
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/inhouse-sales?page=${page}&limit=10&category=${selectedCategory}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("INHOUSE API RESPONSE:", response.data);

      // Map data properly for frontend display
      const rawData = response.data.data || response.data || [];
      const mappedData = rawData.map((item) => ({
        id: item._id || item.id || Math.random(),
        productName: item.productName || item.name || "Unknown Product",
        totalSale: item.totalSale || item.total || 0,
      }));

      console.log("MAPPED DATA:", mappedData);

      // ✅ IMPORTANT: only update if data exists
      if (mappedData.length > 0) {
        setSalesData(mappedData);
        setTotalPages(
          response.data.pagination?.totalPages || response.data.totalPages || 1,
        );
      }

      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      console.error("Error fetching sales data:", error);
      retryCountRef.current++;

      // Use fallback data after max retries
      if (retryCountRef.current >= maxRetries) {
        console.log("Using fallback sales data after max retries");
        setSalesData(fallbackSalesData);
        setTotalPages(5);
        retryCountRef.current = 0;
      }
    } finally {
      setLoading(false);
      isFetchingSales.current = false;
    }
  };

  // Load data when component mounts or when page/category changes
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleFilter = () => {
    console.log("Filter applied with category:", selectedCategory);
    // Reset to page 1 when filter changes
    setPage(1);
    // Manually trigger data reload
    fetchSalesData();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    console.log("Page changed to:", newPage);
    // In real app, this would trigger API call with new page
  };

  // Calculate serial number based on current page and index
  const getSerialNumber = (index) => {
    return (page - 1) * 10 + index + 1;
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f7f8fc",
        minHeight: "100vh",
      }}
    >
      {/* Page Title */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <TrendingUpIcon sx={{ mr: 2, fontSize: 32, color: "#0d47a1" }} />
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
          Inhouse Sale
        </Typography>
      </Box>

      {/* Main Card Container */}
      <Card
        sx={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          borderRadius: 3,
          backgroundColor: "white",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Filter Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              pb: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <FormControl size="medium" sx={{ minWidth: 200 }}>
              <Select
                value={selectedCategory || "all"}
                onChange={handleCategoryChange}
                displayEmpty
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                    },
                  },
                }}
              >
                {categories.map((category, index) => (
                  <MenuItem
                    key={`${category.value}-${index}`}
                    value={category.value}
                  >
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleFilter}
              sx={{
                backgroundColor: "#0d47a1",
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 8px rgba(13, 71, 161, 0.3)",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  boxShadow: "0 6px 12px rgba(13, 71, 161, 0.4)",
                },
              }}
            >
              Filter
            </Button>
          </Box>

          {/* Sales Data Table */}
          <Box sx={{ mb: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#2c3e50",
                          border: "none",
                          py: 2,
                        }}
                      >
                        SL
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#2c3e50",
                          border: "none",
                          py: 2,
                        }}
                      >
                        Product Name
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          color: "#2c3e50",
                          border: "none",
                          py: 2,
                        }}
                      >
                        Total Sale
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.map((row, index) => (
                      <TableRow
                        key={row.id || index}
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "white" : "#f8f9fa",
                          "&:hover": {
                            backgroundColor: "#e3f2fd",
                            cursor: "pointer",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <TableCell sx={{ border: "none", py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {getSerialNumber(index)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: "none", py: 2 }}>
                          <Typography variant="body2" sx={{ color: "#2c3e50" }}>
                            {row.productName}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            border: "none",
                            py: 2,
                            fontWeight: 600,
                            color: "#0d47a1",
                          }}
                        >
                          {row.totalSale}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              shape="rounded"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                  fontWeight: 500,
                },
                "& .MuiPaginationItem-page.Mui-selected": {
                  backgroundColor: "#0d47a1",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                },
                "& .MuiPaginationItem-page": {
                  color: "#546e7a",
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#0d47a1",
                  },
                },
                "& .MuiPaginationItem-previousNext": {
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  color: "#546e7a",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#0d47a1",
                  },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InhouseSales;
