import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tabs,
  Tab,
  Paper,
  Switch,
  FormControlLabel,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  InputAdornment,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import InfoIcon from "@mui/icons-material/Info";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";

// ----------
// AddProduct Page
// Put this file at: frontend/src/pages/AddProduct.jsx (or your pages/ directory)
// Install required deps:
// npm install @mui/material @mui/icons-material react-hook-form axios react-quill
// ----------

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const quillRef = useRef(null);

  // Check if we're in edit mode - only true on edit-product route
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Handle location state properly to prevent infinite loops
  useEffect(() => {
    const isEditRoute =
      location.pathname === "/dashboard/edit-product" && location.state?.isEdit;
    setIsEditMode(isEditRoute);
    setEditingProduct(location.state?.product || null);

    // If we have location.state with product data, also set it in localStorage for consistency
    if (location.state?.product && location.state?.isEdit) {
      localStorage.setItem("editProductId", location.state.product._id);
      localStorage.setItem(
        "editProductData",
        JSON.stringify(location.state.product),
      );
    }
  }, [location.pathname, location.state]);
  const { control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      product_name_en: "",
      description_en: "",
      category_id: "",
      product_type: "physical",
      sku: "",
      unit: "pcs",
      tags: [],
      unit_price: "",
      mrp_price: "",
      discount_price: "",
      discounted_price: "",
      min_order_qty: "1",
      stock: "",
      discount_type: "flat",
      discount_amount: "",
      tax_percent: "",
      tax_calculation: "include",
      shipping_cost: "",
      occasions: [],
      colors: [],
      material: "",
      included_components: "",
      theme: "",
      net_quantity: "",
      size: "",
      item_dimensions: "",
      color: "",
      about_item: "",
      video_link: "",
      meta_title: "",
      meta_description: "",
      indexing_option: "index",
      max_snippet: "-1",
      max_video_preview: "-1",
      max_image_preview: "large",
      shipping_multiply_quantity: false,
      variations: [],
      specifications: {},
      status: "active",
      is_featured: false,
      created_at: "",
      updated_at: "",
      vendor_id: "",
      approved: true,
      thumbnail: "",
      additional_images: [],
      color_wise_images: {},
      meta_image: "",
    },
  });

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [enableColors, setEnableColors] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [occasionInput, setOccasionInput] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Fetch categories and other data
  const [selectedProductColors, setSelectedProductColors] = useState([]);
  const [productColorInput, setProductColorInput] = useState("");
  const [aboutItemPoints, setAboutItemPoints] = useState([]);
  const [aboutItemInput, setAboutItemInput] = useState("");

  // Product Image Management states
  const [productThumbnail, setProductThumbnail] = useState(null);
  const [colorWiseImages, setColorWiseImages] = useState({});
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedColorImage, setSelectedColorImage] = useState(null);
  const [selectedAdditionalImage, setSelectedAdditionalImage] = useState(null);
  const [metaImage, setMetaImage] = useState(null);
  const tags = watch("tags");
  const discountType = watch("discount_type");

  // Fetch categories and other data
  useEffect(() => {
    console.log("🔍 useEffect triggered for data fetching");
    console.log("🔍 Current pathname:", location.pathname);
    console.log("🔍 Location search:", location.search);
    console.log("🔍 Location state:", location.state);

    // Check if we're on edit page and have product data
    if (location.pathname === "/dashboard/edit-product") {
      // Get product ID from location.state first (from product list)
      let editId = location.state?.product?._id;

      // Fallback: try URL params if no location.state
      if (!editId) {
        const urlParams = new URLSearchParams(location.search);
        editId = urlParams.get("id");
      }

      console.log("🔍 Edit ID:", editId);

      if (editId) {
        // Fetch fresh product data from API
        const fetchProductData = async () => {
          try {
            console.log("🔍 Fetching product data for edit:", editId);
            const productData = await apiService.getProduct(editId);
            console.log("✅ Product data fetched:", productData);
            console.log("🔍 Checking specific fields:");
            console.log("- mrp_price:", productData.mrp_price);
            console.log("- occasions:", productData.occasions);
            console.log("- colors:", productData.colors);
            console.log("- material:", productData.material);
            console.log(
              "- included_components:",
              productData.included_components,
            );
            console.log("- theme:", productData.theme);
            console.log("- net_quantity:", productData.net_quantity);
            console.log("- size:", productData.size);
            console.log("- item_dimensions:", productData.item_dimensions);
            console.log("- color:", productData.color);

            // Populate form with fresh API data
            reset({
              product_name_en:
                productData.product_name_en || productData.name || "",
              description_en:
                productData.description_en || productData.description || "",
              category_id:
                productData.category_id || productData.category || "",
              sku: productData.sku || "",
              unit_price: productData.unit_price ?? productData.price ?? "",
              mrp_price: productData.mrp_price ?? productData.price ?? "", // Use price as fallback for MRP
              discount_type: productData.discount_type || "flat",
              discount_amount:
                productData.discount_amount ?? productData.discount_price ?? "",
              tax_percent: productData.tax_percent ?? "",
              tax_calculation: productData.tax_calculation || "include",
              shipping_cost: productData.shipping_cost ?? "",
              shipping_multiply_quantity:
                productData.shipping_multiply_quantity || false,
              stock: productData.stock ?? "100", // Default stock for vendor products
              min_order_qty: productData.min_order_qty ?? "1",
              max_order_qty: productData.max_order_qty ?? "",
              tags: productData.tags || [],
              occasions: productData.occasions || [], // Vendor products may not have this
              colors: productData.colors || [], // Vendor products may not have this
              material: productData.material || "", // Vendor products may not have this
              included_components:
                productData.included_components ||
                productData.description ||
                "", // Use description as fallback
              theme: productData.theme || productData.name || "", // Use name as fallback
              net_quantity: productData.net_quantity || "",
              size: productData.size || "",
              item_dimensions: productData.item_dimensions || "",
              color: productData.color || "",
              status: productData.status || "active",
              is_featured: productData.is_featured || false,
              video_link: productData.video_link || "",
              meta_title: productData.meta_title || productData.name || "",
              meta_description:
                productData.meta_description || productData.description || "",
              indexing_option: productData.indexing_option || "index",
              max_snippet: productData.max_snippet || "-1",
              max_video_preview: productData.max_video_preview || "-1",
              max_image_preview: productData.max_image_preview || "large",
            });

            // Load images from fresh API data with proper URL handling
            if (productData.thumbnail) {
              setProductThumbnail({
                preview: productData.thumbnail.startsWith("http")
                  ? productData.thumbnail
                  : `${apiService.baseURL}/${productData.thumbnail}`,
              });
            }

            // Handle both additional_images (admin) and images (vendor) arrays
            const imageArray =
              productData.additional_images || productData.images || [];
            if (Array.isArray(imageArray) && imageArray.length > 0) {
              setAdditionalImages(
                imageArray.map((img) => ({
                  preview: img.startsWith("http")
                    ? img
                    : `${apiService.baseURL}/${img}`,
                })),
              );
            }

            if (productData.meta_image) {
              setMetaImage({
                preview: productData.meta_image.startsWith("http")
                  ? productData.meta_image
                  : `${apiService.baseURL}/${productData.meta_image}`,
              });
            }

            console.log("✅ Form populated with fresh data");
          } catch (error) {
            console.error("❌ Error fetching product data:", error);
            alert("Failed to load product data. Please try again.");
          } finally {
            setLoading(false);
          }
        };

        fetchProductData();
      } else {
        // Show error message if on edit page but no product ID
        alert(
          "No product ID provided for editing. Please select a product to edit from the product list.",
        );
        navigate("/dashboard/products");
      }
    } else {
      // For add-new-product page, just load basic lists
      console.log("🔍 Loading new product form");
      fetchLists();
    }
  }, [location.pathname, location.search, location.state, navigate]);

  async function fetchLists() {
    try {
      const [categoriesData, attributesData] = await Promise.all([
        apiService.getCategories(),
        axios.get(`${apiService.baseURL}/attributes`),
      ]);

      // Set real data from API
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setAttributes(attributesData.data || []);
    } catch (err) {
      console.error("Failed to load lists from API:", err);
      alert(
        "Failed to load categories or attributes. Please check if the backend server is running.",
      );

      // Set empty arrays instead of mock data
      setCategories([]);
      setAttributes([]);
    }
  }

  function generateSKU() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const code = `SKU-${timestamp}-${random}`;
    setValue("sku", code);
    return code;
  }

  // Generate variations based on selected attributes
  function generateVariations() {
    const variations = [];
    let id = 1;

    // Get all combinations
    if (enableColors && selectedAttributes.includes("size")) {
      // Both color and size selected
      selectedColors.forEach((color) => {
        selectedSizes.forEach((size) => {
          variations.push({
            id: id++,
            color,
            size,
            sku: `SPTFM&W-${color}-${size}`,
            price: "",
            stock: "10",
          });
        });
      });
    } else if (enableColors) {
      // Only color selected
      selectedColors.forEach((color) => {
        variations.push({
          id: id++,
          color,
          size: null,
          sku: `SPTFM&W-${color}`,
          price: "",
          stock: "10",
        });
      });
    } else if (selectedAttributes.includes("size")) {
      // Only size selected
      selectedSizes.forEach((size) => {
        variations.push({
          id: id++,
          color: null,
          size,
          sku: `SPTFM&W-${size}`,
          price: "",
          stock: "10",
        });
      });
    }

    setGeneratedVariations(variations);
  }

  // Update variation field
  function updateVariation(index, field, value) {
    const updatedVariations = [...generatedVariations];
    updatedVariations[index][field] = value;
    setGeneratedVariations(updatedVariations);
  }

  // Get color hex for display
  function getColorHex(color) {
    const colorMap = {
      Red: "#ef4444",
      "Dark Green": "#166534",
      Black: "#000000",
      Blue: "#2563eb",
      White: "#f3f4f6",
      Yellow: "#eab308",
    };
    return colorMap[color] || "#6b7280";
  }

  // Add color from input
  function addColorFromInput() {
    const colorName = colorInput.trim();
    if (colorName && !selectedColors.includes(colorName)) {
      setSelectedColors((prev) => [...prev, colorName]);
      setColorInput("");
    }
  }

  // Handle color input key press
  function handleColorInputKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addColorFromInput();
    }
  }

  // New handler functions for product specifications
  function addOccasionFromInput() {
    const occasion = occasionInput.trim();
    if (occasion && !selectedOccasions.includes(occasion)) {
      setSelectedOccasions((prev) => [...prev, occasion]);
      setOccasionInput("");
      setValue("occasions", [...selectedOccasions, occasion]);
    }
  }

  function handleOccasionInputKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addOccasionFromInput();
    }
  }

  function deleteOccasion(occasionToDelete) {
    const updated = selectedOccasions.filter((o) => o !== occasionToDelete);
    setSelectedOccasions(updated);
    setValue("occasions", updated);
  }

  function addProductColorFromInput() {
    const color = productColorInput.trim();
    if (color && !selectedProductColors.includes(color)) {
      setSelectedProductColors((prev) => [...prev, color]);
      setProductColorInput("");
      setValue("colors", [...selectedProductColors, color]);
    }
  }

  function handleProductColorInputKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addProductColorFromInput();
    }
  }

  function deleteProductColor(colorToDelete) {
    const updated = selectedProductColors.filter((c) => c !== colorToDelete);
    setSelectedProductColors(updated);
    setValue("colors", updated);
  }

  function addAboutItemPoint() {
    const point = aboutItemInput.trim();
    if (point && !aboutItemPoints.includes(point)) {
      setAboutItemPoints((prev) => [...prev, point]);
      setAboutItemInput("");
      setValue("about_item", aboutItemPoints.concat(point).join("\n"));
    }
  }

  function handleAboutItemInputKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addAboutItemPoint();
    }
  }

  function deleteAboutItemPoint(pointToDelete) {
    const updated = aboutItemPoints.filter((p) => p !== pointToDelete);
    setAboutItemPoints(updated);
    setValue("about_item", updated.join("\n"));
  }

  // Product Image Management Functions
  function handleProductThumbnailUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductThumbnail({
          file,
          preview: reader.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleColorImageUpload(color, e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setColorWiseImages((prev) => ({
          ...prev,
          [color]: {
            file,
            preview: reader.result,
            name: file.name,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleAdditionalImagesUpload(e) {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setAdditionalImages((prev) => [...prev, ...newImages]);
  }

  function removeProductThumbnail() {
    setProductThumbnail(null);
  }

  function removeColorImage(color) {
    setColorWiseImages((prev) => {
      const newState = { ...prev };
      delete newState[color];
      return newState;
    });
    if (selectedColorImage === color) {
      setSelectedColorImage(null);
    }
  }

  function removeAdditionalImage(index) {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedAdditionalImage === index) {
      setSelectedAdditionalImage(null);
    }
  }

  function selectColorImage(color) {
    setSelectedColorImage(color);
  }

  function selectAdditionalImage(index) {
    setSelectedAdditionalImage(index);
  }

  function handleMetaImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMetaImage({
          file,
          preview: reader.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  function removeMetaImage() {
    setMetaImage(null);
  }

  function handleAddTagFromInput(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.target.value.trim();
      if (!val || (tags && tags.includes(val))) return;
      const next = Array.from(new Set([...(tags || []), val]));
      setValue("tags", next, { shouldValidate: true, shouldDirty: true });
      e.target.value = "";
    }
  }

  function handleDeleteTag(tagToDelete) {
    const next = (tags || []).filter((t) => t !== tagToDelete);
    setValue("tags", next, { shouldValidate: true, shouldDirty: true });
  }

  function onSelectThumbnail(e) {
    const file = e.target.files[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  function removeThumbnail() {
    setThumbnailPreview(null);
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      // prepare formdata for images
      const fd = new FormData();
      fd.append("product_name_en", data.product_name_en || "");
      fd.append("description_en", data.description_en || "");
      fd.append("category_id", data.category_id);
      fd.append("product_type", data.product_type);
      fd.append("sku", data.sku);
      fd.append("unit", data.unit);
      fd.append("tags", JSON.stringify(data.tags || []));

      // Add pricing and other fields
      fd.append("brand", data.brand || "");
      fd.append("unit_price", data.unit_price ?? "");
      fd.append("min_order_qty", data.min_order_qty ?? "1");
      fd.append("stock", data.stock ?? "");
      fd.append("discount_type", data.discount_type || "flat");
      fd.append("discount_amount", data.discount_amount ?? "");
      fd.append("tax_percent", data.tax_percent ?? "");
      fd.append("tax_calculation", data.tax_calculation || "include");
      fd.append("shipping_cost", data.shipping_cost ?? "");
      fd.append(
        "shipping_multiply_quantity",
        data.shipping_multiply_quantity || false,
      );

      // Add SEO fields
      fd.append("video_link", data.video_link || "");
      fd.append("meta_title", data.meta_title || "");
      fd.append("meta_description", data.meta_description || "");
      fd.append("indexing_option", data.indexing_option || "index");
      fd.append("max_snippet", data.max_snippet || "-1");
      fd.append("max_video_preview", data.max_video_preview || "-1");
      fd.append("max_image_preview", data.max_image_preview || "large");

      // Add product variations
      fd.append("enable_colors", enableColors);
      fd.append("selected_colors", JSON.stringify(selectedColors || []));
      fd.append("selected_sizes", JSON.stringify(selectedSizes || []));
      fd.append(
        "selected_attributes",
        JSON.stringify(selectedAttributes || []),
      );
      fd.append(
        "generated_variations",
        JSON.stringify(generatedVariations || []),
      );

      // Add additional images
      additionalImages.forEach((image) => {
        if (image.file) {
          fd.append("additional_images[]", image.file);
        }
      });

      // Add product thumbnail
      if (productThumbnail && productThumbnail.file) {
        fd.append("product_thumbnail", productThumbnail.file);
      }

      // Add meta image
      if (metaImage && metaImage.file) {
        fd.append("meta_image", metaImage.file);
      }

      // Add color-wise images
      Object.keys(colorWiseImages).forEach((color) => {
        if (colorWiseImages[color] && colorWiseImages[color].file) {
          fd.append(`color_image_${color}`, colorWiseImages[color].file);
        }
      });

      // Save product using API

      try {
        // Check if editing existing product or creating new one
        const editId = localStorage.getItem("editProductId");
        const isLocationEditMode = isEditMode && editingProduct;

        // Prepare product data for API
        const productData = {
          product_name_en: data.product_name_en || "",
          description_en: data.description_en || "",
          category_id: data.category_id || "",
          sku: data.sku || "",
          unit_price: data.unit_price ?? "",
          discount_type: data.discount_type || "flat",
          discount_amount: data.discount_amount ?? "",
          tax_percent: data.tax_percent ?? "",
          tax_calculation: data.tax_calculation || "include",
          shipping_cost: data.shipping_cost ?? "",
          shipping_multiply_quantity: data.shipping_multiply_quantity || false,
          stock: data.stock ?? "",
          min_order_qty: data.min_order_qty ?? "1",
          max_order_qty: data.max_order_qty ?? "",
          tags: data.tags || [],
          status: data.status || "active",
          is_featured: data.is_featured || false,
          has_variations:
            (generatedVariations && generatedVariations.length > 0) || false,
          variations: generatedVariations || [],
          video_link: data.video_link || "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          indexing_option: data.indexing_option || "index",
          max_snippet: data.max_snippet || "-1",
          max_video_preview: data.max_video_preview || "-1",
          max_image_preview: data.max_image_preview || "large",
          color_wise_images: colorWiseImages || {},
        };

        // Prepare files for upload
        const files = {};

        // Convert base64 images to files for upload
        if (productThumbnail && productThumbnail.file) {
          files.thumbnail = productThumbnail.file;
        } else if (productThumbnail && productThumbnail.preview) {
          // Convert base64 to file
          const response = await fetch(productThumbnail.preview);
          const blob = await response.blob();
          files.thumbnail = new File([blob], "thumbnail.jpg", {
            type: "image/jpeg",
          });
        }

        if (additionalImages && Array.isArray(additionalImages)) {
          files.additional_images = [];
          for (const img of additionalImages) {
            if (img.file) {
              files.additional_images.push(img.file);
            } else if (img.preview) {
              const response = await fetch(img.preview);
              const blob = await response.blob();
              files.additional_images.push(
                new File([blob], `image_${Date.now()}.jpg`, {
                  type: "image/jpeg",
                }),
              );
            }
          }
        }

        if (metaImage && metaImage.file) {
          files.meta_image = metaImage.file;
        } else if (metaImage && metaImage.preview) {
          const response = await fetch(metaImage.preview);
          const blob = await response.blob();
          files.meta_image = new File([blob], "meta_image.jpg", {
            type: "image/jpeg",
          });
        }

        // Save via API
        let savedProduct;
        if (isLocationEditMode) {
          // Update existing product using location state
          const productId = editingProduct._id;
          savedProduct = await apiService.updateProductWithFiles(
            productId,
            productData,
            files,
          );
        } else if (editId) {
          // Update existing product using localStorage (legacy)
          savedProduct = await apiService.updateProductWithFiles(
            editId,
            productData,
            files,
          );
        } else {
          // Create new product
          savedProduct = await apiService.createProductWithFiles(
            productData,
            files,
          );
        }

        // Clear edit data if editing
        if (isLocationEditMode) {
          // Location state will be cleared on navigation
        } else if (editId) {
          localStorage.removeItem("editProductId");
          localStorage.removeItem("editProductData");
        }

        // Show success message
        const action = isLocationEditMode || editId ? "updated" : "saved";
        alert(`Product ${action} successfully!`);

        // Redirect to product details page
        const productId =
          savedProduct.product?._id ||
          savedProduct.product?.id ||
          savedProduct._id ||
          savedProduct.id;
        navigate(`/dashboard/products/${productId}`, { replace: true });
      } catch (apiError) {
        console.error("API Error:", apiError);

        // Show the actual API error instead of falling back to localStorage
        const errorMessage = apiError.message || "Unknown API error";
        alert(
          `API Error: ${errorMessage}\n\nPlease check the console for more details.`,
        );
        setLoading(false);
        return; // Don't proceed to localStorage fallback
      }
    } catch (err) {
      console.error("Detailed error:", err);
      alert(`Failed to add product: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/product-list")}
          sx={{
            textTransform: "none",
            color: "#1976d2",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
          Back to Product List
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "white",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Inventory2Icon sx={{ fontSize: 32, color: "#2563eb" }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              {isEditMode ? "Edit Product" : "Add New Product"}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateIcon />}
            sx={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
              textTransform: "none",
              px: 3,
              py: 1.5,
            }}
          >
            Add Info From Gallery
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          background: "white",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "#e2e8f0" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab
              label="English (EN)"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                color: activeTab === 0 ? "#2563eb" : "#64748b",
                "&.Mui-selected": { color: "#2563eb" },
              }}
            />
          </Tabs>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
              >
                Product Name (EN) <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <Controller
                name="product_name_en"
                control={control}
                rules={{ required: "Product name is required", maxLength: 255 }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    placeholder="Enter product name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          backgroundColor: "#f1f5f9",
                          borderColor: "#cbd5e1",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                          borderColor: "#2563eb",
                          boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        py: 2.5,
                        fontSize: "1rem",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
              >
                Description (EN) <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <Controller
                name="description_en"
                control={control}
                rules={{ required: "Description is required" }}
                render={({ field, fieldState }) => (
                  <Box
                    sx={{
                      "& .ql-container": {
                        fontSize: "1rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      },
                    }}
                  >
                    <ReactQuill
                      ref={quillRef}
                      value={field.value}
                      onChange={field.onChange}
                      theme="snow"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, 4, 5, 6, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ color: [] }, { background: [] }],
                          [{ list: "ordered" }, { list: "bullet" }],
                          [{ align: [] }],
                          ["clean"],
                        ],
                      }}
                      formats={[
                        "header",
                        "bold",
                        "italic",
                        "underline",
                        "strike",
                        "color",
                        "background",
                        "list",
                        "bullet",
                        "align",
                      ]}
                      style={{
                        height: 250,
                        marginBottom: 20,
                      }}
                    />
                    {fieldState.error && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 1 }}
                      >
                        {fieldState.error.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Paper>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Inventory2Icon sx={{ fontSize: 24, color: "#2563eb" }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                General Setup
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Category <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <Controller
                  name="category_id"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <Select
                        {...field}
                        displayEmpty
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            "&:hover": {
                              backgroundColor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              borderColor: "#2563eb",
                              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                            },
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select category
                        </MenuItem>
                        {categories.map((c) => (
                          <MenuItem key={c._id || c.id} value={c._id || c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText error>
                          {fieldState.error.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Product Type <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <Controller
                  name="product_type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      {...field}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    >
                      <MenuItem value="physical">Physical</MenuItem>
                      <MenuItem value="digital">Digital</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Product SKU <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <Controller
                  name="sku"
                  control={control}
                  rules={{ required: "SKU is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="Ex: 161183"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={generateSKU}
                            size="small"
                            sx={{ color: "#2563eb" }}
                          >
                            <AutorenewIcon />
                          </IconButton>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Unit
                </Typography>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      {...field}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    >
                      <MenuItem value="set">set</MenuItem>
                      <MenuItem value="pcs">pcs</MenuItem>
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="gm">gm</MenuItem>
                      <MenuItem value="ltr">ltr</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Search Tags
                </Typography>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <TextField
                        placeholder="Enter tag"
                        fullWidth
                        onKeyDown={handleAddTagFromInput}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            "&:hover": {
                              backgroundColor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              borderColor: "#2563eb",
                              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                            },
                          },
                        }}
                      />
                      <Box sx={{ mt: 2 }}>
                        {(field.value || []).map((t) => (
                          <Chip
                            key={t}
                            label={t}
                            onDelete={() => handleDeleteTag(t)}
                            sx={{
                              mr: 1,
                              mb: 1,
                              backgroundColor: "#e0f2fe",
                              color: "#0369a1",
                              "&:hover": {
                                backgroundColor: "#bae6fd",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Paper>

        {/* Pricing & Others Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Inventory2Icon sx={{ fontSize: 24, color: "#2563eb" }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Pricing & Others
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Unit Price (₹) <span style={{ color: "#ef4444" }}>*</span>
                  <Tooltip title="Base selling price before discount & tax">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Controller
                  name="unit_price"
                  control={control}
                  rules={{ required: "Unit price is required", min: 1 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="0.00"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Minimum Order Qty <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <Controller
                  name="min_order_qty"
                  control={control}
                  rules={{ required: "Min order qty is required", min: 1 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="1"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Stock Qty <span style={{ color: "#ef4444" }}>*</span>
                  <Tooltip title="Total available stock for this product">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Controller
                  name="stock"
                  control={control}
                  rules={{ required: "Stock quantity is required", min: 0 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="100"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  MRP Price
                </Typography>
                <Controller
                  name="mrp_price"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="0.00"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Occasion
                </Typography>
                <Controller
                  name="occasion"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., Anniversary, Birthday, Wedding"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Color/Colour
                </Typography>
                <Controller
                  name="color"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., Blue Sky Blue White"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Included Components
                </Typography>
                <Controller
                  name="included_components"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., Pack of 50 Blue Sky Blue White Metallic Balloons"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Theme
                </Typography>
                <Controller
                  name="theme"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., Blue Sky Blue White"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Material
                </Typography>
                <Controller
                  name="material"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., Rubber, Metallic Latex"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Net Quantity
                </Typography>
                <Controller
                  name="net_quantity"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., 50.00 Piece"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Size
                </Typography>
                <Controller
                  name="size"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., 50, Pack of 50"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Item Dimensions (L x W x H)
                </Typography>
                <Controller
                  name="item_dimensions"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="e.g., 30 x 30 x 30 Centimeters"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  About This Item (Detailed Description)
                </Typography>
                <Controller
                  name="about_item"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="Enter detailed product description with bullet points..."
                      fullWidth
                      multiline
                      rows={6}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Discount Type
                </Typography>
                <Controller
                  name="discount_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    >
                      <MenuItem value="flat">Flat (₹)</MenuItem>
                      <MenuItem value="percent">Percent (%)</MenuItem>
                    </Select>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Discount Amount ({discountType === "percent" ? "%" : "₹"}){" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                  <Tooltip
                    title={
                      discountType === "percent"
                        ? "Percentage discount from unit price"
                        : "Flat discount amount"
                    }
                  >
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Controller
                  name="discount_amount"
                  control={control}
                  rules={{ required: "Discount amount is required", min: 0 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder={discountType === "percent" ? "0" : "0.00"}
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Tax Amount (%)
                </Typography>
                <Controller
                  name="tax_percent"
                  control={control}
                  rules={{ min: 0, max: 100 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="0"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Tax Calculation <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <Controller
                  name="tax_calculation"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    >
                      <MenuItem value="include">Include with product</MenuItem>
                      <MenuItem value="exclude">Exclude</MenuItem>
                    </Select>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Shipping Cost (₹) <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <Controller
                  name="shipping_cost"
                  control={control}
                  rules={{ required: "Shipping cost is required", min: 0 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="0.00"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Ensure value is not negative and is a valid number
                        if (value === "" || parseFloat(value) >= 0) {
                          field.onChange(value);
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Shipping Cost Multiply With Quantity
                </Typography>
                <Controller
                  name="shipping_multiply_quantity"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label={
                        field.value
                          ? "Multiply with quantity"
                          : "Flat shipping cost"
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
        {/* Product Variation Setup Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <AutorenewIcon sx={{ fontSize: 24, color: "#2563eb" }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Product Variation Setup
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Select Colors
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableColors}
                      onChange={(e) => setEnableColors(e.target.checked)}
                    />
                  }
                  label="Enable color variations"
                  sx={{ mb: 2 }}
                />

                {enableColors && (
                  <Box>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyPress={handleColorInputKeyPress}
                        placeholder="Type color name and press Enter"
                        size="small"
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          },
                        }}
                      />
                      <Button
                        onClick={addColorFromInput}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2, textTransform: "none" }}
                      >
                        Add
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedColors.map((color) => (
                        <Chip
                          key={color}
                          label={color}
                          onDelete={() => {
                            setSelectedColors((prev) =>
                              prev.filter((c) => c !== color),
                            );
                          }}
                          color="primary"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Select Sizes
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedAttributes.includes("size")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAttributes((prev) => [...prev, "size"]);
                        } else {
                          setSelectedAttributes((prev) =>
                            prev.filter((attr) => attr !== "size"),
                          );
                        }
                      }}
                    />
                  }
                  label="Enable size variations"
                  sx={{ mb: 2 }}
                />

                {selectedAttributes.includes("size") && (
                  <Box>
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {["S", "M", "L", "XL", "XXL"].map((size) => (
                        <Chip
                          key={size}
                          label={size}
                          onDelete={() => {
                            setSelectedSizes((prev) =>
                              prev.filter((s) => s !== size),
                            );
                          }}
                          color={
                            selectedSizes.includes(size) ? "primary" : "default"
                          }
                          onClick={() => {
                            if (!selectedSizes.includes(size)) {
                              setSelectedSizes((prev) => [...prev, size]);
                            }
                          }}
                          clickable
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedSizes.map((size) => (
                        <Chip
                          key={size}
                          label={size}
                          onDelete={() => {
                            setSelectedSizes((prev) =>
                              prev.filter((s) => s !== size),
                            );
                          }}
                          color="primary"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>

            {/* Generate Variations Button */}
            {(enableColors && selectedColors.length > 0) ||
            (selectedAttributes.includes("size") &&
              selectedSizes.length > 0) ? (
              <Box sx={{ mt: 4, mb: 4 }}>
                <Button
                  variant="contained"
                  onClick={generateVariations}
                  startIcon={<AutorenewIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: "#2563eb",
                    "&:hover": { backgroundColor: "#1d4ed8" },
                  }}
                >
                  Generate Variations
                </Button>
              </Box>
            ) : null}

            {/* Generated Variations Table */}
            {generatedVariations.length > 0 && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}
                >
                  Generated Variations ({generatedVariations.length})
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ border: "1px solid #e2e8f0" }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                          SL
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                          Variant
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                          SKU
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                          Price
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                          Stock
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generatedVariations.map((variation, index) => (
                        <TableRow key={variation.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {variation.color && (
                                <Chip
                                  label={variation.color}
                                  size="small"
                                  sx={{
                                    backgroundColor: getColorHex(
                                      variation.color,
                                    ),
                                    color: "white",
                                  }}
                                />
                              )}
                              {variation.size && (
                                <Chip
                                  label={variation.size}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={variation.sku}
                              onChange={(e) =>
                                updateVariation(index, "sku", e.target.value)
                              }
                              size="small"
                              sx={{ minWidth: 150 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={variation.price}
                              onChange={(e) =>
                                updateVariation(index, "price", e.target.value)
                              }
                              size="small"
                              sx={{ minWidth: 100 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={variation.stock}
                              onChange={(e) =>
                                updateVariation(index, "stock", e.target.value)
                              }
                              size="small"
                              sx={{ minWidth: 80 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Paper>

        {/* Product Image Management Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <CloudUploadIcon sx={{ fontSize: 24, color: "#2563eb" }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Product Image Management
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {/* Product Thumbnail Upload */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Product Thumbnail <span style={{ color: "#ef4444" }}>*</span>
                  <Tooltip title="Primary image for product listings and search results">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", mb: 2, display: "block" }}
                >
                  1:1 (500×500 px) - Max 2MB - JPEG/PNG/WebP
                </Typography>

                {productThumbnail ? (
                  <Box sx={{ position: "relative", width: 200, height: 200 }}>
                    <img
                      src={productThumbnail.preview}
                      alt="Product thumbnail"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <IconButton
                      onClick={removeProductThumbnail}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(239, 68, 68, 0.9)",
                        color: "white",
                        "&:hover": { backgroundColor: "#dc2626" },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "rgba(34, 197, 94, 0.9)",
                        color: "white",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      width: 200,
                      height: 200,
                      border: "2px dashed #cbd5e1",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      backgroundColor: "#f8fafc",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        border: "2px dashed #94a3b8",
                      },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body2">Upload Thumbnail</Typography>
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleProductThumbnailUpload}
                    />
                  </Button>
                )}
              </Grid>

              {/* Colour-Wise Product Image Upload */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Colour-Wise Images
                  <Tooltip title="Upload images for each color variant">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", mb: 2, display: "block" }}
                >
                  One image per color variant - 1:1 ratio
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                  {selectedColors.length > 0 ? (
                    selectedColors.map((color) => (
                      <Box key={color} sx={{ position: "relative" }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#374151", mb: 1, display: "block" }}
                        >
                          {color}
                        </Typography>
                        {colorWiseImages[color] ? (
                          <Box
                            sx={{
                              position: "relative",
                              width: 120,
                              height: 120,
                            }}
                          >
                            <img
                              src={colorWiseImages[color].preview}
                              alt={`${color} variant`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                              }}
                            />
                            <IconButton
                              onClick={() => removeColorImage(color)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                backgroundColor: "rgba(239, 68, 68, 0.9)",
                                color: "white",
                                "&:hover": { backgroundColor: "#dc2626" },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            {selectedColorImage === color && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  backgroundColor: "rgba(34, 197, 94, 0.9)",
                                  color: "white",
                                  borderRadius: "50%",
                                  width: 20,
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 12,
                                }}
                              >
                                ✓
                              </Box>
                            )}
                            <Chip
                              label={color}
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                backgroundColor: getColorHex(color),
                                color: "white",
                                fontSize: 10,
                                height: 20,
                              }}
                            />
                          </Box>
                        ) : (
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            sx={{
                              width: 120,
                              height: 120,
                              border: "2px dashed #cbd5e1",
                              borderRadius: 2,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#64748b",
                              backgroundColor: "#f8fafc",
                              "&:hover": {
                                backgroundColor: "#f1f5f9",
                                border: "2px dashed #94a3b8",
                              },
                            }}
                          >
                            <CloudUploadIcon sx={{ fontSize: 24, mb: 0.5 }} />
                            <Typography variant="caption">Add</Typography>
                            <input
                              hidden
                              accept="image/*"
                              type="file"
                              onChange={(e) => handleColorImageUpload(color, e)}
                            />
                          </Button>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "#94a3b8",
                        backgroundColor: "#f8fafc",
                        borderRadius: 2,
                        border: "1px dashed #e2e8f0",
                      }}
                    >
                      <Typography variant="caption">
                        Select colors in Product Variation Setup to upload
                        color-wise images
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Additional Product Images */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Additional Gallery Images
                  <Tooltip title="Extra images for product details - angles, lifestyle, close-ups">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", mb: 2, display: "block" }}
                >
                  Multiple images allowed - 1:1 ratio recommended
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{
                      borderRadius: 2,
                      border: "2px dashed #cbd5e1",
                      color: "#64748b",
                      backgroundColor: "#f8fafc",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        border: "2px dashed #94a3b8",
                      },
                    }}
                  >
                    Upload Gallery Images
                    <input
                      hidden
                      accept="image/*"
                      multiple
                      type="file"
                      onChange={handleAdditionalImagesUpload}
                    />
                  </Button>
                </Box>

                {additionalImages.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {additionalImages.map((image, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <img
                          src={image.preview}
                          alt={`Gallery ${index + 1}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                          }}
                          onClick={() => selectAdditionalImage(index)}
                        />
                        <IconButton
                          onClick={() => removeAdditionalImage(index)}
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            backgroundColor: "rgba(239, 68, 68, 0.9)",
                            color: "white",
                            "&:hover": { backgroundColor: "#dc2626" },
                            width: 20,
                            height: 20,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        {selectedAdditionalImage === index && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 2,
                              left: 2,
                              backgroundColor: "rgba(34, 197, 94, 0.9)",
                              color: "white",
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                            }}
                          >
                            ✓
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
        {/* Product Video Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Inventory2Icon sx={{ fontSize: 24, color: "#2563eb" }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Product Video
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  YouTube Video Link
                  <Tooltip title="Use embed link format: https://www.youtube.com/embed/VIDEO_ID">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Controller
                  name="video_link"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="https://www.youtube.com/embed/VIDEO_ID"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message ||
                        "Example: https://www.youtube.com/embed/5R06LRdUCSE"
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
        {/* SEO Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Inventory2Icon sx={{ fontSize: 24, color: "#2563eb" }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                SEO Section
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Meta Title
                  <Tooltip title="Best length is 50-60 characters for SEO">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Controller
                  name="meta_title"
                  control={control}
                  rules={{ maxLength: 60 }}
                  render={({ field, fieldState }) => (
                    <Box>
                      <TextField
                        {...field}
                        placeholder="Meta Title"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        inputProps={{ maxLength: 60 }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            "&:hover": {
                              backgroundColor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              borderColor: "#2563eb",
                              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                            },
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", mt: 0.5, display: "block" }}
                      >
                        {field.value?.length || 0}/60 characters
                      </Typography>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Meta Image (2:1)
                  <Tooltip title="Image shown in social shares and Google snippets">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", mb: 2, display: "block" }}
                >
                  Recommended: 1200×600 px
                </Typography>

                {metaImage ? (
                  <Box
                    sx={{ position: "relative", width: "100%", height: 120 }}
                  >
                    <img
                      src={metaImage.preview}
                      alt="Meta image preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <IconButton
                      onClick={removeMetaImage}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(239, 68, 68, 0.9)",
                        color: "white",
                        "&:hover": { backgroundColor: "#dc2626" },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "rgba(34, 197, 94, 0.9)",
                        color: "white",
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      2:1
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      width: "100%",
                      height: 120,
                      border: "2px dashed #cbd5e1",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      backgroundColor: "#f8fafc",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        border: "2px dashed #94a3b8",
                      },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2">Upload Meta Image</Typography>
                    <Typography variant="caption">2:1 ratio</Typography>
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleMetaImageUpload}
                    />
                  </Button>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "#374151" }}
                >
                  Meta Description
                  <Tooltip title="Used by search engines; helps ranking">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: "#94a3b8" }} />
                  </Tooltip>
                </Typography>
                <Controller
                  name="meta_description"
                  control={control}
                  rules={{ maxLength: 160 }}
                  render={({ field, fieldState }) => (
                    <Box>
                      <TextField
                        {...field}
                        placeholder="Meta Description"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        inputProps={{ maxLength: 160 }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            "&:hover": {
                              backgroundColor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              borderColor: "#2563eb",
                              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                            },
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", mt: 0.5, display: "block" }}
                      >
                        {field.value?.length || 0}/160 characters
                      </Typography>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              SEO Indexing & Crawling Controls
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 2, color: "#374151" }}
                >
                  Indexing Options
                </Typography>

                <Controller
                  name="indexing_option"
                  control={control}
                  defaultValue="index"
                  render={({ field }) => (
                    <Box>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={field.value === "index"}
                            onChange={() => field.onChange("index")}
                          />
                        }
                        label="Index"
                        sx={{ mb: 1 }}
                      />
                      <FormControlLabel
                        control={
                          <Radio
                            checked={field.value === "noindex"}
                            onChange={() => field.onChange("noindex")}
                          />
                        }
                        label="No Index"
                        sx={{ mb: 2 }}
                      />

                      <Box sx={{ ml: 3 }}>
                        <FormControlLabel
                          control={<Checkbox size="small" />}
                          label="No Follow"
                          sx={{ mb: 1 }}
                        />
                        <FormControlLabel
                          control={<Checkbox size="small" />}
                          label="No Archive"
                          sx={{ mb: 1 }}
                        />
                        <FormControlLabel
                          control={<Checkbox size="small" />}
                          label="No Image Index"
                          sx={{ mb: 1 }}
                        />
                        <FormControlLabel
                          control={<Checkbox size="small" />}
                          label="No Snippet"
                        />
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 2, color: "#374151" }}
                >
                  Snippet Control Settings
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Controller
                    name="max_snippet"
                    control={control}
                    defaultValue="-1"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Max Snippet"
                        type="number"
                        helperText="-1 = unlimited, 0 = no snippet"
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="max_video_preview"
                    control={control}
                    defaultValue="-1"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Max Video Preview (seconds)"
                        type="number"
                        helperText="-1 = unlimited"
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="max_image_preview"
                    control={control}
                    defaultValue="large"
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Max Image Preview</InputLabel>
                        <Select {...field} label="Max Image Preview">
                          <MenuItem value="none">Small</MenuItem>
                          <MenuItem value="standard">Medium</MenuItem>
                          <MenuItem value="large">Large</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Paper>

        {/* Form Action Buttons */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => reset()}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "#cbd5e1",
                    color: "#64748b",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                      borderColor: "#94a3b8",
                    },
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                      boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {loading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Product"
                      : "Save Product"}
                </Button>
              </Stack>
            </Grid>
          </CardContent>
        </Paper>
      </form>
    </Box>
  );
}
