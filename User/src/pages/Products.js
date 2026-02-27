import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../config/constants';
import { useProducts } from '../contexts/ProductContext';
import categoryService from '../services/categoryService';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
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
  Search
} from 'lucide-react';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MobileNavigation from '../components/MobileNavigation';
import BackButton from '../components/BackButton';

const FALLBACK_IMAGE = 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZpbmV0XQ0YzGF0YWRhAAAAAG1kZXR0AAAAAGlzb2NtAAABGGFzdGIAAAAARQAAABQAAQAAAQAAAQAAAQAAAQAAAAABRzdGNzZwAABAFtAAAAFGlzdHRzZwAABAFtAAAAFGZyZWN0aWZ1aWYAAAAADnJpdHBlZ25lbWVpbmEAAAAAU3RhdGFfYXJ0aWZpc2V0AAAAAFRhdGFPYmplY3QAAAIAAAAABgAAAAYAAAAcAAAAA8AAAAPAAAAA+AAAATwAAAAQAAAABAAAAEQAAAAkAAAAJgAAABIAAAATAAAAEQAAABMAAAAUAAAAFAAAABYAAAAWAAAAFwAAABgAAAAZAAAAGgAAABsAAAAcAAAAHQAAAB4AAAAfAAAAIAAAACEAAAAiAAAAIwAAACQAAAAjQAAACUAAAAJgAAACYAAAAnAAAAKAAAACkAAAAqAAAAKwAAACsAAAAsAAAALQAAAC4AAAAvAAAAMAAAADEAAAAxAAAAMgAAADMAAAA0AAAANQAAADYAAAA2AAAANwAAADcAAAA4AAAAOQAAADoAAAA7AAAAPwAAAD8AAAA';

const Products = () => {
  const { products, loading, error } = useProducts();
  const { addToCart, isInCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  // Debug logging
  console.log('🔍 Products Page: Products from context:', products);
  console.log('🔍 Products Page: Loading:', loading);
  console.log('🔍 Products Page: Error:', error);
  console.log('🔍 Products Page: Products count:', products?.length || 0);

  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await categoryService.getCategories();
        setCategories(catRes?.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryId || 'all');
    setShowFeaturedOnly(searchParams.get('featured') === 'true');
    console.log('🔍 Category filter applied:', {
      categoryId,
      selectedCategory: categoryId || 'all',
      featuredOnly: searchParams.get('featured') === 'true'
    });
  }, [categoryId, searchParams]);

  /* ---------------- FILTERING ---------------- */
  const filteredProducts = useMemo(() => {
    console.log('🔍 Filtering products:', {
      totalProducts: products.length,
      selectedCategory,
      searchTerm,
      showFeaturedOnly
    });

    const filtered = products.filter(p => {
      // Show both products AND services for featured section
      const isProduct = p.type !== 'service';
      
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' ||
        p.category_id === selectedCategory ||
        p.category_id?._id === selectedCategory ||
        p.category === selectedCategory;

      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchFeatured = !showFeaturedOnly || p.featured || p.is_featured;

      // For featured section, show both products and services
      // For regular browsing, show only products
      const shouldShow = showFeaturedOnly ? (matchFeatured && matchSearch && matchCategory && matchPrice) : (isProduct && matchSearch && matchCategory && matchPrice);

      console.log(`🔍 Product ${p.name}:`, {
        isProduct,
        matchSearch,
        matchCategory,
        matchPrice,
        matchFeatured,
        shouldShow,
        categoryId: p.category_id,
        category: p.category
      });

      return shouldShow;
    });

    console.log('🔍 Filtered products count:', filtered.length);
    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, showFeaturedOnly]);

  /* ---------------- SORTING ---------------- */
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [filteredProducts, sortBy]);

  /* ---------------- HELPERS ---------------- */
  const handleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      success('Removed from wishlist');
    } else {
      addToWishlist(product);
      success('Added to wishlist');
    }
  };

  /* ---------------- PRODUCT CARD ---------------- */
  const ProductCard = ({ product }) => {
    const image =
      product.thumbnail?.startsWith('http')
        ? product.thumbnail
        : FALLBACK_IMAGE;

    // Use fallback ID for navigation
    const productId = product._id || product.id;
    const isService = product.type === 'service';
    console.log('🔍 ProductCard - Product:', product);
    console.log('🔍 ProductCard - ProductId:', productId);
    console.log('🔍 ProductCard - IsService:', isService);
    
    if (!productId) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> Product missing ID
        </div>
      );
    }

    return (
      <Link to={isService ? `/service/${productId}` : `/product/${productId}`} className="block group">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2 relative">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          {/* Product Image */}
          <div className="relative overflow-hidden">
            <img 
              src={image} 
              alt={product.name} 
              className="w-full h-48 object-cover transform transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
              loading="lazy"
            />
            
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist(e, product);
              }}
              className={`absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white ${
                isInWishlist(productId) 
                  ? 'text-red-500 shadow-red-200' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart 
                size={16} 
                fill={isInWishlist(productId) ? 'currentColor' : 'none'}
                className={`transition-all duration-300 ${isInWishlist(productId) ? 'scale-110' : ''}`}
              />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4 relative">
            {/* Product Name */}
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors duration-300 text-lg">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
              {product.description || 'High-quality decoration item perfect for your special events and celebrations.'}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-300 text-yellow-300" />
              </div>
              <span className="text-sm font-medium text-gray-700">{product.rating || '4.5'}</span>
              <span className="text-xs text-gray-400">({product.reviews || '128'})</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>
              
              {/* Discount badge */}
              {product.originalPrice && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                {isInCart(productId) ? 'In Cart' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </Link>
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

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
     

      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 text-center text-white">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton to="/" label="Back to Home" className="mb-3 text-black/80 hover:text-black text-sm" />
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-white/90">Browse our collection of decoration items</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10 flex gap-6">
        <aside className="hidden lg:block w-64 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={18} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filters</h2>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </aside>

        <div className="flex-1">
          {/* Header with category info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory !== 'all' 
                ? `${categories.find(c => c._id === selectedCategory)?.name || 'Selected Category'}`
                : 'All Products'
              }
            </h1>
            <p className="text-gray-600">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
              {selectedCategory !== 'all' && ' in this category'}
            </p>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedCategory !== 'all' ? 'No Products Available in This Category' : 'No Products Found'}
              </h3>
              <p className="text-gray-600">
                {selectedCategory !== 'all' 
                  ? 'There are no products available in this category. Try browsing other categories or check back later.'
                  : 'Try adjusting your filters'
                }
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse All Products
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((p, index) => {
                // Debug: Log product structure
                console.log(`🔍 Product ${index}:`, p);
                console.log(`🔍 Product ${index} IDs:`, {
                  _id: p._id,
                  id: p.id,
                  name: p.name
                });
                
                return (
                  <ProductCard 
                    key={p._id || p.id || `product-${index}`} 
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
