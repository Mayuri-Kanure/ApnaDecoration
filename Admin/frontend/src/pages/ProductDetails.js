import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import apiService from "../services/api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [categories, setCategories] = useState([]);

  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Fetch categories for name resolution
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        setCategories(data.data || data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categories || !Array.isArray(categories)) return categoryId;
    const category = categories.find(cat => cat._id === categoryId || cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleEditProduct = () => {
    // Create a lightweight version of product data without images to avoid quota exceeded error
    const lightweightProductData = {
      ...product,
      // Remove large image data to prevent localStorage quota issues
      thumbnail: product.thumbnail ? 'EXISTS' : null,
      additional_images: product.additional_images?.length > 0 ? 'EXISTS' : null,
      color_wise_images: product.color_wise_images && typeof product.color_wise_images === 'object' && Object.keys(product.color_wise_images).length > 0 ? 'EXISTS' : null,
      meta_image: product.meta_image ? 'EXISTS' : null,
    };
    
    // Store the lightweight product data for editing
    localStorage.setItem('editProductData', JSON.stringify(lightweightProductData));
    localStorage.setItem('editProductId', id);
    navigate(`/dashboard/add-new-product`);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const productData = await apiService.getProduct(id);
          console.log('🔍 Product data loaded from API:', productData);
          console.log('🔍 Product data keys:', Object.keys(productData));
          console.log('🔍 Product name:', productData.name);
          console.log('🔍 Product description:', productData.description);
          console.log('🔍 Product brand:', productData.brand_id);
          console.log('🔍 Product category:', productData.category_id);
          
          // Process image URLs for gallery
          const images = [];
          
          // Handle main thumbnail
          if (productData.thumbnail) {
            // Cloudinary URLs start with https://res.cloudinary.com - use as-is
            // Local paths start with /uploads/ - prepend localhost
            // Full HTTP URLs start with http:// - use as-is
            const thumbnailUrl = productData.thumbnail.startsWith('https://res.cloudinary.com') 
              ? productData.thumbnail
              : productData.thumbnail.startsWith('http://')
                ? productData.thumbnail
                : productData.thumbnail.startsWith('/uploads/')
                  ? `${API_BASE_URL}${productData.thumbnail}`
                  : `${API_BASE_URL}/uploads${productData.thumbnail}`;
            
            images.push({
              src: thumbnailUrl,
              alt: "Main Product Image"
            });
          }
          
          // Handle additional images
          if (Array.isArray(productData.additional_images)) {
            productData.additional_images.forEach((img, index) => {
              if (img) {
                // Cloudinary URLs start with https://res.cloudinary.com - use as-is
                // Local paths start with /uploads/ - prepend localhost
                // Full HTTP URLs start with http:// - use as-is
                const imageUrl = img.startsWith('https://res.cloudinary.com') 
                  ? img 
                  : img.startsWith('http://')
                    ? img
                    : img.startsWith('/uploads/')
                      ? `${API_BASE_URL}${img}`
                      : `${API_BASE_URL}/uploads${img}`;
                
                images.push({
                  src: imageUrl,
                  alt: `Product Image ${index + 1}`
                });
              }
            });
          }
          
          console.log('Gallery images prepared:', images.length, 'images');
          setAllImages(images);
          setProduct(productData);
          
        } catch (apiError) {
          console.log('API fetch failed, trying localStorage fallback:', apiError);
          
          // Fallback to localStorage
          const stored = localStorage.getItem(id);
          if (stored) {
            const productData = JSON.parse(stored);
            console.log('Product data loaded from localStorage:', productData);
            
            // Prepare all images for gallery (base64 format)
            const images = [];
            if (productData.thumbnail && productData.thumbnail.startsWith("data:")) {
              images.push({
                src: productData.thumbnail,
                alt: "Main Product Image"
              });
            }
            if (Array.isArray(productData.additional_images)) {
              productData.additional_images.forEach((img, index) => {
                if (img && img.startsWith("data:")) {
                  images.push({
                    src: img,
                    alt: `Product Image ${index + 1}`
                  });
                }
              });
            }
            
            console.log('Gallery images prepared from localStorage:', images.length, 'images');
            setAllImages(images);
            setProduct(productData);
          } else {
            console.log('No product found in localStorage either');
          }
        }
        
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Gallery functions
  const openLightbox = (imageIndex) => {
    setCurrentImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Box p={3}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIosIcon />}
          onClick={() => navigate('/dashboard/product-list')}
          sx={{
            textTransform: 'none',
            color: '#1976d2',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          Back to Product List
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* LEFT IMAGE SECTION */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box
                component="img"
                src={
                  product.thumbnail 
                    ? product.thumbnail.startsWith("data:") 
                      ? product.thumbnail
                      // Handle Cloudinary URLs (they start with https://res.cloudinary.com)
                      : product.thumbnail.startsWith("https://")
                        ? product.thumbnail
                        // Handle full HTTP URLs
                        : product.thumbnail.startsWith("http://")
                          ? product.thumbnail
                          // Handle relative paths
                          : `${API_BASE_URL}${product.thumbnail}`
                    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E"
                }
                alt={product.name}
                onClick={() => product.thumbnail && openLightbox(0)}
                onError={(e) => {
                  console.log('Main image failed to load:', product.thumbnail);
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                }}
                onLoad={() => {
                  console.log('Main image loaded successfully');
                }}
                sx={{
                  width: "100%",
                  height: 400,
                  objectFit: "cover",
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                  cursor: product.thumbnail ? "pointer" : "default",
                  "&:hover": product.thumbnail ? {
                    opacity: 0.9,
                    transform: "scale(1.02)"
                  } : {}
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" mb={2}>
                All Product Images
              </Typography>

              <Grid container spacing={1}>
                {Array.isArray(product.additional_images) && product.additional_images.length > 0 ? (
                  product.additional_images.map((img, i) => (
                    <Grid item xs={4} key={i}>
                      <Box
                        component="img"
                        src={
                          img 
                            ? img.startsWith("data:") 
                              ? img
                              : img.startsWith("http")
                                ? img
                                : `${API_BASE_URL}${img}`
                            : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='8' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"
                        }
                        alt={`img-${i}`}
                        onClick={() => img && openLightbox(i + 1)}
                        onError={(e) => {
                          console.log(`Additional image ${i} failed to load:`, img);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`Additional image ${i} loaded successfully`);
                        }}
                        sx={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid #ddd",
                          cursor: img ? "pointer" : "default",
                          "&:hover": img ? {
                            border: "2px solid #1976d2",
                            opacity: 0.9,
                            transform: "scale(1.05)"
                          } : {}
                        }}
                      />
                    </Grid>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No additional images available
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT DETAILS SECTION */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={handleEditProduct}
                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
              >
                Edit Product
              </Button>
            </Box>
          </Box>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary" mb={1}>
                Description
              </Typography>
              <Typography
                variant="body2"
                sx={{ lineHeight: 1.6 }}
              >
                {stripHtml(product.description) || 'No description available'}
              </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    General Info
                  </Typography>
                  <Typography variant="body2"><b>Brand:</b> {product.brand_id || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Category:</b> {getCategoryName(product.category_id)}</Typography>
                  <Typography variant="body2"><b>Sub Category:</b> {product.sub_category_id || 'N/A'}</Typography>
                  <Typography variant="body2"><b>SKU:</b> {product.sku}</Typography>
                  <Typography variant="body2"><b>Stock:</b> {product.stock}</Typography>
                  <Typography variant="body2"><b>Min Order Qty:</b> {product.min_order_qty || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Max Order Qty:</b> {product.max_order_qty || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Weight:</b> {product.weight || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Status:</b> {product.status}</Typography>
                  <Typography variant="body2"><b>Featured:</b> {product.is_featured ? 'Yes' : 'No'}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    Price Info
                  </Typography>
                  <Typography variant="body2"><b>Price:</b> ₹{product.price || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Discount Type:</b> {product.discount_type || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Discount:</b> ₹{product.discount_amount || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Tax:</b> {product.tax_percent ? `${product.tax_percent}%` : 'N/A'}</Typography>
                  <Typography variant="body2"><b>Tax Calculation:</b> {product.tax_calculation || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Shipping Cost:</b> ₹{product.shipping_cost || 'N/A'}</Typography>
                  <Typography variant="body2"><b>Shipping Multiply:</b> {product.shipping_multiply_quantity ? 'Yes' : 'No'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* SKU & VARIATIONS TABLE */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
            SKU & Variations
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>SKU</b></TableCell>
                <TableCell><b>Variation Wise Price</b></TableCell>
                <TableCell><b>Stock</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Array.isArray(product.variations) && product.variations.length > 0 ? (
                product.variations.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>₹{v.price}</TableCell>
                    <TableCell>{v.stock}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No variations available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SEO & META DATA */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
            Product SEO & Meta Data
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><b>Meta Title:</b> {product.meta_title || 'N/A'}</Typography>
              <Typography variant="body2"><b>Meta Description:</b> {product.meta_description || 'N/A'}</Typography>
              <Typography variant="body2"><b>Meta Image:</b> {product.meta_image ? 'Available' : 'Not Available'}</Typography>
              <Typography variant="body2"><b>Indexing Option:</b> {product.indexing_option || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><b>Max Snippet:</b> {product.max_snippet || 'N/A'}</Typography>
              <Typography variant="body2"><b>Max Video Preview:</b> {product.max_video_preview || 'N/A'}</Typography>
              <Typography variant="body2"><b>Max Image Preview:</b> {product.max_image_preview || 'N/A'}</Typography>
              <Typography variant="body2"><b>Created At:</b> {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* PRODUCT VIDEO */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
            Product Video
          </Typography>
          
          {product.video_link ? (
            <Box>
              <Typography variant="body2"><b>Video URL:</b> {product.video_link}</Typography>
              <Box
                component="video"
                src={product.video_link}
                controls
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  height: 225,
                  borderRadius: 1,
                  mt: 2
                }}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No product video available
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* REVIEWS TABLE */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
            Product Reviews
          </Typography>
          
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>SL</b></TableCell>
                <TableCell><b>Review ID</b></TableCell>
                <TableCell><b>Reviewer</b></TableCell>
                <TableCell><b>Rating</b></TableCell>
                <TableCell><b>Review</b></TableCell>
                <TableCell><b>Reply</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {Array.isArray(product.reviews_list) && product.reviews_list.length > 0 ? (
                product.reviews_list.map((review, index) => (
                  <TableRow key={review.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{review.id}</TableCell>
                    <TableCell>{review.reviewer_name}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </Typography>
                    </TableCell>
                    <TableCell>{review.comment}</TableCell>
                    <TableCell>{review.reply || 'No reply'}</TableCell>
                    <TableCell>{review.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={review.status || 'Pending'} 
                        size="small" 
                        color={review.status === 'Approved' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No reviews available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* IMAGE GALLERY LIGHTBOX */}
      <Modal
        open={lightboxOpen}
        onClose={closeLightbox}
        onKeyDown={handleKeyDown}
        aria-labelledby="image-gallery-modal"
        aria-describedby="image-gallery-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '900px',
            height: '90%',
            maxHeight: '700px',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            borderBottom: '1px solid #e0e0e0'
          }}>
            <Typography variant="h6">
              Image Gallery ({currentImageIndex + 1} / {allImages.length})
            </Typography>
            <IconButton onClick={closeLightbox}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Image Container */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2,
            position: 'relative',
            bgcolor: '#000'
          }}>
            {allImages[currentImageIndex] && (
              <Box
                component="img"
                src={allImages[currentImageIndex].src}
                alt={allImages[currentImageIndex].alt}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  width: 'auto',
                  height: 'auto'
                }}
                onLoad={() => {
                  console.log('Gallery image loaded:', allImages[currentImageIndex].alt);
                }}
                onError={(e) => {
                  console.log('Gallery image failed to load:', allImages[currentImageIndex].alt);
                }}
              />
            )}

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <IconButton
                  onClick={goToPrevious}
                  sx={{
                    position: 'absolute',
                    left: 10,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <IconButton
                  onClick={goToNext}
                  sx={{
                    position: 'absolute',
                    right: 10,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </>
            )}
          </Box>

          {/* Footer with thumbnails */}
          {allImages.length > 1 && (
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'wrap',
              maxHeight: '80px',
              overflowY: 'auto'
            }}>
              {allImages.map((img, index) => (
                <Box
                  key={index}
                  component="img"
                  src={img.src}
                  alt={img.alt}
                  onClick={() => setCurrentImageIndex(index)}
                  sx={{
                    width: 50,
                    height: 50,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: currentImageIndex === index ? '2px solid #1976d2' : '1px solid #ddd',
                    cursor: 'pointer',
                    opacity: currentImageIndex === index ? 1 : 0.6,
                    '&:hover': { opacity: 1 }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ProductDetails;
