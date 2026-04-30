import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  Star,
  Plus,
  Minus,
  Truck,
  Shield,
  RefreshCw,
  Tag,
  Store,
  User,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductReviews from "../components/ProductReviews";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { ProductContext } from "../contexts/ProductContext";
import {
  IMAGE_BASE_URL,
  API_BASE_URL,
  PRODUCT_API_URL,
  SERVICE_CATEGORY_API_URL,
} from "../config/constants";
import { robustFetch } from "../utils/fetchUtils";
import { canAddToCart, isProductInStock } from "../utils/stockValidator";

const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

const ProductDetail = () => {
  const { id } = useParams();
  const {
    addToCart,
    isInCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useCart();
  const { success, error: showError } = useToast();
  const {
    products,
    services,
    loading: contextLoading,
  } = useContext(ProductContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [clearanceData, setClearanceData] = useState(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allRelatedItems, setAllRelatedItems] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [hasFetchFailed, setHasFetchFailed] = useState(false);

  // Use PRODUCT_API_URL from constants
  const API_BASE_URL_FOR_PRODUCTS = PRODUCT_API_URL;

  useEffect(() => {
    const fetchProductOrService = async () => {
      console.log(" ProductDetail: Looking for item with ID:", id);
      console.log(" ProductDetail: Available products:", products.length);
      console.log(" ProductDetail: Available services:", services.length);

      // Log available service IDs for debugging
      if (services.length > 0) {
        console.log(
          " ProductDetail: Available service IDs:",
          services.map((s) => ({ id: s._id || s.id, name: s.name })),
        );
      }

      // First try to find in context data (products and services)
      let foundItem = products.find((p) => p._id === id || p.id === id);

      if (!foundItem) {
        foundItem = services.find((s) => s._id === id || s.id === id);
      }

      if (foundItem) {
        console.log(" ProductDetail: Found item in context:", foundItem.name);

        // Normalize item object
        const productId = foundItem._id || foundItem.id;
        const normalized = {
          id: productId,
          _id: productId, // Add _id for cart compatibility
          name: foundItem.name || "No Name",
          description: foundItem.description || "",
          price: foundItem.price || 0,
          stock: foundItem.stock || 0,
          thumbnail: foundItem.thumbnail || null,
          bannerImage: foundItem.bannerImage || null,
          images: foundItem.images || [],
          rating: foundItem.rating || 4.5,
          reviews: foundItem.reviews || 0,
          type:
            foundItem.type ||
            (services.includes(foundItem) ? "service" : "product"),
          vendorId: foundItem.vendorId,
          vendor: foundItem.vendorId || null,
          category: foundItem.category || null,
          sku: foundItem.sku || "",
          discount: foundItem.discount || 0,
          originalPrice: foundItem.originalPrice || null,
        };

        setProduct(normalized);
        setLoading(false);
        return;
      }

      console.log(" ProductDetail: Item not found in context, trying API...");

      // Prevent infinite retries if fetch has already failed
      if (hasFetchFailed) {
        console.log(
          " Previous fetch failed, skipping retry to prevent infinite loop",
        );
        return;
      }

      setLoading(true);
      let data = null;
      let type = "product";

      try {
        console.log(" Fetching item with ID:", id);

        // Try multiple endpoints with robust fetch (with circuit breaker)
        // Use the same APIs as ProductContext for consistency - REAL PRODUCTION API
        const endpoints = [
          `https://user-api.apnadecoration.com/api/services/${id}`, // Services - PRODUCTION (FIXED!)
          `https://user-api.apnadecoration.com/api/products/${id}`, // Products - PRODUCTION
          `https://user-api.apnadecoration.com/api/vendor-products/public/${id}`, // Vendor products - PRODUCTION
          `${API_BASE_URL}/products/${id}`, // Local fallback only if production fails
        ];

        console.log("🔍 Endpoints to try:", endpoints);

        for (const endpoint of endpoints) {
          try {
            console.log(`🔍 Trying endpoint: ${endpoint}`);
            console.log(
              `🔍 Is vendor-product endpoint: ${endpoint.includes("/vendor-products/")}`,
            );

            let res;
            // Use robustFetch for vendor-product endpoint (handles CORS better)
            if (endpoint.includes("/vendor-products/")) {
              res = await robustFetch(
                endpoint.includes("user-api.apnadecoration.com")
                  ? endpoint.replace(
                      "https://user-api.apnadecoration.com/api",
                      "/vendor-products/public",
                    )
                  : `/vendor-products/public/${id}`,
                {
                  timeout: 10000,
                },
              );
            } else {
              // Use regular fetch for admin API endpoints
              res = await fetch(endpoint, {
                headers: {
                  "Content-Type": "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  // Add auth token if available
                  ...(localStorage.getItem("token") && {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }),
                },
              });
            }

            if (res.ok) {
              data = await res.json();
              console.log(
                `✅ SUCCESS! Fetched from endpoint: ${endpoint}`,
                data,
              );

              // Determine type based on endpoint
              if (endpoint.includes("/services/")) {
                type = "service";
              } else if (endpoint.includes("/vendor-products/")) {
                type = "vendor-product";
              }
              break;
            } else if (res.status === 401 || res.status === 403) {
              console.log(
                `🔒 Endpoint ${endpoint} requires authentication - skipping`,
              );
              continue;
            } else if (res.status === 404) {
              // For 404 errors, continue trying other endpoints
              console.log(
                `❌ Resource not found (404): ${endpoint} - trying next endpoint`,
              );
              continue;
            }
          } catch (error) {
            console.warn(`⚠️ Endpoint ${endpoint} failed:`, error.message);
            continue;
          }
        }

        if (!data) {
          setHasFetchFailed(true);
          throw new Error("Product or service not found");
        }

        console.log("🎯 FINAL TYPE:", type);
        console.log("🎯 FINAL DATA:", data);

        const actualData = data?.data || data;

        // Normalize product object
        const productId = actualData._id || actualData.id;
        const normalized = {
          id: productId,
          _id: productId, // Add _id for cart compatibility
          name: actualData.name || "No Name",
          description: actualData.description || "",
          price: actualData.price || 0,
          stock: actualData.stock || 0,
          thumbnail: actualData.thumbnail || null,
          bannerImage: actualData.bannerImage || null, // Add bannerImage for services
          images: actualData.images || [],
          rating: actualData.rating || 4.5,
          reviews: actualData.reviews || 0,
          type,
          vendorId: actualData.vendorId,
          vendor:
            actualData.vendorId && actualData.vendorId.name
              ? actualData.vendorId
              : null,
        };

        console.log(" Normalized product data:", {
          id: normalized.id,
          name: normalized.name,
          type: normalized.type,
          thumbnail: normalized.thumbnail,
          bannerImage: normalized.bannerImage,
          images: normalized.images,
          hasThumbnail: !!normalized.thumbnail,
          hasBannerImage: !!normalized.bannerImage,
          hasImages: !!(normalized.images && normalized.images.length > 0),
        });

        setProduct(normalized);
      } catch (err) {
        console.error(" Error fetching product:", err);
        const errorMessage = err.message || "Product or service not found";
        showError(errorMessage);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    // IMPORTANT: function close + call
    fetchProductOrService();
  }, [id, showError]);

  // Reset fetch failure state when ID changes
  useEffect(() => {
    setHasFetchFailed(false);
  }, [id]);

  // Fetch clearance sale data to check if product is on sale
  useEffect(() => {
    const fetchClearanceSaleData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/clearance-sale/public`,
        );
        setClearanceData(response.data.data);

        // Check if current product is in clearance sale
        if (response.data.data?.inhouseOffer?.isActive && product) {
          const applicableProducts =
            response.data.data.inhouseOffer.applicableProducts || [];
          const isProductInSale = applicableProducts.some(
            (p) => p._id === product._id || p === product._id,
          );
          setIsOnSale(isProductInSale);
        }
      } catch (error) {
        console.error("Error fetching clearance sale data:", error);
      }
    };

    if (product) {
      fetchClearanceSaleData();
    }
  }, [product?.id]); // Only re-fetch when product ID changes

  // Fetch related items (products OR services based on type)
  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!product?.id) return;
      console.log("PRODUCT TYPE:", product.type);
      console.log("PRODUCT ID:", product.id);

      setLoadingRelated(true);
      let allData = [];
      let relatedData = [];

      try {
        if (product.type === "product" || product.type === "vendor-product") {
          // fetch all related products (no limit for View More functionality)
          const res = await fetch(
            `${API_BASE_URL.replace("admin-api", "user-api")}/products?limit=8`,
          );
          const resData = await res.json();
          allData = resData.data || [];
          relatedData = allData.slice(0, 4); // First 4 for display
        } else if (product.type === "service") {
          // fetch all related services (no limit for View More functionality)
          const res = await fetch(`${API_BASE_URL}/services?limit=8`);
          const resData = await res.json();
          allData = resData.data || [];
          relatedData = allData.slice(0, 4); // First 4 for display
        }

        // Store all related items for View More button
        setAllRelatedItems(allData);

        // Normalize each item (product or service) to use same keys
        const normalized = (Array.isArray(relatedData) ? relatedData : []).map(
          (item) => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price || 0,
            thumbnail: item.thumbnail || null,
            type: product.type === "service" ? "service" : "product",
          }),
        );

        setRelatedProducts(normalized);
      } catch (err) {
        console.error("Error fetching related items:", err);
        setRelatedProducts([]);
        setAllRelatedItems([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedItems();
  }, [product?.id]); // Only re-fetch when product ID changes

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate stock before adding
    const validation = canAddToCart(product, quantity);
    if (!validation.allowed) {
      showError(validation.message);
      return;
    }

    try {
      // Create product object with sale information
      const cartProduct = {
        ...product,
        finalPrice: isOnSale ? calculateSalePrice() : product.price,
      };

      const result = await addToCart(cartProduct, quantity);
      if (result.success) {
        const priceText = isOnSale
          ? `at sale price ₹${calculateSalePrice().toFixed(2)}`
          : `at ₹${product.price}`;
        success(`Added ${quantity} × ${product.name} ${priceText} to cart`);
      } else {
        showError(result.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      showError(err.message || "Failed to add to cart");
    }
  };

  const handleRelatedProductAddToCart = async (relatedProduct, e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    // Validate stock before adding
    const validation = canAddToCart(relatedProduct, 1);
    if (!validation.allowed) {
      showError(validation.message);
      return;
    }

    try {
      const result = await addToCart(relatedProduct, 1);
      if (result.success) {
        success(`Added ${relatedProduct.name} to cart`);
      } else {
        showError(result.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Failed to add related product to cart:", err);
      showError(err.message || "Failed to add to cart");
    }
  };

  const handleRelatedProductClick = (e, productId) => {
    // Smooth scroll to top when navigating to related product
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        success("Removed from wishlist");
      } else {
        await addToWishlist(product);
        success("Added to wishlist");
      }
    } catch {
      showError("Failed to update wishlist");
    }
  };

  // Calculate sale price if product is on clearance sale
  const calculateSalePrice = () => {
    if (!isOnSale || !clearanceData?.inhouseOffer) {
      return product.price;
    }

    const originalPrice = parseFloat(product.price) || 0;
    const discountAmount =
      parseFloat(clearanceData.inhouseOffer.discountAmount) || 0;
    const discountType = clearanceData.inhouseOffer.discountType;

    if (discountType === "percentage") {
      return originalPrice * (1 - discountAmount / 100);
    } else if (discountType === "flat") {
      return Math.max(0, originalPrice - discountAmount);
    }

    return originalPrice;
  };

  const getSaleInfo = () => {
    if (!isOnSale || !clearanceData?.inhouseOffer) {
      return null;
    }

    const originalPrice = parseFloat(product.price) || 0;
    const salePrice = calculateSalePrice();
    const discountPercentage =
      originalPrice > 0
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

    return {
      originalPrice,
      salePrice,
      discountPercentage,
      discountType: clearanceData.inhouseOffer.discountType,
      discountAmount: clearanceData.inhouseOffer.discountAmount,
    };
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (!product)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">�</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Servers Under Maintenance
          </h2>
          <p className="text-gray-600 mb-4">
            Our servers are currently down for maintenance. We'll be back
            shortly!
          </p>
          <ul className="text-left text-gray-600 mb-4 max-w-md mx-auto space-y-1">
            <li>• Server maintenance in progress</li>
            <li>• Expected to be resolved soon</li>
            <li>• Your cart and wishlist are saved locally</li>
          </ul>
          <div className="space-y-3">
            <button
              onClick={() => {
                setHasFetchFailed(false);
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-4 py-2 sm:px-6 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link
              to="/products"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );

  console.log("🔍 Product loaded:", product);
  console.log("🔍 Product image data:", {
    thumbnail: product.thumbnail,
    bannerImage: product.bannerImage,
    images: product.images,
    hasThumbnail: !!product.thumbnail,
    hasBannerImage: !!product.bannerImage,
    hasImages: !!(product.images && product.images.length > 0),
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden">
      <Navigation />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500"
        >
          <ChevronLeft size={20} /> Back to Products
        </Link>
      </div>

      {/* HERO SECTION - Product Images & Info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Product Image Gallery */}
          <div className="space-y-4">
            {/* Main Product Image */}
            <div className="aspect-square overflow-hidden rounded-xl shadow-sm bg-gray-100">
              <img
                src={
                  selectedImage ||
                  (product.thumbnail
                    ? product.thumbnail.startsWith("http")
                      ? product.thumbnail
                      : IMAGE_BASE_URL + product.thumbnail
                    : product.bannerImage
                      ? product.bannerImage
                      : product.images && product.images.length > 0
                        ? product.images[0]
                        : FALLBACK_IMAGE)
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer transition-all ${
                      selectedImage === image
                        ? "ring-2 ring-blue-500"
                        : "hover:opacity-80"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={
                        image.startsWith("http")
                          ? image
                          : IMAGE_BASE_URL + image
                      }
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.type === "vendor-product" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Store size={14} className="mr-1" />
                  Vendor Product
                </span>
              )}
              {product.type === "service" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  <Star size={14} className="mr-1" />
                  Service
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(product.rating)
                      ? "text-yellow-500 fill-current"
                      : "text-gray-400"
                  }
                />
              ))}
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="space-y-2">
              {isOnSale && getSaleInfo() ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 line-through text-lg">
                    ₹{getSaleInfo().originalPrice.toFixed(2)}
                  </span>
                  <span className="text-3xl font-bold text-red-600">
                    ₹{getSaleInfo().salePrice.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    Save ₹{" "}
                    {(
                      getSaleInfo().originalPrice - getSaleInfo().salePrice
                    ).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-red-600">
                  ₹{product.price}
                </span>
              )}

              {/* Sale Badge */}
              {isOnSale && (
                <div className="flex items-center gap-2">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Tag size={16} />
                    Clearance Sale
                  </div>
                  {getSaleInfo() && (
                    <div className="bg-green-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                      {getSaleInfo().discountPercentage}% OFF
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Short Description */}
            <div className="text-gray-700">
              {product.description ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description.length > 200
                        ? product.description.substring(0, 200) + "..."
                        : product.description,
                  }}
                />
              ) : (
                <p>No description available</p>
              )}
            </div>

            {/* Product Highlights */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Key Features</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li> Premium quality product</li>
                <li> Fast delivery available</li>
                <li> Secure packaging</li>
                <li> Customer support available</li>
              </ul>
            </div>

            {/* Vendor Information */}
            {product.vendor && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      Vendor Information
                    </h3>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Verified Vendor
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">Sold by:</span>{" "}
                        {product.vendor.name}
                      </span>
                    </div>
                    <Link
                      to={`/vendor/${product.vendor._id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Visit Shop →
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      Verified Vendor • Fast Shipping
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Quality assured by Apna Decoration vendor partners
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & CTA Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 text-gray-900 font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                  <ShoppingBag size={16} className="sm:size-20" />
                  Add to Cart
                </button>

                <button
                  onClick={() => {
                    if (isInWishlist(product.id || product._id)) {
                      removeFromWishlist(product.id || product._id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                  className={`p-2 sm:p-3 rounded-lg border transition-colors ${
                    isInWishlist(product.id || product._id)
                      ? "border-red-500 text-red-500 bg-red-50"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Heart
                    size={16}
                    className="sm:size-20"
                    fill={
                      isInWishlist(product.id || product._id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck size={16} />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={16} />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED INFORMATION SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-8">
          {/* Tabs for Description, Specifications, Reviews */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "description"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "specifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Product Description
                </h3>
                <div
                  className="text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description || "<p>No description available</p>",
                  }}
                />
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specifications" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Product Specifications
                </h3>
                <div className="space-y-4">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-900 w-1/3">
                          Product Name
                        </td>
                        <td className="py-2 text-gray-700">{product.name}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-900 w-1/3">
                          Price
                        </td>
                        <td className="py-2 text-gray-700">
                          ₹{" "}
                          {isOnSale && getSaleInfo()
                            ? getSaleInfo().salePrice.toFixed(2)
                            : product.price}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-900 w-1/3">
                          Type
                        </td>
                        <td className="py-2 text-gray-700 capitalize">
                          {product.type || "Product"}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-900 w-1/3">
                          Rating
                        </td>
                        <td className="py-2 text-gray-700">
                          {product.rating} / 5.0
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-900 w-1/3">
                          Reviews
                        </td>
                        <td className="py-2 text-gray-700">
                          {product.reviews} reviews
                        </td>
                      </tr>
                      {product.vendor && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-900 w-1/3">
                            Vendor
                          </td>
                          <td className="py-2 text-gray-700">
                            {product.vendor.name}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Reviews
                </h3>
                <ProductReviews productId={id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 ? (
        <>
          <div className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related {product.type === "service" ? "Services" : "Products"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden"
                  onClick={(e) => handleRelatedProductClick(e, item.id)}
                >
                  <img
                    src={
                      item.thumbnail
                        ? item.thumbnail.startsWith("http")
                          ? item.thumbnail
                          : IMAGE_BASE_URL + item.thumbnail
                        : FALLBACK_IMAGE
                    }
                    alt={item.name}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-red-500 font-bold">₹. {item.price}</p>
                      <button
                        onClick={(e) => handleRelatedProductAddToCart(item, e)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-2 sm:px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-1"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag size={10} className="sm:size-12" />
                        Add
                      </button>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">
                      {item.type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {allRelatedItems.length > 4 && (
              <div className="text-center mt-6">
                <Link
                  to={product.type === "service" ? "/services" : "/products"}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View More{" "}
                  {product.type === "service" ? "Services" : "Products"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center py-8 text-gray-500">
            <p>
              No related {product.type === "service" ? "services" : "products"}{" "}
              found
            </p>
          </div>
        </div>
      )}

      {/* Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900 text-lg">
            {isOnSale && getSaleInfo()
              ? `₹${getSaleInfo().salePrice.toFixed(2)}`
              : `₹${product.price}`}
          </span>
          {isOnSale && (
            <span className="text-sm text-gray-500 line-through">
              ₹{getSaleInfo().originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-gray-700 hover:bg-gray-100"
            >
              <Minus size={16} />
            </button>
            <span className="px-3 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-gray-700 hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Add to Cart
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
