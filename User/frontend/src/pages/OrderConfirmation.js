import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Check, Package, Truck, CreditCard, Home } from "lucide-react";
import { IMAGE_BASE_URL, API_BASE_URL } from "../config/constants";
import { useCart } from "../contexts/CartContext";
import { withNetworkFallback } from "../utils/networkUtils";

const OrderConfirmation = () => {
  const location = useLocation();
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    // Get order data from location state passed from checkout
    if (location.state?.order) {
      setOrderData(location.state.order);
      fetchProductDetails(location.state.order.items);
    }
  }, [location.state?.order]); // More specific dependency

  // Separate effect for clearing cart to avoid state updates during render
  useEffect(() => {
    if (location.state?.order && orderData && !cartCleared) {
      // Clear cart after successful order and order data is set
      clearCart();
      setCartCleared(true); // Prevent multiple calls
    }
  }, [location.state?.order, orderData, clearCart, cartCleared]); // Added cartCleared dependency

  // Fetch product details for images
  const fetchProductDetails = async (items) => {
    const details = {};

    for (const item of items) {
      // Create fallback data immediately
      const fallbackData = {
        name: item.product?.name || item.name || `Product ${item.product}`,
        thumbnail: null,
        images: [],
        _id: item.product,
        price: item.unitPrice || 0,
      };

      // Use network fallback to avoid excessive retries when API is down
      const result = await withNetworkFallback(
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(
            `${API_BASE_URL}/products/${item.product}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const product = await response.json();
            return product.data || product;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        },
        fallbackData,
        `Fetch product ${item.product}`,
      );

      details[item.product] = result.data;

      if (result.fallback) {
        console.log(
          `Using fallback data for product ${item.product} - API unavailable`,
        );
      }
    }

    setProductDetails(details);
  };

  // Get product image
  const getProductImage = (item) => {
    const product = productDetails[item.product];
    if (!product) return null;

    // Try thumbnail first, then first image
    return (
      product.thumbnail ||
      (product.images && product.images.length > 0 ? product.images[0] : null)
    );
  };

  // If no order data, show loading or error
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  const orderNumber = orderData.orderNumber || orderData._id;
  const estimatedDelivery = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Use real order items from the order data
  const orderItems = orderData.items || [];
  const subtotal = orderData.pricing?.subtotal || 0;
  const shipping = orderData.pricing?.shipping || 0;
  const tax = orderData.pricing?.tax || 0;
  const total = orderData.pricing?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation cartCount={0} />

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. We've received it and are preparing it for
            shipment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-800">
                    {orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-800">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium text-gray-800">
                    {estimatedDelivery}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-800">Credit Card</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Items
              </h2>
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const productImage = getProductImage(item);
                  const product = productDetails[item.product];

                  return (
                    <div
                      key={item._id || index}
                      className="flex gap-4 pb-4 border-b last:border-0"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden text-gray-800">
                        {productImage ? (
                          <img
                            src={
                              productImage.startsWith("http")
                                ? productImage
                                : `${IMAGE_BASE_URL}${productImage}`
                            }
                            alt={product?.name || `Product ${index + 1}`}
                            className="w-full h-full object-cover text-gray-800"
                            onError={(e) => {
                              e.target.src = `${IMAGE_BASE_URL}/uploads/products/placeholder.jpg`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <Package size={24} className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {product?.name ||
                            item.product?.name ||
                            `Product ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {item.specifications?.size &&
                            `${item.specifications.size}, `}
                          {item.specifications?.paper &&
                            `${item.specifications.paper}, `}
                          {item.specifications?.finish &&
                            `${item.specifications.finish}`}
                          {!item.specifications?.size &&
                            !item.specifications?.paper &&
                            !item.specifications?.finish &&
                            "Standard specifications"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium text-gray-800">
                          ₹
                          {(
                            item.totalPrice || item.unitPrice * item.quantity
                          ).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{(item.unitPrice || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Shipping Address
              </h2>
              <div className="space-y-1 text-gray-600">
                <p className="font-medium text-gray-900">
                  {orderData.shippingAddress?.street &&
                    `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}`}
                </p>
                {orderData.shippingAddress?.city && (
                  <p>{orderData.shippingAddress.city}</p>
                )}
                {orderData.shippingAddress?.state &&
                  orderData.shippingAddress?.zipCode && (
                    <p>
                      {orderData.shippingAddress.state},{" "}
                      {orderData.shippingAddress.zipCode}
                    </p>
                  )}
                {orderData.shippingAddress?.country && (
                  <p>{orderData.shippingAddress.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    Total
                  </span>
                  <span className="text-lg font-bold text-red-500">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Order Confirmed</p>
                    <p className="text-sm text-gray-600">
                      Your order has been received
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Processing</p>
                    <p className="text-sm text-gray-600">
                      Your order is being prepared
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Shipped</p>
                    <p className="text-sm text-gray-400">
                      Your order will be shipped soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                What's Next?
              </h2>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer pointer-events-auto"
                  style={{ textDecoration: "none", display: "flex" }}
                  onClick={(e) => console.log("Continue Shopping clicked")}
                >
                  <Package size={20} />
                  Continue Shopping
                </Link>
                <Link
                  to="/profile"
                  className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer pointer-events-auto text-gray-700"
                  style={{ textDecoration: "none", display: "flex" }}
                  onClick={(e) => console.log("View Order History clicked")}
                >
                  <CreditCard size={20} />
                  View Order History
                </Link>
                <Link
                  to="/"
                  className="w-full text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 cursor-pointer pointer-events-auto"
                  style={{ textDecoration: "none", display: "flex" }}
                  onClick={(e) => console.log("Back to Home clicked")}
                >
                  <Home size={20} />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
