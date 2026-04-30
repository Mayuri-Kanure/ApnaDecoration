import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import BackButton from "../components/BackButton";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { IMAGE_BASE_URL } from "../config/constants";
import {
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  CreditCard,
  Truck,
  Shield,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();
  const { success, error: showError, warning: showWarning } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "https://user-api.apnadecoration.com/api";

  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/coupons/available`);
      if (response.data.success) {
        setAvailableCoupons(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(
      deliveryDate.getDate() + (shippingMethod === "express" ? 2 : 5),
    );
    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleRemoveItem = async (productId, color = null, size = null) => {
    setIsUpdating(true);
    try {
      const result = await removeFromCart(productId, color, size);
      if (result.success) {
        success("Item removed from cart");
      } else {
        showError(result.error || "Failed to remove item from cart");
      }
    } catch (err) {
      showError("Failed to remove item from cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityChange = async (
    productId,
    newQuantity,
    color = null,
    size = null,
    maxStock = 10,
  ) => {
    setIsUpdating(true);
    try {
      if (newQuantity > maxStock) {
        showWarning(`Only ${maxStock} items available in stock`);
        return;
      }

      if (newQuantity === 0) {
        const result = await removeFromCart(productId, color, size);
        if (result.success) {
          showWarning("Item removed from cart");
        } else {
          showError(result.error || "Failed to remove item from cart");
        }
      } else {
        const result = await updateQuantity(
          productId,
          newQuantity,
          color,
          size,
        );
        if (result.success) {
          success("Cart updated successfully");
        } else {
          showError(result.error || "Failed to update cart");
        }
      }
    } catch (err) {
      showError("Failed to update cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      showWarning("Please enter a coupon code");
      return;
    }
    const orderAmount = getTotalPrice();
    if (!orderAmount || orderAmount <= 0) {
      showWarning("Cart is empty");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/coupons/validate`, {
        code: promoCode.toUpperCase(),
        orderAmount: orderAmount,
      });
      if (response.data.success) {
        setPromoApplied(true);
        setAppliedCoupon(response.data.data);
        success(
          `Coupon applied! You saved ₹${response.data.data.discount.toFixed(2)}`,
        );
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid coupon code";
      showWarning(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setPromoCode("");
    setPromoApplied(false);
    setAppliedCoupon(null);
    success("Coupon removed");
  };

  const handleApplyCoupon = async (coupon) => {
    setPromoCode(coupon.code);
    setShowCoupons(false);
    const orderAmount = getTotalPrice();
    if (!orderAmount || orderAmount <= 0) {
      showWarning("Cart is empty");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/coupons/validate`, {
        code: coupon.code,
        orderAmount: orderAmount,
      });
      if (response.data.success) {
        setPromoApplied(true);
        setAppliedCoupon(response.data.data);
        success(
          `Coupon applied! You saved ₹${response.data.data.discount.toFixed(2)}`,
        );
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid coupon code";
      showWarning(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        const result = await clearCart();
        if (result.success) {
          setPromoCode("");
          setPromoApplied(false);
          success("Cart cleared successfully");
        } else {
          showError(result.error || "Failed to clear cart");
        }
      } catch (err) {
        showError("Failed to clear cart");
      }
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showError("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  const subtotal = getTotalPrice() || 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const shipping = shippingMethod === "express" ? 25 : 10;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 md:p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Shopping Cart
                </h1>
                <p className="text-sm md:text-base text-white/90">
                  Review your items and proceed to secure checkout
                </p>
              </div>
              <div className="p-6 md:p-8 text-center">
                <EmptyState type="cart" className="py-8 md:py-12" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Shopping Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 last:border-0 py-3 md:py-4"
                >
                  <div className="flex gap-3 items-start">
                    {/* Product Image - Responsive Size */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.thumbnail || item.image ? (
                        <img
                          src={
                            item.thumbnail?.startsWith("http")
                              ? item.thumbnail
                              : item.image?.startsWith("http")
                                ? item.image
                                : `${IMAGE_BASE_URL}${item.thumbnail || item.image}`
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details - Responsive Font */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold truncate text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        ₹{item.price}
                      </p>
                      {item.category && (
                        <p className="text-xs text-gray-500 capitalize">
                          {item.category}
                        </p>
                      )}
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex flex-col items-end gap-2 text-gray-700">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              (item.quantity || 1) - 1,
                            )
                          }
                          className="w-6 h-6 sm:w-7 sm:h-7 border rounded flex items-center justify-center"
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-sm">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              (item.quantity || 1) + 1,
                            )
                          }
                          className="w-6 h-6 sm:w-7 sm:h-7 border rounded flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 text-xs"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button visible on mobile too */}
              <button
                onClick={handleClearCart}
                className="mt-3 text-xs sm:text-sm text-gray-500 hover:text-red-500"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm h-fit lg:sticky lg:top-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between text-gray-900">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-900">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4 font-bold flex justify-between text-base md:text-lg text-gray-900">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-5 bg-green-600 text-white py-3 rounded-lg"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
