import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../config/constants';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import BackButton from '../components/BackButton';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star, Package, TrendingDown, AlertCircle } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    potentialSavings: 0,
    inStockItems: 0,
    outOfStockItems: 0
  });

  // Calculate stats whenever wishlist changes
  useEffect(() => {
    console.log('🛍 Wishlist Debug - Items:', wishlist.map(item => ({
      name: item.name,
      stock_qty: item.stock_qty,
      inStock: item.inStock,
      stock: item.stock
    })));
    
    const calculateStats = () => {
      const totalItems = wishlist.length;
      const totalValue = wishlist.reduce((sum, item) => sum + (item.unit_price || 0), 0);
      const potentialSavings = wishlist.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
      const inStockItems = wishlist.filter(item => (item.stock_qty || 0) > 0).length;
      const outOfStockItems = wishlist.filter(item => (item.stock_qty || 0) <= 0).length;

      setStats({
        totalItems,
        totalValue,
        potentialSavings,
        inStockItems,
        outOfStockItems
      });
    };

    calculateStats();
  }, [wishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setLoading(true);
      const result = await removeFromWishlist(productId);
      
      if (result.success) {
        success('Item removed from wishlist');
      } else {
        showError(result.error || 'Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      showError('Failed to remove item from wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      setLoading(true);
      const result = await addToCart(product, 1);
      
      if (result.success) {
        success('Item moved to cart');
      } else {
        showError(result.error || 'Failed to move to cart');
      }
    } catch (error) {
      console.error('Failed to move to cart:', error);
      showError('Failed to move to cart');
    } finally {
      setLoading(false);
    }
  };

  
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8">
              Start adding items to your wishlist to keep track of products you love
            </p>
            <div className="space-y-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ShoppingBag size={20} />
                Browse Products
              </Link>
              <div className="text-center">
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  <span className="text-gray-800">Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Header */}
            <div className="mb-8">
              <BackButton to="/products" label="Back to Products" className="mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                  <p className="text-gray-600">
                    {stats.totalItems} {stats.totalItems === 1 ? 'item' : 'items'} in your wishlist
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {stats.outOfStockItems > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      <AlertCircle size={14} />
                      {stats.outOfStockItems} out of stock
                    </div>
                  )}
                  {stats.potentialSavings > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <TrendingDown size={14} />
                      Save ${(stats.potentialSavings).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Wishlist Items */}
              <div className="lg:col-span-3">
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Start adding items to your wishlist to keep track of products you love
                    </p>
                    <div className="space-y-4">
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingBag size={20} />
                        Browse Products
                      </Link>
                      <div className="text-center">
                        <Link
                          to="/"
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                          <ArrowLeft size={16} />
                          <span className="text-gray-800">Back to Home</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item, index) => (
                      <div key={`${item._id || item.id}-${index}`} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-200">
                        <div className="relative">
                          {/* Product Image */}
                          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
                            {(item.thumbnail || item.bannerImage || item.image || (item.images && item.images.length > 0)) ? (
                              <img 
                                src={(() => {
                                  const imgPath = item.thumbnail || item.bannerImage || item.image || item.images[0];
                                  return imgPath?.startsWith('http') ? imgPath : `${IMAGE_BASE_URL}${imgPath}`;
                                })()}
                                alt={item.name || item.product_name_en}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={32} className="text-gray-400" />
                              </div>
                            )}
                            
                            {/* Overlay Actions */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => handleRemoveFromWishlist(item._id || item.id)}
                                className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                                title="Remove from wishlist"
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </div>

                            {/* Status Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                              {!(item.stock_qty > 0) && (
                                <div className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                                  Out of Stock
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="p-4">
                          <Link to={`/product/${item._id || item.id}`} className="block">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                              {item.name}
                            </h3>
                            
                            {/* SKU and Status */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                SKU: {item.sku}
                              </span>
                              {(item.stock_qty > 0) && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                  In Stock
                                </span>
                              )}
                            </div>
                            
                            {/* Rating */}
                            {item.rating > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={12} 
                                      className={i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 ml-1">
                                  {item.rating.toFixed(1)} ({item.reviews} reviews)
                                </span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                            
                            {/* Price */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl font-bold text-red-500">
                                ₹{item.price}
                              </span>
                              {item.originalPrice && (
                                <>
                                  <span className="text-lg text-gray-400 line-through">
                                    ₹{item.originalPrice}
                                  </span>
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-medium">
                                    Save ₹{item.originalPrice - item.price}
                                  </span>
                                </>
                              )}
                              {item.discount > 0 && (
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-medium">
                                  {item.discount}% OFF
                                </span>
                              )}
                            </div>
                          </Link>
                          
                          {/* Action Buttons */}
                          <div className="mt-4 space-y-2">
                            <button
                              onClick={() => handleMoveToCart(item)}
                              disabled={!(item.stock_qty > 0)}
                              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                              <ShoppingBag size={16} />
                              {(item.stock_qty > 0) ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Heart size={20} className="text-red-500" />
                    Wishlist Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Total Items</span>
                      <span className="font-semibold text-gray-900 text-lg">{stats.totalItems}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Total Value</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        ₹{(stats.totalValue || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    {stats.potentialSavings > 0 && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">Potential Savings</span>
                        <span className="font-semibold text-green-600 text-lg">
                          ₹{(stats.potentialSavings || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">In Stock</span>
                      <span className="font-semibold text-green-600 text-lg">{stats.inStockItems}</span>
                    </div>
                  </div>

                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Heart size={16} className="text-blue-600" />
                      Wishlist Tips
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Save items you love for later purchase</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Track price changes and get sale notifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Share your wishlist with friends and family</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Quick access to your favorite items</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
