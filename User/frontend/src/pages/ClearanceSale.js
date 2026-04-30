import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { PRODUCT_API_URL } from "../config/constants";

const ClearanceSale = () => {
  const { addToCart, isInCart } = useCart();
  const { success, error: showError } = useToast();

  const [clearanceData, setClearanceData] = useState(null);
  const [inhouseProducts, setInhouseProducts] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Use PRODUCT_API_URL from constants
  const API_BASE_URL = PRODUCT_API_URL;

  useEffect(() => {
    fetchClearanceSaleData();
  }, []);

  const fetchClearanceSaleData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/clearance-sale/public`);
      console.log("🔍 Frontend received clearance data:", response.data.data);

      const clearanceData = response.data.data;

      // Extract inhouse products from the structured response
      const inhouseProducts =
        clearanceData?.inhouseOffer?.applicableProducts || [];
      const vendorProducts =
        clearanceData?.vendorOffers?.flatMap(
          (offer) => offer.applicableProducts || [],
        ) || [];

      console.log("🔍 Extracted products:", {
        inhouse: inhouseProducts.length,
        vendor: vendorProducts.length,
      });

      setInhouseProducts(inhouseProducts);
      setVendorProducts(vendorProducts);

      setClearanceData(clearanceData);

      setLoading(false);
    } catch (err) {
      console.error("❌ Frontend error:", err);
      setError("Failed to load clearance sale data");
      setLoading(false);
    }
  };

  const sortProducts = (products) => {
    // Ensure products is an array and not undefined
    if (!products || !Array.isArray(products) || products.length === 0) {
      return [];
    }

    return [...products].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price" || sortBy === "discountAmount") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const calculateDiscountPrice = (product) => {
    const price = parseFloat(product.price) || 0;

    // Use clearance sale discount information
    if (clearanceData?.inhouseOffer?.isActive) {
      const discountAmount =
        parseFloat(clearanceData.inhouseOffer.discountAmount) || 0;
      const discountType = clearanceData.inhouseOffer.discountType;

      if (discountType === "percentage") {
        return price * (1 - discountAmount / 100);
      } else if (discountType === "flat") {
        return Math.max(0, price - discountAmount);
      } else if (discountType === "product") {
        // For 'product' type, discountAmount is treated as percentage
        return price * (1 - discountAmount / 100);
      }
    }

    return price;
  };

  const ProductCard = ({ product, offerType = "inhouse" }) => {
    const originalPrice = parseFloat(product.price) || 0;
    const discountPrice = calculateDiscountPrice(product);
    const discountPercentage =
      originalPrice > 0
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

    console.log("🔍 ProductCard rendering:", {
      name: product.name,
      originalPrice,
      discountPrice,
      discountPercentage,
      productPrice: product.price,
      productKeys: Object.keys(product),
      hasPrice: !!product.price,
      priceType: typeof product.price,
    });

    // Determine the correct route based on product type
    const getProductRoute = () => {
      if (product.type === "service") {
        return `/service/${product._id}`;
      } else {
        return `/product/${product._id}`;
      }
    };

    const handleAddToCart = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // Create product object with sale information
        const cartProduct = {
          ...product,
          isOnSale: true,
          discountPrice,
          originalPrice,
          discountPercentage,
          finalPrice: discountPrice,
        };

        const result = await addToCart(cartProduct, 1);
        if (result.success) {
          success(
            `${product.displayName || product.name} added to cart at ₹${discountPrice.toFixed(2)}`,
          );
        } else {
          showError(result.error || "Failed to add to cart");
        }
      } catch {
        showError("Failed to add to cart");
      }
    };

    const handleWishlist = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // Wishlist functionality would go here
        success(`${product.displayName || product.name} added to wishlist`);
      } catch {
        showError("Failed to add to wishlist");
      }
    };

    return (
      <Link
        to={getProductRoute()}
        className="block transform transition-transform duration-200 sm:hover:scale-105"
      >
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          {/* Product Image */}
          <div className="relative">
            <img
              src={
                product.thumbnail ||
                product.image ||
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWVyaWdodD0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PC9zdmc+"
              }
              alt={product.displayName || product.name}
              className="w-full h-40 sm:h-48 object-cover"
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWVyaWdodD0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PC9zdmc+";
              }}
            />

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                {discountPercentage}% OFF
              </div>
            )}

            {/* Offer Type Badge */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {offerType === "inhouse" ? "INHOUSE" : "VENDOR"}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              {product.displayName || product.name}
            </h3>

            {/* Product Type */}
            <div className="text-xs text-gray-500 mb-2">
              {product.type === "product" && "📦 Product"}
              {product.type === "service" && "🛠️ Service"}
              {product.type === "vendor_product" && "🏪 Vendor Product"}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-3">
              <div>
                {originalPrice > discountPrice ? (
                  <>
                    <span className="text-gray-400 line-through text-sm">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                    <span className="text-red-600 font-bold text-lg ml-2">
                      ₹{discountPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-800 font-bold text-lg">
                    ₹{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-2 sm:py-3 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                className="p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ❤️
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clearance sale...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchClearanceSaleData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sortedInhouseProducts = sortProducts(inhouseProducts);
  const sortedVendorProducts = sortProducts(vendorProducts);
  const allProducts = [...sortedInhouseProducts, ...sortedVendorProducts];

  console.log("🔍 Products for rendering:", {
    sortedInhouseProducts: sortedInhouseProducts.length,
    sortedVendorProducts: sortedVendorProducts.length,
    allProducts: allProducts.length,
    sampleInhouseProduct: sortedInhouseProducts[0],
    sampleAllProduct: allProducts[0],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              🔥 Clearance Sale
            </h1>
            <p className="text-sm sm:text-base md:text-xl mb-2">
              Amazing deals on selected products and services!
            </p>
            {clearanceData?.inhouseOffer?.isActive && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
                <p className="text-lg">
                  Up to{" "}
                  <span className="font-bold text-yellow-300">
                    {clearanceData.inhouseOffer.discountAmount}% OFF
                  </span>{" "}
                  on selected items
                </p>
                <p className="text-sm mt-1">
                  Valid until:{" "}
                  {new Date(
                    clearanceData.inhouseOffer.endDate,
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Products</option>
                <option value="product">Products</option>
                <option value="service">Services</option>
                <option value="vendor_product">Vendor Products</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Added</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="discountAmount">Discount</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {allProducts.length} products found
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {allProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allProducts.map((product, index) => (
              <ProductCard
                key={`${product._id}-${index}-${product.type || "product"}`}
                product={product}
                offerType={
                  inhouseProducts.includes(product) ? "inhouse" : "vendor"
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No clearance products available
            </h3>
            <p className="text-gray-600">Check back later for amazing deals!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ClearanceSale;
