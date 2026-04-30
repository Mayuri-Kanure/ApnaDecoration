import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import productService from "../services/productService";
import {
  ArrowRight,
  Grid,
  List,
  Search,
  Filter,
  Sparkles,
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";

const FeaturedProducts = () => {
  const { featuredProducts, loading, error } = useProducts();
  const { addToCart, isInCart, addToWishlist, isInWishlist } = useCart();
  const { success, error: showError } = useToast();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("featured");
  const searchInputRef = useRef(null);

  // Filter products based on all filters
  useEffect(() => {
    let filtered = featuredProducts;

    // Search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (product.sku &&
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Price filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1],
    );

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "featured":
        default:
          return 0; // Keep original order for featured
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, featuredProducts, priceRange, sortBy]);

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchSuggestions([]);
      setSearchDropdownOpen(false);
    } else {
      const suggestions = featuredProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description &&
              product.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (product.sku &&
              product.sku.toLowerCase().includes(searchTerm.toLowerCase())),
        )
        .slice(0, 5);
      setSearchSuggestions(suggestions);
      setSearchDropdownOpen(true);
    }
  }, [searchTerm, featuredProducts]);

  // Update dropdown position when search is focused
  useEffect(() => {
    if (searchDropdownOpen && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [searchDropdownOpen, searchSuggestions]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    // Close dropdown on Enter key
    if (e.key === "Enter") {
      setSearchDropdownOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setSearchDropdownOpen(false);
  };

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await addToCart(product, 1, null, null);
      if (result.success) {
        success(`${product.name} added to cart successfully!`);
      } else {
        showError(result.error || "Failed to add to cart");
      }
    } catch (err) {
      showError("Failed to add to cart");
    }
  };

  const handleAddToWishlist = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await addToWishlist(product);
      if (result.success) {
        success(`${product.name} added to wishlist!`);
      } else {
        showError(result.error || "Failed to add to wishlist");
      }
    } catch (err) {
      showError("Failed to add to wishlist");
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <Navigation />
        <div className="w-full px-4 lg:px-6 py-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-yellow-500 rounded-sm animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm animate-pulse"
              >
                <div className="w-20 h-20 bg-gray-200 rounded-xl mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <Navigation />
        <div className="w-full px-4 lg:px-6 py-8">
          <EmptyState
            type="error"
            title="Failed to load featured products"
            description="We couldn't load the featured products. Please try again."
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navigation />

      {/* Back Button */}
      <div className="w-full px-4 lg:px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>
      </div>

      <div className="w-full px-4 lg:px-6 py-8">
        {/* Desktop Filters - Collapsible Section Above Products */}
        {showSidebar && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-600" />
                  <h2 className="font-semibold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-700"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price: ₹{priceRange[1].toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, +e.target.value])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-700"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {filteredProducts.length}
                    </span>{" "}
                    products found
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-yellow-500 rounded-sm"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={28} />
                Featured Products
              </h1>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>

              {/* Filter indicator badge */}
              {(searchTerm.trim() !== "" ||
                priceRange[1] < 50000 ||
                sortBy !== "featured") && (
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <Filter size={14} />
                  Filters Applied
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Desktop Filter Toggle Button */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Filter size={16} />
                {showSidebar ? "Hide Filters" : "Show Filters"}
              </button>
              {/* Clear filters button */}
              {(searchTerm.trim() !== "" ||
                priceRange[1] < 50000 ||
                sortBy !== "featured") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setPriceRange([0, 50000]);
                    setSortBy("featured");
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 sm:p-2 rounded ${viewMode === "grid" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 sm:p-2 rounded ${viewMode === "list" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search featured products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchDropdownOpen(false);
                    }
                  }}
                  onFocus={() => {
                    if (searchSuggestions.length > 0) {
                      setSearchDropdownOpen(true);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />

                {/* Search Suggestions Dropdown */}
                {searchDropdownOpen && searchSuggestions.length > 0 && (
                  <div
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                    }}
                  >
                    <div className="p-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-150 text-left"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {suggestion.thumbnail &&
                            suggestion.thumbnail.startsWith("http") ? (
                              <img
                                src={suggestion.thumbnail}
                                alt={suggestion.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Sparkles className="text-gray-400" size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {suggestion.name}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              {suggestion.sku && `SKU: ${suggestion.sku}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Filter size={16} />
                Filters
              </button>

              {/* Mobile Filter Panel */}
              {showMobileFilters && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
                  <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Filter Products
                      </h3>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronLeft size={20} className="text-gray-500" />
                      </button>
                    </div>

                    {/* Filters Content */}
                    <div className="p-4 space-y-4">
                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search
                        </label>
                        <input
                          type="text"
                          placeholder="Search featured products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Price: ₹{priceRange[1]}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="500"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([0, +e.target.value])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₹0</span>
                          <span>₹50,000</span>
                        </div>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="featured">Featured</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="rating">Highest Rated</option>
                        </select>
                      </div>

                      {/* View Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          View Mode
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 ${
                              viewMode === "grid"
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            <Grid size={16} />
                            Grid
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 ${
                              viewMode === "list"
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            <List size={16} />
                            List
                          </button>
                        </div>
                      </div>

                      {/* Results Count */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">
                            {filteredProducts.length}
                          </span>{" "}
                          featured products found
                        </p>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Products Display */}
        <div>
          {filteredProducts.length === 0 ? (
            <EmptyState
              type="search"
              title="No featured products found"
              description={
                searchTerm
                  ? `No featured products match "${searchTerm}"`
                  : "No featured products available at the moment."
              }
            />
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {filteredProducts.map((product, index) => {
                    // Debug: Log product type and routing decision
                    console.log(`🔍 ProductCard - Product:`, product);
                    console.log(
                      `🔍 ProductCard - ProductId:`,
                      product.id || product._id,
                    );
                    console.log(
                      `🔍 ProductCard - IsService:`,
                      product.type === "service",
                    );

                    return (
                      <Link
                        key={`${product.id || product._id}-${index}-grid`}
                        to={
                          product.type === "service"
                            ? `/service/${product.id || product._id}`
                            : `/product/${product.id || product._id}`
                        }
                        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative block h-full flex flex-col focus:outline-none focus:ring-0"
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-xl mx-auto mb-4 group-hover:scale-110 transition duration-300 bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                          {product.thumbnail &&
                          product.thumbnail.startsWith("http") ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              display:
                                product.thumbnail &&
                                product.thumbnail.startsWith("http")
                                  ? "none"
                                  : "flex",
                            }}
                          >
                            <Sparkles className="text-yellow-400" size={32} />
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-center mb-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-gray-600 text-sm text-center line-clamp-2 mb-3">
                            {product.description}
                          </p>
                        )}
                        {product.price && (
                          <div className="text-center mb-3">
                            <span className="text-lg font-bold text-red-600">
                              ₹ {product.price}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-yellow-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Product
                            <ArrowRight
                              size={16}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </span>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`flex-1 bg-[#2B3445] text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-1 ${
                              isInCart(product.id || product._id)
                                ? "bg-green-600 text-white"
                                : "bg-[#2B3445] text-white hover:bg-black"
                            }`}
                          >
                            <ShoppingCart size={14} />
                            {isInCart(product.id || product._id)
                              ? "In Cart"
                              : "Add to Cart"}
                          </button>
                          <button
                            onClick={(e) => handleAddToWishlist(product, e)}
                            className="p-3 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <Heart
                              size={14}
                              className={
                                isInWishlist(product.id || product._id)
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-600"
                              }
                            />
                          </button>
                        </div>
                        <span className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Sparkles size={12} />
                          Featured
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product, index) => (
                    <Link
                      key={`${product.id || product._id}-${index}-list`}
                      to={
                        product.type === "service"
                          ? `/service/${product.id || product._id}`
                          : `/product/${product.id || product._id}`
                      }
                      className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative block focus:outline-none focus:ring-0"
                    >
                      <div className="aspect-square overflow-hidden rounded-xl flex-shrink-0 bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                        {product.thumbnail &&
                        product.thumbnail.startsWith("http") ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            display:
                              product.thumbnail &&
                              product.thumbnail.startsWith("http")
                                ? "none"
                                : "flex",
                          }}
                        >
                          <Sparkles className="text-yellow-400" size={32} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            {product.price && (
                              <div className="mb-3">
                                <span className="text-lg font-bold text-red-600">
                                  ₹ {product.price}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-4 mb-3">
                              <span className="text-yellow-600 font-medium flex items-center gap-1">
                                View Product
                                <ArrowRight size={16} />
                              </span>
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Sparkles size={12} />
                                Featured
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => handleAddToCart(product, e)}
                                className={`bg-[#2B3445] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-1 ${
                                  isInCart(product.id || product._id)
                                    ? "bg-green-600 text-white"
                                    : "bg-[#2B3445] text-white hover:bg-black"
                                }`}
                              >
                                <ShoppingCart size={14} />
                                {isInCart(product.id || product._id)
                                  ? "In Cart"
                                  : "Add to Cart"}
                              </button>
                              <button
                                onClick={(e) => handleAddToWishlist(product, e)}
                                className="p-3 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                <Heart
                                  size={14}
                                  className={
                                    isInWishlist(product.id || product._id)
                                      ? "text-red-500 fill-red-500"
                                      : "text-gray-600"
                                  }
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FeaturedProducts;
