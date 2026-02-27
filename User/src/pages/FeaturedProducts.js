import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import productService from '../services/productService';
import { ArrowRight, Grid, List, Search, Filter, Sparkles, Star, Heart, ShoppingCart, ChevronLeft } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import EmptyState from '../components/EmptyState';

const FeaturedProducts = () => {
  const { featuredProducts, loading, error } = useProducts();
  const { addToCart, isInCart, addToWishlist, isInWishlist } = useCart();
  const { success, error: showError } = useToast();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(featuredProducts);
    } else {
      const filtered = featuredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, featuredProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await addToCart(product, 1, null, null);
      if (result.success) {
        success(`${product.name} added to cart successfully!`);
      } else {
        showError(result.error || 'Failed to add to cart');
      }
    } catch (err) {
      showError('Failed to add to cart');
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
        showError(result.error || 'Failed to add to wishlist');
      }
    } catch (err) {
      showError('Failed to add to wishlist');
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-yellow-500 rounded-sm animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
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
        <div className="max-w-7xl mx-auto px-4 py-8">
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
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-yellow-500 rounded-sm"></div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={28} />
              Featured Products
            </h1>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search featured products..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Featured Products Display */}
        {filteredProducts.length === 0 ? (
          <EmptyState 
            type="search"
            title="No featured products found"
            description={searchTerm ? `No featured products match "${searchTerm}"` : "No featured products available at the moment."}
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id || product._id}
                    to={product.type === 'service' ? `/service/${product.id || product._id}` : `/product/${product.id || product._id}`}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative block"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl mx-auto mb-4 group-hover:scale-110 transition duration-300 flex items-center justify-center overflow-hidden">
                      {product.thumbnail && product.thumbnail.startsWith('http') ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: product.thumbnail && product.thumbnail.startsWith('http') ? 'none' : 'flex' }}>
                        <Sparkles className="text-yellow-400" size={32} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-center mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm text-center line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-yellow-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Product
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`flex-1 bg-[#2B3445] text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-1 ${
                          isInCart(product.id || product._id)
                            ? 'bg-green-600 text-white'
                            : 'bg-[#2B3445] text-white hover:bg-black'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {isInCart(product.id || product._id) ? 'In Cart' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={(e) => handleAddToWishlist(product, e)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Heart 
                          size={14} 
                          className={isInWishlist(product.id || product._id) ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
                        />
                      </button>
                    </div>
                    <span className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      Featured
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id || product._id}
                    to={product.type === 'service' ? `/service/${product.id || product._id}` : `/product/${product.id || product._id}`}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex gap-6 relative block"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {product.thumbnail && product.thumbnail.startsWith('http') ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: product.thumbnail && product.thumbnail.startsWith('http') ? 'none' : 'flex' }}>
                        <Sparkles className="text-yellow-400" size={32} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">{product.name}</h3>
                          {product.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
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
                                  ? 'bg-green-600 text-white'
                                  : 'bg-[#2B3445] text-white hover:bg-black'
                              }`}
                            >
                              <ShoppingCart size={14} />
                              {isInCart(product.id || product._id) ? 'In Cart' : 'Add to Cart'}
                            </button>
                            <button
                              onClick={(e) => handleAddToWishlist(product, e)}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Heart 
                                size={14} 
                                className={isInWishlist(product.id || product._id) ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
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

      <Footer />
    </div>
  );
};

export default FeaturedProducts;
