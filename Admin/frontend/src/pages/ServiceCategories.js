import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  FileUpload as FileUploadIcon,
  RoomService,
  Cake,
  Favorite,
  Celebration,
  LocalFlorist,
  Business,
} from "@mui/icons-material";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://admin-api.apnadecoration.com/api";

function ServiceCategories() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    categoryId: null,
    currentValue: false,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const params = {
        ...(searchTerm && { search: searchTerm }),
      };

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_BASE_URL}/service-categories`, {
        params,
        headers,
      });

      console.log("Service categories fetched:", response.data);
      setCategories(response.data.categories || response.data.data || []);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      if (error.response?.status === 401) {
        setCategories([]);
        alert("Your session has expired. Please login again.");
      } else {
        setCategories([]);
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, fetchCategories]);

  const [formData, setFormData] = useState({
    name: "",
    priority: 1,
    categoryImage: null,
    homeCategory: false,
    status: "active",
    order: 0,
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          categoryImage: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("homeCategory", formData.homeCategory || false);
      formDataToSend.append("status", formData.status || "active");
      formDataToSend.append("order", formData.order || 0);

      // Add image file if it exists and is a File object
      const imageInput = document.getElementById(
        "service-category-image-upload",
      );
      if (imageInput && imageInput.files[0]) {
        formDataToSend.append("categoryImage", imageInput.files[0]);
      }

      if (editMode) {
        await axios.put(
          `${API_BASE_URL}/service-categories/${editId}`,
          formDataToSend,
          {
            headers: {
              ...headers,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        alert("Service category updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/service-categories`, formDataToSend, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Service category added successfully!");
      }

      handleReset();
      await fetchCategories();
    } catch (error) {
      console.error("Error saving service category:", error);
      alert(
        `Failed to save service category: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      priority: 1,
      categoryImage: null,
      homeCategory: false,
      status: "active",
      order: 0,
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (category) => {
    console.log("Editing category:", category);
    setFormData({
      name: category.name,
      priority: category.priority,
      categoryImage: category.image,
      homeCategory: category.homeCategory || false,
      status: category.status || "active",
      order: category.order || 0,
    });
    setEditMode(true);
    setEditId(category._id || category.id);
  };

  const handleDelete = (id) => {
    console.log("Delete called with ID:", id);
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_BASE_URL}/service-categories/${deleteId}`, {
        headers,
      });
      await fetchCategories();
      setDeleteDialogOpen(false);
      setDeleteId(null);
      alert("Service category deleted successfully!");
    } catch (error) {
      console.error("Error deleting service category:", error);
      alert(
        `Failed to delete service category: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const toggleHomeCategory = (id, currentValue) => {
    setToggleDialog({
      open: true,
      categoryId: id,
      currentValue: currentValue,
    });
  };

  const confirmToggleHomeCategory = async () => {
    try {
      const { categoryId, currentValue } = toggleDialog;
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.patch(
        `${API_BASE_URL}/service-categories/${categoryId}/toggle-status`,
        {
          homeCategory: !currentValue,
        },
        { headers },
      );

      setToggleDialog({ open: false, categoryId: null, currentValue: false });
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling service category home category:", error);
      alert(
        `Failed to toggle home category: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const closeToggleDialog = () => {
    setToggleDialog({ open: false, categoryId: null, currentValue: false });
  };

  const handleSearch = () => {
    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return filtered;
  };

  const handleExport = () => {
    const csvContent = [
      ["ID", "Name", "Priority", "Home Category", "Status"],
      ...categories.map((cat) => [
        cat._id || cat.id,
        cat.name,
        cat.priority,
        cat.homeCategory ? "Yes" : "No",
        cat.status || "active",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "service-categories.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const displayCategories = searchTerm ? handleSearch() : categories;

  return (
    <Box sx={{ p: 2, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
          Service Category Setup
        </Typography>
        <Button
          variant="contained"
          startIcon={<DashboardIcon />}
          sx={{ backgroundColor: "#1976d2" }}
          onClick={() => (window.location.href = "/dashboard")}
        >
          Dashboard
        </Button>
      </Box>

      {/* Language Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          backgroundColor: "white",
        }}
      >
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab key="en" label="English (EN)" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {/* Service Category Setup Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, height: "fit-content" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 600, color: "#333" }}
              >
                {editMode ? "Edit Service Category" : "Service Category Setup"}
              </Typography>

              {/* Category Name */}
              <TextField
                fullWidth
                label="Category Name* (EN)"
                value={formData.name}
                onChange={handleInputChange("name")}
                required
                sx={{ mb: 2 }}
                size="small"
              />

              {/* Priority */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={handleInputChange("priority")}
                  label="Priority"
                  size="small"
                >
                  {[...Array(20)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Category Image Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: "#666", fontSize: "12px" }}
                >
                  Category Logo • Ratio 1:1 (500 x 500 px)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    id="service-category-image-upload"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="service-category-image-upload"
                    startIcon={<FileUploadIcon />}
                    size="small"
                    sx={{ borderColor: "#ddd", color: "#666" }}
                  >
                    Choose File
                  </Button>
                  {formData.categoryImage && (
                    <Avatar
                      src={
                        formData.categoryImage.startsWith("http")
                          ? formData.categoryImage
                          : `${process.env.REACT_APP_API_URL || "https://admin-api.apnadecoration.com"}${formData.categoryImage}`
                      }
                      sx={{ width: 50, height: 50 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Form Buttons */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  size="small"
                  sx={{ borderColor: "#ddd", color: "#666" }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  size="small"
                  sx={{ backgroundColor: "#1976d2" }}
                >
                  {editMode ? "Update" : "Submit"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Category List */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#333" }}
                >
                  Service Category List ({displayCategories.length})
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TextField
                    placeholder="Search by category name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <SearchIcon
                          sx={{ mr: 1, color: "#666", fontSize: 20 }}
                        />
                      ),
                    }}
                    sx={{
                      minWidth: 250,
                      "& .MuiOutlinedInput-root": { borderColor: "#ddd" },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleExport}
                    size="small"
                    sx={{ borderColor: "#ddd", color: "#666" }}
                  >
                    Export
                  </Button>
                </Box>
              </Box>

              {/* Service Category Table */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e0e0e0" }}
              >
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
                        ID
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Category Image
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Priority
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Home Category Status
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
                    {displayCategories.map((category) => (
                      <TableRow
                        key={category._id || category.id}
                        hover
                        sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                      >
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {category._id || category.id}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          <Avatar
                            src={
                              category.image?.startsWith("http")
                                ? category.image
                                : category.image
                                  ? `${process.env.REACT_APP_API_URL || "https://admin-api.apnadecoration.com"}${category.image}`
                                  : null
                            }
                            sx={{
                              width: 60,
                              height: 60,
                              backgroundColor: "#f5f5f5",
                            }}
                            variant="rounded"
                          >
                            {!category.image &&
                              (() => {
                                const iconMap = {
                                  roomService: (
                                    <RoomService sx={{ color: "#999" }} />
                                  ),
                                  cake: <Cake sx={{ color: "#999" }} />,
                                  favorite: <Favorite sx={{ color: "#999" }} />,
                                  celebration: (
                                    <Celebration sx={{ color: "#999" }} />
                                  ),
                                  localFlorist: (
                                    <LocalFlorist sx={{ color: "#999" }} />
                                  ),
                                  business: <Business sx={{ color: "#999" }} />,
                                };
                                return (
                                  iconMap[category.icon] || (
                                    <CategoryIcon sx={{ color: "#999" }} />
                                  )
                                );
                              })()}
                          </Avatar>
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: "1px solid #e0e0e0",
                            color: "#333",
                          }}
                        >
                          {category.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: "1px solid #e0e0e0",
                            color: "#333",
                          }}
                        >
                          <Chip
                            label={category.priority || 1}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              backgroundColor: "#e3f2fd",
                              borderColor: "#1976d2",
                              color: "#1976d2",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          <Switch
                            checked={category.homeCategory}
                            onChange={() =>
                              toggleHomeCategory(
                                category._id || category.id,
                                category.homeCategory,
                              )
                            }
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ color: "#1976d2" }}
                              onClick={() => handleEdit(category)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "#f44336" }}
                              onClick={() =>
                                handleDelete(category._id || category.id)
                              }
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this service category? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toggle Home Category Confirmation Dialog */}
      <Dialog open={toggleDialog.open} onClose={closeToggleDialog}>
        <DialogTitle>Toggle Home service Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {toggleDialog.currentValue ? "remove" : "add"} this service category
            from home page?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeToggleDialog}>Cancel</Button>
          <Button
            onClick={confirmToggleHomeCategory}
            color="primary"
            variant="contained"
          >
            {toggleDialog.currentValue ? "Remove" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ServiceCategories;
