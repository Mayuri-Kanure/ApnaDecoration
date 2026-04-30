import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Menu,
  MenuItem as MenuItemComponent,
  TablePagination,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Dashboard as DashboardIcon,
  Inventory as ProductIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  QrCode as BarcodeIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

function InHouseProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [subSubCategoryFilter, setSubSubCategoryFilter] = useState("all");
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      productType: "Physical",
      unitPrice: 299.99,
      featured: true,
      active: true,
      stock: 45,
      thumbnail: null,
      brand: "AudioTech",
      category: "Electronics",
      subCategory: "Audio",
      subSubCategory: "Headphones",
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      productType: "Physical",
      unitPrice: 29.99,
      featured: false,
      active: true,
      stock: 120,
      thumbnail: null,
      brand: "EcoWear",
      category: "Fashion",
      subCategory: "Men",
      subSubCategory: "T-Shirts",
    },
    {
      id: 3,
      name: "Smart Fitness Watch",
      productType: "Physical",
      unitPrice: 199.99,
      featured: true,
      active: false,
      stock: 0,
      thumbnail: null,
      brand: "FitTech",
      category: "Electronics",
      subCategory: "Wearables",
      subSubCategory: "Smart Watches",
    },
    {
      id: 4,
      name: "Stainless Steel Water Bottle",
      productType: "Physical",
      unitPrice: 24.99,
      featured: false,
      active: true,
      stock: 8,
      thumbnail: null,
      brand: "HydroMax",
      category: "Sports",
      subCategory: "Accessories",
      subSubCategory: "Bottles",
    },
    {
      id: 5,
      name: "Professional DSLR Camera",
      productType: "Physical",
      unitPrice: 1299.99,
      featured: true,
      active: true,
      stock: 12,
      thumbnail: null,
      brand: "PhotoPro",
      category: "Electronics",
      subCategory: "Photography",
      subSubCategory: "Cameras",
    },
    {
      id: 6,
      name: "Yoga Mat Premium",
      productType: "Physical",
      unitPrice: 39.99,
      featured: false,
      active: true,
      stock: 95,
      thumbnail: null,
      brand: "YogaLife",
      category: "Sports",
      subCategory: "Fitness",
      subSubCategory: "Yoga Equipment",
    },
    {
      id: 7,
      name: "Digital Marketing eBook",
      productType: "Digital",
      unitPrice: 49.99,
      featured: false,
      active: true,
      stock: 999,
      thumbnail: null,
      brand: "DigitalPro",
      category: "Digital",
      subCategory: "Books",
      subSubCategory: "eBooks",
    },
    {
      id: 8,
      name: "Wireless Charging Pad",
      productType: "Physical",
      unitPrice: 34.99,
      featured: false,
      active: true,
      stock: 5,
      thumbnail: null,
      brand: "ChargeTech",
      category: "Electronics",
      subCategory: "Accessories",
      subSubCategory: "Charging",
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] =
    useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const brands = [
    "All Brands",
    "AudioTech",
    "EcoWear",
    "FitTech",
    "HydroMax",
    "PhotoPro",
    "YogaLife",
    "DigitalPro",
    "ChargeTech",
  ];
  const categories = [
    "Select category",
    "Electronics",
    "Fashion",
    "Sports",
    "Digital",
  ];
  const subCategories = {
    Electronics: ["Audio", "Wearables", "Photography", "Accessories"],
    Fashion: ["Men", "Women", "Kids"],
    Sports: ["Accessories", "Fitness"],
    Digital: ["Books", "Software"],
  };
  const subSubCategories = {
    Audio: ["Headphones", "Speakers", "Earphones"],
    Wearables: ["Smart Watches", "Fitness Trackers"],
    Photography: ["Cameras", "Lenses", "Accessories"],
    Accessories: ["Charging", "Cables", "Cases"],
    Men: ["T-Shirts", "Shirts", "Jeans"],
    Women: ["Dresses", "Tops", "Skirts"],
    Kids: ["Toys", "Clothing", "Books"],
    Accessories: ["Bottles", "Bags", "Equipment"],
    Fitness: ["Yoga Equipment", "Weights", "Mats"],
    Books: ["eBooks", "Audiobooks"],
    Software: ["Tools", "Games", "Education"],
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleBrandFilterChange = (event) => {
    setBrandFilter(event.target.value);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setSubCategoryFilter("all");
    setSubSubCategoryFilter("all");
  };

  const handleSubCategoryFilterChange = (event) => {
    setSubCategoryFilter(event.target.value);
    setSubSubCategoryFilter("all");
  };

  const handleSubSubCategoryFilterChange = (event) => {
    setSubSubCategoryFilter(event.target.value);
  };

  const handleResetFilters = () => {
    setBrandFilter("all");
    setCategoryFilter("all");
    setSubCategoryFilter("all");
    setSubSubCategoryFilter("all");
    setSearchTerm("");
  };

  const handleShowData = () => {
    // Apply filters logic would go here
    console.log("Applying filters");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBrand =
      brandFilter === "all" ||
      brandFilter === "All Brands" ||
      product.brand === brandFilter;
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesSubCategory =
      subCategoryFilter === "all" || product.subCategory === subCategoryFilter;
    const matchesSubSubCategory =
      subSubCategoryFilter === "all" ||
      product.subSubCategory === subSubCategoryFilter;

    return (
      matchesSearch &&
      matchesBrand &&
      matchesCategory &&
      matchesSubCategory &&
      matchesSubSubCategory
    );
  });

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleBarcode = (product) => {
    setSelectedProductForBarcode(product);
    setBarcodeDialogOpen(true);
  };

  const generateBarcode = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 200;
    const height = 100;

    canvas.width = width;
    canvas.height = height;

    // Simple barcode representation
    ctx.fillStyle = "#000";
    const barcodeData = selectedProductForBarcode.id
      .toString()
      .padStart(10, "0");
    const barWidth = width / barcodeData.length;

    barcodeData.split("").forEach((digit, index) => {
      if (parseInt(digit) % 2 === 0) {
        ctx.fillRect(index * barWidth, 10, barWidth, 60);
      }
    });

    // Add product name below barcode
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(selectedProductForBarcode.name, width / 2, 85);

    // Download barcode image
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `barcode-${selectedProductForBarcode.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const saveEditedProduct = () => {
    setLoading(true);
    setTimeout(() => {
      setProducts(
        products.map((product) =>
          product.id === selectedProduct.id ? selectedProduct : product,
        ),
      );
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setLoading(false);
      setSuccessMessage("Product updated successfully!");
    }, 500);
  };

  const confirmDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      setLoading(false);
      setSuccessMessage("Product deleted successfully!");
    }, 500);
  };

  const toggleProductStatus = (id) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, active: !product.active } : product,
      ),
    );
  };

  const toggleFeatured = (id) => {
    setProducts(
      products.map((product) =>
        product.id === id
          ? { ...product, featured: !product.featured }
          : product,
      ),
    );
  };

  const handleExport = () => {
    const csvContent = [
      [
        "SL",
        "Product Name",
        "Product Type",
        "Unit Price",
        "Featured",
        "Active Status",
      ],
      ...filteredProducts.map((product, index) => [
        index + 1,
        product.name,
        product.productType,
        product.unitPrice,
        product.featured ? "Yes" : "No",
        product.active ? "Active" : "Inactive",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "in-house-product-list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLimitedStock = () => {
    // Filter products with stock less than 10
    const limitedStockProducts = products.filter((p) => p.stock < 10);
    alert(`Found ${limitedStockProducts.length} products with limited stock`);
  };

  const handleAddNewProduct = () => {
    alert("Navigate to product creation form");
  };

  const getProductImage = (productName, productType) => {
    const seed = productName.toLowerCase().replace(/\s+/g, "-");
    const size = 40;
    return `https://picsum.photos/seed/${seed}/${size}/${size}.jpg`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.8)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ProductIcon sx={{ fontSize: 32, color: "#1976d2" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
            In House Product List ({products.length})
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DashboardIcon />}
          sx={{ backgroundColor: "#1976d2" }}
        >
          Dashboard
        </Button>
      </Box>

      {/* Filter Panel */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3, color: "#333" }}
          >
            Filter Products
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select
                  value={brandFilter === "all" ? "All Brands" : brandFilter}
                  onChange={handleBrandFilterChange}
                  label="Brand"
                >
                  {brands.map((brand) => (
                    <MenuItem
                      key={brand}
                      value={brand === "All Brands" ? "all" : brand}
                    >
                      {brand}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem
                      key={category}
                      value={category === "Select category" ? "all" : category}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl
                fullWidth
                size="small"
                disabled={
                  categoryFilter === "all" || !subCategories[categoryFilter]
                }
              >
                <InputLabel>Sub Category</InputLabel>
                <Select
                  value={subCategoryFilter}
                  onChange={handleSubCategoryFilterChange}
                  label="Sub Category"
                >
                  <MenuItem value="all">All Sub Categories</MenuItem>
                  {categoryFilter !== "all" &&
                    subCategories[categoryFilter]?.map((subCat) => (
                      <MenuItem key={subCat} value={subCat}>
                        {subCat}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl
                fullWidth
                size="small"
                disabled={
                  subCategoryFilter === "all" ||
                  !subSubCategories[subCategoryFilter]
                }
              >
                <InputLabel>Sub Sub Category</InputLabel>
                <Select
                  value={subSubCategoryFilter}
                  onChange={handleSubSubCategoryFilterChange}
                  label="Sub Sub Category"
                >
                  <MenuItem value="all">All Sub Sub Categories</MenuItem>
                  {subCategoryFilter !== "all" &&
                    subSubCategories[subCategoryFilter]?.map((subSubCat) => (
                      <MenuItem key={subSubCat} value={subSubCat}>
                        {subSubCat}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.2}>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                fullWidth
                sx={{ height: 40 }}
              >
                Reset
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={1.2}>
              <Button
                variant="contained"
                onClick={handleShowData}
                fullWidth
                sx={{ height: 40, backgroundColor: "#1976d2" }}
              >
                Show Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search Bar Section */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by Product Name"
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "#666" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  sx={{ backgroundColor: "#1976d2" }}
                >
                  Search
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  sx={{ backgroundColor: "#4caf50" }}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<WarningIcon />}
                  onClick={handleLimitedStock}
                  sx={{ backgroundColor: "#ff9800" }}
                >
                  Limited Stocks
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNewProduct}
                  sx={{ backgroundColor: "#2196f3" }}
                >
                  Add New Product
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Product Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: "#fafafa" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    SL
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Product Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Product Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Unit Price
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Show as Featured
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Active Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product, index) => (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f5f5f5" },
                      backgroundColor: index % 2 === 0 ? "white" : "#fafafa",
                    }}
                  >
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#f5f5f5",
                          }}
                          src={getProductImage(
                            product.name,
                            product.productType,
                          )}
                        >
                          {!getProductImage(
                            product.name,
                            product.productType,
                          ) && (
                            <ProductIcon sx={{ fontSize: 20, color: "#999" }} />
                          )}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#333" }}
                        >
                          {product.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      <Chip
                        label={product.productType}
                        size="small"
                        color={
                          product.productType === "Digital"
                            ? "primary"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1976d2" }}
                      >
                        ₹{product.unitPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      <Switch
                        checked={product.featured}
                        onChange={() => toggleFeatured(product.id)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      <Switch
                        checked={product.active}
                        onChange={() => toggleProductStatus(product.id)}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          sx={{ color: "#666" }}
                          onClick={() => handleBarcode(product)}
                        >
                          <BarcodeIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#1976d2" }}
                          onClick={() => handleViewDetails(product)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#4caf50" }}
                          onClick={() => handleEdit(product)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#f44336" }}
                          onClick={() => handleDelete(product)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ border: "1px solid #e0e0e0", borderTop: "none" }}
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Product ID:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProduct.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Product Name:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProduct.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Brand:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProduct.brand}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Product Type:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProduct.productType}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Unit Price:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}
                >
                  ₹{selectedProduct.unitPrice.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Stock:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProduct.stock} units
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Category:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProduct.category}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Sub Category:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProduct.subCategory}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Featured:
                </Typography>
                <Chip
                  label={selectedProduct.featured ? "Yes" : "No"}
                  size="small"
                  color={selectedProduct.featured ? "primary" : "default"}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Active Status:
                </Typography>
                <Chip
                  label={selectedProduct.active ? "Active" : "Inactive"}
                  size="small"
                  color={selectedProduct.active ? "success" : "error"}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      name: e.target.value,
                    })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={selectedProduct.brand}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        brand: e.target.value,
                      })
                    }
                    label="Brand"
                  >
                    {brands
                      .filter((b) => b !== "All Brands")
                      .map((brand) => (
                        <MenuItem key={brand} value={brand}>
                          {brand}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Product Type</InputLabel>
                  <Select
                    value={selectedProduct.productType}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        productType: e.target.value,
                      })
                    }
                    label="Product Type"
                  >
                    <MenuItem value="Physical">Physical</MenuItem>
                    <MenuItem value="Digital">Digital</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={selectedProduct.unitPrice}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      unitPrice: parseFloat(e.target.value),
                    })
                  }
                  margin="normal"
                  inputProps={{ step: 0.01, min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  type="number"
                  value={selectedProduct.stock}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      stock: parseInt(e.target.value),
                    })
                  }
                  margin="normal"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedProduct.category}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        category: e.target.value,
                      })
                    }
                    label="Category"
                  >
                    {categories
                      .filter((c) => c !== "Select category")
                      .map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Sub Category</InputLabel>
                  <Select
                    value={selectedProduct.subCategory}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        subCategory: e.target.value,
                      })
                    }
                    label="Sub Category"
                  >
                    {subCategories[selectedProduct.category]?.map((subCat) => (
                      <MenuItem key={subCat} value={subCat}>
                        {subCat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Sub Sub Category</InputLabel>
                  <Select
                    value={selectedProduct.subSubCategory}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        subSubCategory: e.target.value,
                      })
                    }
                    label="Sub Sub Category"
                  >
                    {subSubCategories[selectedProduct.subCategory]?.map(
                      (subSubCat) => (
                        <MenuItem key={subSubCat} value={subSubCat}>
                          {subSubCat}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Featured Product
                  </Typography>
                  <Switch
                    checked={selectedProduct.featured}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        featured: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Active Status
                  </Typography>
                  <Switch
                    checked={selectedProduct.active}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        active: e.target.checked,
                      })
                    }
                    color="success"
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={saveEditedProduct}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog
        open={barcodeDialogOpen}
        onClose={() => setBarcodeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Barcode</DialogTitle>
        <DialogContent>
          {selectedProductForBarcode && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Generate barcode for:{" "}
                <strong>{selectedProductForBarcode.name}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
                Product ID: {selectedProductForBarcode.id}
              </Typography>
              <Button
                variant="contained"
                onClick={generateBarcode}
                startIcon={<BarcodeIcon />}
                sx={{ backgroundColor: "#1976d2" }}
              >
                Generate & Download Barcode
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodeDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InHouseProductList;
