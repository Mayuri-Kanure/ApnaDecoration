import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { IMAGE_BASE_URL } from "../config/constants";
import { useProducts } from "../contexts/ProductContext";
import categoryService from "../services/categoryService";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import {
  ShoppingBag,
  Heart,
  Filter,
  Star,
  Grid,
  List,
  Sparkles,
  Calendar,
  Gift,
  Ring,
  Cake,
  Clock,
  ChevronLeft,
  CheckCircle,
  X,
  Eye,
  Search,
} from "lucide-react";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import MobileNavigation from "../components/MobileNavigation";
import BackButton from "../components/BackButton";

const FALLBACK_IMAGE =
  "data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZpbmV0XQ0YzGF0YWRhAAAAAG1kZXR0AAAAAGlzb2NtAAABGGFzdGIAAAAARQAAABQAAQAAAQAAAQAAAQAAAQAAAAABRzdGNzZwAABAFtAAAAFGlzdHRzZwAABAFtAAAAFGZyZWN0aWZ1aWYAAAAADnJpdHBlZ25lbWVpbmEAAAAAU3RhdGFfYXJ0aWZpc2V0AAAAAFRhdGFPYmplY3QAAAIAAAAABgAAAAYAAAAcAAAAA8AAAAPAAAAA+AAAATwAAAAQAAAABAAAAEQAAAAkAAAAJgAAABIAAAATAAAAEQAAABMAAAAUAAAAFAAAABYAAAAWAAAAFwAAABgAAAAZAAAAGgAAABsAAAAcAAAAHQAAAB4AAAAfAAAAIAAAACEAAAAiAAAAIwAAACQAAAAjQAAACUAAAAJgAAACYAAAAnAAAAKAAAACkAAAAqAAAAKwAAACsAAAAsAAAALQAAAC4AAAAvAAAAMAAAADEAAAAxAAAAMgAAADMAAAA0AAAANQAAADYAAAA2AAAANwAAADcAAAA4AAAAOQAAADoAAAA7AAAAPwAAAD8AAAA";

