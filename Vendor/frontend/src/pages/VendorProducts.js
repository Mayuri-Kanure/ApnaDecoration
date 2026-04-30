import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const VendorProducts = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);

  // Fetch vendor products from API
  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching vendor products...");

      const response = await vendorApi.getVendorProducts();
      console.log("📦 Vendor products raw response:", response);
      console.log("📦 Response type:", typeof response);
      console.log("📦 Response keys:", Object.keys(response));

      // Handle different response formats
      let productsData = [];
      if (response && response.products) {
        productsData = response.products;
        console.log("📦 Using response.products");
      } else if (response && response.vendorProducts) {
        productsData = response.vendorProducts;
        console.log("📦 Using response.vendorProducts");
      } else if (Array.isArray(response)) {
        productsData = response;
        console.log("📦 Using response array directly");
      } else {
        console.error("❌ Unexpected response format:", response);
      }

      console.log("📦 Products data to process:", productsData.length, "items");

      // Transform API response to match frontend format
      const transformedProducts = productsData.map((product) => {
        // Handle image URLs - check multiple possible fields
        let imageUrl = null;

        // Try thumbnail first
        if (product.thumbnail) {
          imageUrl = product.thumbnail.startsWith("http")
            ? product.thumbnail
            : `https://admin-api.apnadecoration.com${product.thumbnail}`;
        }
        // Try first image in images array
        else if (product.images && product.images.length > 0) {
          const firstImage = product.images[0];
          imageUrl = firstImage.startsWith("http")
            ? firstImage
            : `https://admin-api.apnadecoration.com${firstImage}`;
        }
        // Try image field
        else if (product.image) {
          imageUrl = product.image.startsWith("http")
            ? product.image
            : `https://admin-api.apnadecoration.com${product.image}`;
        }

        // If still no image, leave as null and let onError handle it
        if (!imageUrl) {
          imageUrl = null;
        }

        return {
          id: product._id || product.id,
          _id: product._id,
          name: product.name || product.product_name_en,
          sku: product.sku,
          price: product.price,
          status: product.status || "pending",
          category: product.category?.name || product.category,
          description: product.description,
          images: product.images || [],
          thumbnail: product.thumbnail,
          image: imageUrl, // Use processed image URL
        };
      });

      setProducts(transformedProducts);
      console.log("✅ Products loaded:", transformedProducts.length);
    } catch (error) {
      console.error("❌ Error fetching vendor products:", error);
      setError(error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and setup event listener
  useEffect(() => {
    fetchVendorProducts();

    // Check for updated product data from sessionStorage (from EditProduct)
    const updatedProductId = sessionStorage.getItem("updatedProductId");
    const updatedProductData = sessionStorage.getItem("updatedProduct");

    if (updatedProductId && updatedProductData) {
      try {
        const updatedProduct = JSON.parse(updatedProductData);
        console.log(
          "🔄 Found updated product in sessionStorage:",
          updatedProduct,
        );

        // Update the specific product in the local state after a short delay
        setTimeout(() => {
          setProducts((prev) => {
            console.log(
              "🔄 Updating products array with sessionStorage data, current length:",
              prev.length,
            );
            const newProducts = prev.map((product) => {
              if (
                product._id === updatedProduct._id ||
                product.id === updatedProduct._id
              ) {
                console.log(
                  "🔄 Found matching product to update from sessionStorage:",
                  product.name,
                );
                // Transform the updated product to match frontend format
                let imageUrl = null;

                // Try thumbnail first
                if (updatedProduct.thumbnail) {
                  imageUrl = updatedProduct.thumbnail.startsWith("http")
                    ? updatedProduct.thumbnail
                    : `https://admin-api.apnadecoration.com${updatedProduct.thumbnail}`;
                }
                // Try first image in images array
                else if (
                  updatedProduct.images &&
                  updatedProduct.images.length > 0
                ) {
                  const firstImage = updatedProduct.images[0];
                  imageUrl = firstImage.startsWith("http")
                    ? firstImage
                    : `https://admin-api.apnadecoration.com${firstImage}`;
                }
                // Try image field
                else if (updatedProduct.image) {
                  imageUrl = updatedProduct.image.startsWith("http")
                    ? updatedProduct.image
                    : `https://admin-api.apnadecoration.com${updatedProduct.image}`;
                }

                const transformedProduct = {
                  ...product,
                  ...updatedProduct,
                  id: updatedProduct._id || updatedProduct.id,
                  name: updatedProduct.name || updatedProduct.product_name_en,
                  sku: updatedProduct.sku,
                  price: updatedProduct.price,
                  status: updatedProduct.status || "pending",
                  category:
                    updatedProduct.category?.name || updatedProduct.category,
                  description: updatedProduct.description,
                  images: updatedProduct.images || [],
                  thumbnail: updatedProduct.thumbnail,
                  image: imageUrl, // Use processed image URL
                };

                console.log(
                  "🔄 Transformed updated product from sessionStorage:",
                  transformedProduct,
                );
                return transformedProduct;
              }
              return product;
            });

            console.log(
              "✅ Products updated in local state with sessionStorage data",
            );
            return newProducts;
          });

          setRecentlyUpdated(updatedProduct._id);
          console.log("✅ Product updated from sessionStorage");

          // Clear sessionStorage after using it
          sessionStorage.removeItem("updatedProductId");
          sessionStorage.removeItem("updatedProduct");
        }, 500); // Small delay to ensure state is ready
      } catch (error) {
        console.error("❌ Error parsing sessionStorage data:", error);
        sessionStorage.removeItem("updatedProductId");
        sessionStorage.removeItem("updatedProduct");
      }
    }

    // Listen for product updates from EditProduct component
    console.log("🔄 Setting up product update event listener...");

    const handleProductUpdate = (event) => {
      console.log("🔄 Product update event received:", event.detail);

      if (event.detail.updatedProduct) {
        // Use the updated product data from the response immediately
        const updatedProduct = event.detail.updatedProduct;
        console.log(
          "🔄 Using updated product data from event:",
          updatedProduct,
        );

        // Update the specific product in the local state
        setProducts((prev) => {
          console.log(
            "🔄 Updating products array from event, current length:",
            prev.length,
          );
          const newProducts = prev.map((product) => {
            if (
              product._id === updatedProduct._id ||
              product.id === updatedProduct._id
            ) {
              console.log(
                "🔄 Found matching product to update from event:",
                product.name,
              );
              // Transform the updated product to match frontend format
              let imageUrl = null;

              // Try thumbnail first
              if (updatedProduct.thumbnail) {
                imageUrl = updatedProduct.thumbnail.startsWith("http")
                  ? updatedProduct.thumbnail
                  : `https://admin-api.apnadecoration.com${updatedProduct.thumbnail}`;
              }
              // Try first image in images array
              else if (
                updatedProduct.images &&
                updatedProduct.images.length > 0
              ) {
                const firstImage = updatedProduct.images[0];
                imageUrl = firstImage.startsWith("http")
                  ? firstImage
                  : `https://admin-api.apnadecoration.com${firstImage}`;
              }
              // Try image field
              else if (updatedProduct.image) {
                imageUrl = updatedProduct.image.startsWith("http")
                  ? updatedProduct.image
                  : `https://admin-api.apnadecoration.com${updatedProduct.image}`;
              }

              const transformedProduct = {
                ...product,
                ...updatedProduct,
                id: updatedProduct._id || updatedProduct.id,
                name: updatedProduct.name || updatedProduct.product_name_en,
                sku: updatedProduct.sku,
                price: updatedProduct.price,
                status: updatedProduct.status || "pending",
                category:
                  updatedProduct.category?.name || updatedProduct.category,
                description: updatedProduct.description,
                images: updatedProduct.images || [],
                thumbnail: updatedProduct.thumbnail,
                image: imageUrl, // Use processed image URL
              };

              console.log(
                "🔄 Transformed updated product from event:",
                transformedProduct,
              );
              return transformedProduct;
            }
            return product;
          });

          console.log("✅ Products updated in local state from event");
          return newProducts;
        });

        setRecentlyUpdated(updatedProduct._id);
        console.log("✅ Product updated from event");
      } else {
        // Fallback to refresh if no updated product data
        console.log("⚠️ No updatedProduct in event, falling back to refresh");
        setRecentlyUpdated(event.detail.productId);
        setTimeout(() => {
          fetchVendorProducts();
        }, 500);
      }
    };

    // Add event listener
    window.addEventListener("productUpdated", handleProductUpdate);
    console.log("✅ Event listener added for productUpdated");

    // Cleanup on unmount
    return () => {
      console.log("🔄 Cleaning up product update event listener");
      window.removeEventListener("productUpdated", handleProductUpdate);
    };
  }, []); // Empty dependency array ensures this runs only once

  const filteredProducts = products.filter((product) => {
    if (filter === "all") return true;
    return product.status === filter;
  });

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    navigate(`/products/edit/${product.id}`);
    console.log("🔄 Editing product:", product.name);
    console.log("🔄 Product ID:", product.id);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await vendorApi.deleteVendorProduct(product.id);
        // Refresh products list
        fetchVendorProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("Failed to delete product");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending Approval";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        width: "100%",
        flexGrow: 1,
        display: "block",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#1e293b",
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          My Products
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ borderColor: "#2F66FF", color: "#2F66FF" }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/products/add")}
            sx={{ backgroundColor: "#2F66FF" }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Status Filter"
          >
            <MenuItem value="all">All Products</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Products Table */}
      <Card sx={{ overflow: "visible" }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <Typography>Loading products...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                Error Loading Products
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {filter === "all"
                  ? "You haven't added any products yet"
                  : `No ${filter} products found`}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/products/add")}
                sx={{ mt: 2 }}
              >
                Add Product
              </Button>
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
                  {filteredProducts.map((product) => (
                    <Card
                      key={product._id || product.id}
                      sx={{
                        width: "100%",
                        boxSizing: "border-box",
                        backgroundColor:
                          recentlyUpdated === product.id
                            ? "#e8f5e8"
                            : "inherit",
                        border:
                          recentlyUpdated === product.id
                            ? "2px solid #4caf50"
                            : "1px solid #e0e0e0",
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2,
                          "&:last-child": { pb: 2 },
                          overflow: "visible",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            mb: 2,
                            width: "100%",
                            alignItems: "flex-start",
                            minWidth: 0,
                          }}
                        >
                          <Box
                            component="img"
                            src={product.image || product.thumbnail || ""}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 1,
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              if (
                                product.thumbnail &&
                                !e.target.dataset.triedThumbnail
                              ) {
                                e.target.dataset.triedThumbnail = "true";
                                const thumbnailUrl =
                                  product.thumbnail.startsWith("http")
                                    ? product.thumbnail
                                    : `https://admin-api.apnadecoration.com${product.thumbnail}`;
                                e.target.src = thumbnailUrl;
                              } else if (
                                product.images?.[0] &&
                                !e.target.dataset.triedArray
                              ) {
                                e.target.dataset.triedArray = "true";
                                const firstImageUrl =
                                  product.images[0].startsWith("http")
                                    ? product.images[0]
                                    : `https://admin-api.apnadecoration.com${product.images[0]}`;
                                e.target.src = firstImageUrl;
                              } else if (!e.target.dataset.fallback) {
                                e.target.dataset.fallback = "true";
                                e.target.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmY2YjZiIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZDYzNjM2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+";
                              }
                            }}
                          />
                          <Box
                            sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                wordBreak: "break-word",
                              }}
                            >
                              {product.category}
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
                              SKU: {product.sku}
                            </Typography>
                            {!product.image &&
                              !product.thumbnail &&
                              (!product.images ||
                                product.images.length === 0) && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "warning.main",
                                    fontSize: "0.7rem",
                                    fontWeight: 500,
                                    mt: 0.5,
                                  }}
                                >
                                  ⚠️ No images added
                                </Typography>
                              )}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ₹{product.price}
                          </Typography>
                          <Chip
                            label={getStatusText(product.status)}
                            color={getStatusColor(product.status)}
                            size="small"
                          />
                        </Box>

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
                            onClick={() => handleViewDetails(product)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditProduct(product)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                /* Desktop Table View */
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        console.log(
                          " Desktop Table - Rendering product:",
                          product.name,
                        );
                        return (
                          <TableRow
                            key={product._id || product.id}
                            hover
                            sx={{
                              backgroundColor:
                                recentlyUpdated === product.id
                                  ? "#e8f5e8"
                                  : "inherit",
                              border:
                                recentlyUpdated === product.id
                                  ? "2px solid #4caf50"
                                  : "none",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Box
                                  component="img"
                                  src={product.image || product.thumbnail || ""}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "cover",
                                    borderRadius: 1,
                                  }}
                                  onError={(e) => {
                                    // Try thumbnail first
                                    if (
                                      product.thumbnail &&
                                      !e.target.dataset.triedThumbnail
                                    ) {
                                      e.target.dataset.triedThumbnail = "true";
                                      const thumbnailUrl =
                                        product.thumbnail.startsWith("http")
                                          ? product.thumbnail
                                          : `https://admin-api.apnadecoration.com${product.thumbnail}`;
                                      e.target.src = thumbnailUrl;
                                    }
                                    // Try first image from array
                                    else if (
                                      product.images?.[0] &&
                                      !e.target.dataset.triedArray
                                    ) {
                                      e.target.dataset.triedArray = "true";
                                      const firstImageUrl =
                                        product.images[0].startsWith("http")
                                          ? product.images[0]
                                          : `https://admin-api.apnadecoration.com${product.images[0]}`;
                                      e.target.src = firstImageUrl;
                                    }
                                    // Final fallback - show "Add Images" placeholder
                                    else if (!e.target.dataset.fallback) {
                                      e.target.dataset.fallback = "true";
                                      e.target.src =
                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmY2YjZiIi8+Cjx0ZXh0IHg9IjI1IiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZDYzNjM2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+";
                                    }
                                  }}
                                />
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {product.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {product.category}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>₹{product.price}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusText(product.status)}
                                color={getStatusColor(product.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(product)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() => handleEditProduct(product)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={typeof window !== "undefined" && window.innerWidth < 600}
      >
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src={
                    selectedProduct.image ||
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZTVlN2ViIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5M2E1YWIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4="
                  }
                  sx={{
                    width: "100%",
                    height: 200,
                    borderRadius: 2,
                    objectFit: "cover",
                    backgroundColor: "#f0f0f0",
                  }}
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = "true";
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZTVlN2ViIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5M2E1YWIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedProduct.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  SKU: {selectedProduct.sku}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Price: ₹{selectedProduct.price}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Category: {selectedProduct.category}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Description:
                </Typography>
                <Typography variant="body2">
                  {selectedProduct.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={getStatusText(selectedProduct.status)}
                    color={getStatusColor(selectedProduct.status)}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {(() => {
                      if (selectedProduct.status === "pending")
                        return "Waiting for admin approval";
                      if (selectedProduct.status === "approved")
                        return "Visible to customers";
                      if (selectedProduct.status === "rejected")
                        return "Needs corrections";
                    })()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorProducts;
