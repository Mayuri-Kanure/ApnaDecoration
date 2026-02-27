import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import MobileBackButton from '../components/MobileBackButton';
import BackButton from '../components/BackButton';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { IMAGE_BASE_URL } from '../config/constants';
import { Trash2, Plus, Minus, ChevronRight, CreditCard, Truck, Shield, ShoppingBag, ArrowLeft, CheckCircle, Sparkles, Tag, X } from 'lucide-react';
import axios from 'axios';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { success, error: showError, warning: showWarning } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://user-api.apnadecoration.com/api';

  // Fetch available coupons
  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/coupons/available`);
      if (response.data.success) {
        setAvailableCoupons(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (shippingMethod === 'express' ? 2 : 5));
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleRemoveItem = async (productId, color = null, size = null) => {
    setIsUpdating(true);
    try {
      console.log('Removing item:', productId, color, size);
      const result = await removeFromCart(productId, color, size);
      console.log('Remove result:', result);
      if (result.success) {
        success('Item removed from cart');
      } else {
        showError(result.error || 'Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Remove error:', err);
      showError('Failed to remove item from cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity, color = null, size = null, maxStock = 10) => {
    setIsUpdating(true);
    try {
      console.log('Changing quantity:', productId, newQuantity, color, size);
      
      // Stock validation
      if (newQuantity > maxStock) {
        showWarning(`Only ${maxStock} items available in stock`);
        return;
      }
      
      if (newQuantity === 0) {
        const result = await removeFromCart(productId, color, size);
        console.log('Remove result:', result);
        if (result.success) {
          showWarning('Item removed from cart');
        } else {
          showError(result.error || 'Failed to remove item from cart');
        }
      } else {
        const result = await updateQuantity(productId, newQuantity, color, size);
        console.log('Update result:', result);
        if (result.success) {
          success('Cart updated successfully');
        } else {
          showError(result.error || 'Failed to update cart');
        }
      }
    } catch (err) {
      console.error('Quantity change error:', err);
      showError('Failed to update cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      showWarning('Please enter a coupon code');
      return;
    }

    const orderAmount = getTotalPrice();
    if (!orderAmount || orderAmount <= 0) {
      showWarning('Cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Validating coupon:', { code: promoCode, orderAmount });
      const response = await axios.post(`${API_BASE_URL}/coupons/validate`, {
        code: promoCode.toUpperCase(),
        orderAmount: orderAmount
      });
      
      if (response.data.success) {
        setPromoApplied(true);
        setAppliedCoupon(response.data.data);
        success(`Coupon applied! You saved ₹${response.data.data.discount.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Coupon validation error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Invalid coupon code';
      showWarning(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setPromoCode('');
    setPromoApplied(false);
    setAppliedCoupon(null);
    success('Coupon removed');
  };

  const handleApplyCoupon = async (coupon) => {
    setPromoCode(coupon.code);
    setShowCoupons(false);
    
    const orderAmount = getTotalPrice();
    if (!orderAmount || orderAmount <= 0) {
      showWarning('Cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Applying coupon:', { code: coupon.code, orderAmount });
      const response = await axios.post(`${API_BASE_URL}/coupons/validate`, {
        code: coupon.code,
        orderAmount: orderAmount
      });
      
      if (response.data.success) {
        setPromoApplied(true);
        setAppliedCoupon(response.data.data);
        success(`Coupon applied! You saved ₹${response.data.data.discount.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Coupon apply error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Invalid coupon code';
      showWarning(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        const result = await clearCart();
        if (result.success) {
          setPromoCode('');
          setPromoApplied(false);
          success('Cart cleared successfully');
        } else {
          showError(result.error || 'Failed to clear cart');
        }
      } catch (err) {
        showError('Failed to clear cart');
      }
    }
  };

  const subtotal = getTotalPrice() || 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const shipping = shippingMethod === 'express' ? 25 : 10;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Shopping Cart</h1>
                <p className="text-white/90">Review your items and proceed to secure checkout</p>
              </div>
              
              <div className="p-8">
                <EmptyState 
                  type="cart"
                  className="py-12"
                />
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" role="main">
      <Navigation />
      <MobileBackButton />

      <div className="container mx-auto px-4 py-8">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BackButton to="/products text-gray-600" label="Continue Shopping" />
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" aria-hidden="true" tabIndex="-1"></div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium" aria-label={`Cart contains ${cartItems.length} items`}>
              {cartItems.length} items
            </span>
          </div>
          <p className="text-gray-600">Review your items and proceed to secure checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Professional Design */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <ShoppingBag size={24} aria-hidden="true" tabIndex="-1" />
                    Cart Items
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm backdrop-blur-sm" aria-label={`${cartItems.length} products in cart`}>
                      {cartItems.length} products
                    </span>
                    <button
                      onClick={handleClearCart}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                      aria-label="Clear entire cart"
                    >
                      <Trash2 size={14} />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100" role="list">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.selectedColor || 'default'}-${item.selectedSize || 'default'}-${index}`} className="p-6 hover:bg-gray-50 transition-colors group" role="listitem">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="relative">
                        <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden" aria-hidden="true" tabIndex="-1">
                          {item.thumbnail || item.images?.[0] ? (
                            <>
                              <img 
                                src={
                                  (item.thumbnail || item.images[0]).startsWith('http') 
                                    ? (item.thumbnail || item.images[0])
                                    : `${IMAGE_BASE_URL}${item.thumbnail || item.images[0]}`
                                } 
                                alt={item.name || item.product_name_en || 'Product'}
                                className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.src = `${IMAGE_BASE_URL}/uploads/products/placeholder.jpg`;
                                }}
                              />
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <ShoppingBag size={20} className="text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{item.category || 'Product'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {item.discount && item.discount > 0 && item.discount < 100 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold" aria-label={`${item.discount}% discount`}>
                            -{item.discount}%
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3 flex-col sm:flex-row sm:items-start">
                          <div className="mb-3 sm:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name || item.product_name_en || 'Product'}</h3>
                            <div className="flex gap-2 mb-2">
                              {item.category?.name && (
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                                  {item.category.name}
                                </span>
                              )}
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                item.stock > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.stock > 0 ? 'In Stock' : 'Made to Order'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description || item.description_en || 'No description available'}</p>
                            <p className="text-xs text-gray-500 font-medium">SKU: {item.sku || 'N/A'}</p>
                            {item.specifications && typeof item.specifications === 'object' && (
                              <div className="mt-2 space-y-1">
                                {Object.entries(item.specifications).slice(0, 2).map(([key, value]) => (
                                  <p key={`${key}-${value}`} className="text-xs text-gray-500">
                                    <span className="font-medium capitalize">{key}:</span> {value}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.selectedColor, item.selectedSize)}
                            disabled={isUpdating}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mx-auto sm:mx-0"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-end flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-gray-700 sr-only">
                              Quantity for {item.name}
                            </label>
                            <div className="flex items-center border border-gray-200 rounded-lg flex-1 sm:flex-initial">
                              <button
                                id={`quantity-decrease-${item.id}`}
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                id={`quantity-${item.id}`}
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.selectedColor, item.selectedSize)}
                                className="w-16 text-gray-600 hover:bg-gray-100 text-center border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                min="1"
                                aria-label={`Quantity for ${item.name}`}
                              />
                              <button
                                id={`quantity-increase-${item.id}`}
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                                disabled={isUpdating}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            {isUpdating && (
                              <div className="ml-3">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              </div>
                            )}
                          </div>

                          {/* Price Display */}
                          <div className="text-right">
                            {item.originalPrice && item.originalPrice > (item.price || item.unit_price || 0) && (
                              <p className="text-sm text-gray-500 line-through mb-1">₹{(item.originalPrice || 0).toFixed(2)}</p>
                            )}
                            <p className="text-xl font-bold text-gray-900">₹{(item.price || item.unit_price || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-1">₹{((item.price || item.unit_price || 0) * item.quantity).toFixed(2)} total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary - Professional Design */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CreditCard size={24} />
                  Order Summary
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{(subtotal || 0).toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">Discount (10%)</span>
                      <span className="font-semibold text-green-600">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">₹{(shipping || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold text-gray-900">₹{(tax || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        ₹{(total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="promo-code" className="block text-sm font-semibold text-gray-700">Coupon Code</label>
                    <button
                      onClick={() => {
                        setShowCoupons(!showCoupons);
                        if (!showCoupons && availableCoupons.length === 0) {
                          fetchAvailableCoupons();
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Tag size={14} />
                      {showCoupons ? 'Hide' : 'View'} Available Coupons
                    </button>
                  </div>

                  {/* Available Coupons List */}
                  {showCoupons && (
                    <div className="mb-3 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
                      {loadingCoupons ? (
                        <div className="text-center py-4">
                          <LoadingSpinner size="small" text="Loading coupons..." />
                        </div>
                      ) : availableCoupons.length > 0 ? (
                        <div className="space-y-2">
                          {availableCoupons.map((coupon) => (
                            <div
                              key={coupon._id}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 transition-colors cursor-pointer"
                              onClick={() => handleApplyCoupon(coupon)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-blue-600 text-sm">{coupon.code}</span>
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                      {coupon.discountType === 'percentage' 
                                        ? `${coupon.discountAmount}% OFF` 
                                        : `₹${coupon.discountAmount} OFF`}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">{coupon.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Min: ₹{coupon.minPurchase}
                                    {coupon.maxDiscount && ` • Max: ₹${coupon.maxDiscount}`}
                                  </p>
                                </div>
                                <button
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyCoupon(coupon);
                                  }}
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-gray-500 py-4">No coupons available</p>
                      )}
                    </div>
                  )}

                  {!promoApplied ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="promo-code"
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-describedby="promo-help"
                      />
                      <button
                        onClick={handlePromoCode}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Apply coupon code"
                      >
                        {isLoading ? (
                          <LoadingSpinner size="small" text="" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">{promoCode}</p>
                          <p className="text-xs text-green-600">You saved ₹{discount.toFixed(2)}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove coupon"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Shipping Method */}
                <div>
                  <fieldset className="space-y-2">
                    <legend className="block text-sm font-semibold text-gray-700 mb-2">Shipping Method</legend>
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-describedby="standard-shipping-desc"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">Standard</span>
                        <span id="standard-shipping-desc" className="text-sm text-gray-500 ml-2">(5-7 days)</span>
                      </div>
                      <span className="font-semibold text-gray-900" aria-label="Standard shipping costs ₹10">₹10</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-describedby="express-shipping-desc"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">Express</span>
                        <span id="express-shipping-desc" className="text-sm text-gray-500 ml-2">(2-3 days)</span>
                      </div>
                      <span className="font-semibold text-gray-900" aria-label="Express shipping costs ₹25">₹25</span>
                    </label>
                  </fieldset>
                </div>

                {/* Trust Badges */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <Shield size={20} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">Secure SSL Checkout</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <Truck size={20} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Free Returns</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <CreditCard size={20} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Multiple Payment Options</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Proceed to secure checkout with your cart items"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ChevronRight size={20} aria-hidden="true" tabIndex="-1" />
                </Link>

                <div className="text-center">
                  <Link
                    to="/products"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                    aria-label="Continue shopping for more products"
                  >
                    <ArrowLeft size={16} aria-hidden="true" tabIndex="-1" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