const Products = () => {
  const { products, loading, error } = useProducts();
  const {
    addToCart,
    isInCart,
    addToWishlist,
    isInWishlist,
    removeFromWishlist,
  } = useCart();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  // Debug logging
  console.log("🔍 Products Page: Products from context:", products);
  console.log("🔍 Products Page: Loading:", loading);
  console.log("🔍 Products Page: Error:", error);
  console.log("🔍 Products Page: Products count:", products?.length || 0);

  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");

  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchResults, setSearchResults] = useState({ products: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const catRes = await categoryService.getCategories();
        console.log("Categories response:", catRes);

        // Handle different response formats
        let categoriesData = [];
        if (catRes?.categories) {
          categoriesData = catRes.categories;
        } else if (catRes?.data) {
          categoriesData = catRes.data;
        } else if (Array.isArray(catRes)) {
          categoriesData = catRes;
        }

        console.log("Setting categories:", categoriesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Set fallback categories
        setCategories([
          { _id: "all", name: "All Categories" },
          { _id: "birthday", name: "Birthday" },
          { _id: "wedding", name: "Wedding" },
          { _id: "anniversary", name: "Anniversary" },
          { _id: "party", name: "Party" },
        ]);
      }
    };

    fetchCategories();
  }, []);

  // Enhanced Search functionality - Real-time suggestions
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      // Show suggestions after 2 letters
      performSearch(searchTerm);
    } else if (searchTerm.trim().length === 0) {
      setSearchResults({ products: [] });
    }
  }, [searchTerm]);

  const performSearch = async (term) => {
    try {
      setSearchLoading(true);
      console.log("Searching for:", term);

      // Enhanced search with partial matching and priority
      const searchLower = term.toLowerCase();

      // Filter products with enhanced matching
      const filteredProducts = products
        .map((product) => {
          const name = product.name?.toLowerCase() || "";
          const description = product.description?.toLowerCase() || "";
          const categoryName =
            typeof product.category === "object"
              ? product.category?.name?.toLowerCase() || ""
              : product.category?.toLowerCase() || "";

          // Calculate match score for better ranking
          let score = 0;

          // Exact name match gets highest score
          if (name === searchLower) score += 100;
          // Name starts with search term
          else if (name.startsWith(searchLower)) score += 80;
          // Name contains search term
          else if (name.includes(searchLower)) score += 60;

          // Category name matching
          if (categoryName === searchLower) score += 40;
          else if (categoryName.startsWith(searchLower)) score += 30;
          else if (categoryName.includes(searchLower)) score += 20;

          // Description matching (lower priority)
          if (description.includes(searchLower)) score += 10;

          return {
            product,
            score,
            matchType:
              name === searchLower
                ? "exact"
                : name.startsWith(searchLower)
                  ? "startsWith"
                  : name.includes(searchLower)
                    ? "contains"
                    : "other",
          };
        })
        .filter((item) => item.score > 0) // Only show products that match
        .sort((a, b) => b.score - a.score) // Sort by score (highest first)
        .slice(0, 5) // Show max 5 results
        .map((item) => item.product);

      console.log("Search results:", filteredProducts);
      setSearchResults({ products: filteredProducts });
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({ products: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryId || "all");
    setShowFeaturedOnly(searchParams.get("featured") === "true");
    console.log("🔍 Category filter applied:", {
      categoryId,
      selectedCategory: categoryId || "all",
      featuredOnly: searchParams.get("featured") === "true",
    });
  }, [categoryId, searchParams]);

  /* ---------------- FILTERING ---------------- */
  const filteredProducts = useMemo(() => {
    console.log("Filtering products:", {
      totalProducts: products.length,
      selectedCategory,
      searchTerm,
      showFeaturedOnly,
    });

    return products.filter((p) => {
      // Only show products (not services) on products page
      if (p.type === "service") return false;

      // Search functionality
      const searchLower = searchTerm.toLowerCase();
      const categoryName =
        typeof p.category === "object" ? p.category?.name : p.category;
      const matchSearch =
        !searchTerm ||
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        categoryName?.toLowerCase().includes(searchLower) ||
        p.category_name?.toLowerCase().includes(searchLower);

      // Category filtering - simplified
      const categoryId =
        typeof p.category === "object" ? p.category?._id : p.category;
      const matchCategory =
        selectedCategory === "all" ||
        p.category_id === selectedCategory ||
        p.category_id?._id === selectedCategory ||
        p.category_id?.toString() === selectedCategory ||
        categoryId === selectedCategory ||
        p.category_name === selectedCategory;

      // Price range filtering
      const matchPrice =
        !p.price || (p.price >= priceRange[0] && p.price <= priceRange[1]);

      // Featured filtering
      const matchFeatured = !showFeaturedOnly || p.featured || p.is_featured;

      // Final decision
      const shouldShow =
        matchSearch && matchCategory && matchPrice && matchFeatured;

      console.log(`Product ${p.name}:`, {
        matchSearch,
        matchCategory,
        matchPrice,
        matchFeatured,
        shouldShow,
        categoryId: p.category_id,
        category: p.category,
      });

      return shouldShow;
    });
  }, [products, searchTerm, selectedCategory, priceRange, showFeaturedOnly]);

  /* ---------------- SORTING ---------------- */
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-low") return list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return list.sort((a, b) => b.price - a.price);
    if (sortBy === "rating")
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [filteredProducts, sortBy]);

  /* ---------------- HELPERS ---------------- */
  const handleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent scroll behavior
    e.currentTarget.style.scrollMarginTop = "0";

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      success("Removed from wishlist");
    } else {
      addToWishlist(product);
      success("Added to wishlist");
    }
  };

  /* ---------------- PRODUCT CARD ---------------- */
  const ProductCard = ({ product }) => {
    const image = product.thumbnail?.startsWith("http")
      ? product.thumbnail
      : FALLBACK_IMAGE;

    // Use fallback ID for navigation
    const productId = product._id || product.id;
    const isService = product.type === "service";
    console.log("🔍 ProductCard - Product:", product);
    console.log("🔍 ProductCard - ProductId:", productId);
    console.log("🔍 ProductCard - IsService:", isService);

    if (!productId) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> Product missing ID
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2 relative h-full flex flex-col group">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Product Image */}
        <div className="relative overflow-hidden">
          <Link
            to={isService ? `/service/${productId}` : `/product/${productId}`}
            className="block focus:outline-none focus:ring-0 active:outline-none"
            onClick={(e) => {
              // Smooth scroll to top when navigating to product detail
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src={image}
              alt={product.name}
              className="h-48 w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
              loading="lazy"
            />

            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Link>

          {/* Wishlist Button - OUTSIDE the Link */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlist(e, product);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white ${
              isInWishlist(productId)
                ? "text-red-500 shadow-red-200"
                : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart
              size={16}
              fill={isInWishlist(productId) ? "currentColor" : "none"}
              className={`transition-all duration-300 ${isInWishlist(productId) ? "scale-110" : ""}`}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 relative flex-1 flex flex-col">
          <Link
            to={isService ? `/service/${productId}` : `/product/${productId}`}
            className="block focus:outline-none focus:ring-0 active:outline-none flex-1"
            onClick={(e) => {
              // Smooth scroll to top when navigating to product detail
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {/* Product Name */}
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors duration-300 text-lg min-h-[48px]">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]">
              {product.description ||
                "High-quality decoration item perfect for your special events and celebrations."}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3 min-h-[24px]">
              <div className="flex items-center">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-300 text-yellow-300" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {product.rating || "4.5"}
              </span>
              <span className="text-xs text-gray-400">
                ({product.reviews || "128"})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-4 min-h-[60px]">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-red-600">
                  ₹{product.price}
                </span>
                {/* Show original price with discount calculation */}
                {(() => {
                  const originalPrice =
                    product.originalPrice || product.price * 2.5; // Fallback: show 60% discount
                  return (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{Math.round(originalPrice)}
                    </span>
                  );
                })()}
              </div>

              {/* Discount badge - always show */}
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                {(() => {
                  const originalPrice =
                    product.originalPrice || product.price * 2.5;
                  const discount = Math.round(
                    (1 - product.price / originalPrice) * 100,
                  );
                  return `${discount}% OFF`;
                })()}
              </span>
            </div>
          </Link>

          {/* Action Buttons - OUTSIDE the Link */}
          <div className="mt-auto flex gap-2">
            {isService ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Navigate to booking or service detail
                  window.location.href = `/service/${productId}`;
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Book Service
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Normalize product category before adding to cart
                    const normalizedProduct = {
                      ...product,
                      category:
                        typeof product.category === "object"
                          ? product.category?.name || ""
                          : product.category || "",
                    };
                    addToCart(normalizedProduct, 1);
                    success(`${product.name} added to cart!`);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  {isInCart(productId) ? "In Cart" : "Add to Cart"}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBuyNow(product, e);
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  Buy Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="text-center py-20">Loading products…</div>
        <Footer />
      </div>
    );
  }

  // Handle buy now functionality
  const handleBuyNow = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Normalize product category before adding to cart
      const normalizedProduct = {
        ...product,
        category:
          typeof product.category === "object"
            ? product.category?.name || ""
            : product.category || "",
      };
      await addToCart(normalizedProduct, 1);
      success(`${product.name} added to cart! Redirecting to checkout...`);
      // Navigate to checkout after a short delay
      setTimeout(() => {
        navigate("/checkout");
      }, 1000);
    } catch (error) {
      showError("Failed to add to cart");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 text-center text-white">
        <div className="w-full px-4 lg:px-6">
          <BackButton
            to="/"
            label="Back to Home"
            className="mb-3 text-black/80 hover:text-black text-sm"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-white/90">
            Browse our collection of decoration items
          </p>
        </div>
      </div>

      <main className="w-full px-4 lg:px-6 py-10 flex gap-4 lg:gap-6">
        <aside className="hidden lg:block w-64 bg-white p-6 rounded-lg shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={18} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filters</h2>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative" ref={searchRef}>
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search products (e.g., Birthday, Wedding, Flowers)..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  // Auto-open dropdown when typing
                  if (value.trim().length >= 2) {
                    setSearchDropdownOpen(true);
                  } else if (value.trim().length === 0) {
                    setSearchDropdownOpen(false);
                  }
                }}
                onFocus={() => setSearchDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setSearchDropdownOpen(false), 200)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
              />

              {/* Search Dropdown */}
              {searchDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[99999] max-h-96">
                  {searchLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : (
                    <>
                      {/* Search Results */}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Products ({searchResults.products.length})
                          </div>
                          {searchResults.products.map((product) => {
                            const highlightText = (text, term) => {
                              if (!text || !term) return text;
                              const regex = new RegExp(`(${term})`, "gi");
                              return text.replace(
                                regex,
                                '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>',
                              );
                            };

                            return (
                              <button
                                key={product.id || product._id}
                                onClick={() => {
                                  setSearchTerm(product.name);
                                  setSearchDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className="font-medium text-gray-900 text-sm truncate"
                                      dangerouslySetInnerHTML={{
                                        __html: highlightText(
                                          product.name,
                                          searchTerm,
                                        ),
                                      }}
                                    />
                                    <div className="flex items-center gap-2 mt-1">
                                      {product.price && (
                                        <span className="text-xs font-semibold text-purple-600">
                                          ₹{product.price}
                                        </span>
                                      )}
                                      {product.rating && (
                                        <div className="flex items-center gap-1">
                                          <Star
                                            size={12}
                                            className="text-yellow-400 fill-current"
                                          />
                                          <span className="text-xs text-gray-600">
                                            {product.rating}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <svg
                                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* No Results */}
                      {searchResults.products.length === 0 &&
                        searchTerm.trim() !== "" && (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No products found for "{searchTerm}"
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price: ₹{priceRange[1].toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="50000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, +e.target.value])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </aside>

        <div className="flex-1">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Filter size={16} />
            Filter Products
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
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Filters Content */}
                <div className="p-4 space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        // Auto-close after selection for better UX
                        setTimeout(() => setShowMobileFilters(false), 300);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 text-gray-900"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>

                  {/* Featured Only */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured-mobile"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor="featured-mobile"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Show featured products only
                    </label>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => {
                      setShowMobileFilters(false);

                      // Scroll to products section with smooth animation
                      setTimeout(() => {
                        const productsSection =
                          document.querySelector(".grid.grid-cols-1");
                        if (productsSection) {
                          productsSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        } else {
                          // Fallback: scroll to a reasonable position
                          window.scrollTo({
                            top: 600,
                            behavior: "smooth",
                          });
                        }
                      }, 100); // Small delay to ensure panel closes first
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header with category info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory !== "all"
                  ? `${categories.find((c) => c._id === selectedCategory)?.name || "Selected Category"}`
                  : "All Products"}
              </h1>

              {/* Filter indicator badge */}
              {(selectedCategory !== "all" ||
                priceRange[1] < 50000 ||
                sortBy !== "featured" ||
                showFeaturedOnly) && (
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <Filter size={14} />
                  Filters Applied
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {sortedProducts.length}
                </span>{" "}
                {sortedProducts.length === 1 ? "product" : "products"} found
                {selectedCategory !== "all" && " in this category"}
              </p>

              {/* Clear filters button */}
              {(selectedCategory !== "all" ||
                priceRange[1] < 50000 ||
                sortBy !== "featured" ||
                showFeaturedOnly) && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange([0, 50000]);
                    setSortBy("featured");
                    setShowFeaturedOnly(false);
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedCategory !== "all"
                  ? "No Products Available in This Category"
                  : "No Products Found"}
              </h3>
              <p className="text-gray-600">
                {selectedCategory !== "all"
                  ? "There are no products available in this category. Try browsing other categories or check back later."
                  : "Try adjusting your filters"}
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse All Products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 items-stretch">
              {sortedProducts.map((p, index) => {
                // Debug: Log product structure
                console.log(`🔍 Product ${index}:`, p);
                console.log(`🔍 Product ${index} IDs:`, {
                  _id: p._id,
                  id: p.id,
                  name: p.name,
                });

                return (
                  <ProductCard
                    key={`${p._id || p.id || `product-${index}`}-${index}`}
                    product={p}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
