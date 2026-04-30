import React, { useState, useContext, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import Navigation from "../components/Navigation";

import Footer from "../components/Footer";

import { API_BASE_URL } from "../config/constants";

import {
  CreditCard,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Tag,
  X,
} from "lucide-react";

import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";

import { IMAGE_BASE_URL } from "../config/constants";

import couponService from "../services/couponService";
import paymentService from "../services/paymentService";

const Checkout = () => {
  const navigate = useNavigate();

  const { cartItems, getTotalPrice } = useCart();
  const { success: showSuccess, error: showError } = useToast();

  const [step, setStep] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState("online");

  const [isProcessing, setIsProcessing] = useState(false);

  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const [eventInfo, setEventInfo] = useState({
    eventType: "",
    eventDate: "",
    eventTime: "",
    venueType: "home",
    venueAddress: "",
    guestCount: "",
    specialInstructions: "",
    setupRequired: false,
    setupTimeSlot: "",
    customEventType: "",
  });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    ...shippingInfo,
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    nameOnCard: "",
  });

  const [validatingStock, setValidatingStock] = useState(false);

  // 🔄 CRITICAL: Fetch latest stock from backend before checkout
  const fetchLatestStock = async () => {
    setValidatingStock(true);
    try {
      const token = localStorage.getItem("token");
      const stockValidations = [];

      for (const item of cartItems) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/products/${item.productId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const productData = await response.json();
          const currentStock = productData.data?.stock || 0;

          stockValidations.push({
            productId: item.productId,
            name: item.name,
            cartQty: item.quantity,
            currentStock: currentStock,
            isValid: currentStock >= item.quantity,
          });
        } catch (err) {
          console.error(`Failed to fetch stock for ${item.name}:`, err);
          // Default to invalid if we can't fetch
          stockValidations.push({
            productId: item.productId,
            name: item.name,
            cartQty: item.quantity,
            currentStock: 0,
            isValid: false,
          });
        }
      }

      // Check for invalid items
      const invalidItems = stockValidations.filter((item) => !item.isValid);
      if (invalidItems.length > 0) {
        const itemList = invalidItems
          .map(
            (item) =>
              `"${item.name}" (Available: ${item.currentStock}, Requested: ${item.cartQty})`,
          )
          .join(", ");
        throw new Error(`Stock has changed. Please refresh cart: ${itemList}`);
      }

      console.log("✅ All items stock verified before checkout");
      return true;
    } catch (err) {
      console.error("❌ Stock validation failed:", err.message);
      showError(err.message);
      throw err;
    } finally {
      setValidatingStock(false);
    }
  };

  // Use real cart data from CartContext
  const subtotal = getTotalPrice();
  const shipping = 0;
  const tax = subtotal * 0.18; // 18% GST for India
  const setupCharges = eventInfo.setupRequired ? 500 : 0; // Already in INR
  const total = subtotal + shipping + tax + setupCharges - couponDiscount;

  const handleEventSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  // Coupon functions
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const result = await couponService.applyCoupon(
        couponCode,
        subtotal + tax + setupCharges,
      );

      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        setCouponDiscount(result.data.discountAmount);
        alert(
          `Coupon applied! You saved ₹${result.data.discountAmount.toFixed(2)}`,
        );
      } else {
        alert(result.message || "Invalid coupon code");
      }
    } catch (error) {
      alert("Failed to apply coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  // Create order for payment (card payment method)
  const openRazorpayDirectly = async (order) => {
    try {
      console.log("🚀 Opening Razorpay directly for order:", order._id);
      console.log("📝 Order details:", {
        orderId: order._id,
        total,
        userId: order.user, // ✅ FIX: Use order.user instead of order.userId
      });

      // Create Razorpay order
      const response = await paymentService.createRazorpayOrder(
        order._id,
        total, // Send total as-is (backend will convert to paise)
      );

      const razorpayOrder = response; // ✅ FIX: api.js now returns data directly
      console.log("✅ Razorpay order created:", razorpayOrder);

      // Prepare Razorpay options
      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: "APNA DECORATION",
        description: `Payment for Order #${order._id}`,
        order_id: razorpayOrder.order.id,
        prefill: {
          name: order.customerName || order.userId?.name || "Customer",
          email: order.customerEmail || order.userId?.email || "",
          contact: order.customerPhone || order.userId?.phone || "",
        },
        theme: {
          color: "#2F66FF",
        },
        modal: {
          ondismiss: function () {
            console.log("🔍 User closed Razorpay popup");
            setIsProcessing(false); // ⭐ reset button state
            setPaymentCancelled(true);
            alert(
              "Payment cancelled. You can retry payment using the button below.",
            );
          },
          backdropclose: false,
          escape: true,
          handleback: true,
        },
        handler: async function (response) {
          console.log("✅ Razorpay payment successful:", response);
          try {
            // Verify payment with backend
            const verification = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            console.log("✅ Payment verified:", verification);
            handlePaymentSuccess(verification);
          } catch (error) {
            console.error("❌ Payment verification failed:", error);
            handlePaymentError(error);
          }
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      // Initialize and open Razorpay
      const razorpay = await paymentService.initializeRazorpay(options);
      console.log("🔍 Razorpay instance:", razorpay);
      console.log("🔍 Razorpay type:", typeof razorpay);
      console.log("🔍 Razorpay.open type:", typeof razorpay.open);

      if (razorpay && typeof razorpay.open === "function") {
        // Add payment failure handler
        razorpay.on("payment.failed", function (response) {
          console.log("❌ Payment failed:", response);
          setIsProcessing(false);
          alert("Payment failed. Please try again.");
        });

        razorpay.open();
      } else {
        throw new Error("Razorpay instance is not valid");
      }
    } catch (error) {
      console.error("❌ Error opening Razorpay directly:", error);
      alert(error.message || "Failed to open payment gateway");
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentResult) => {
    console.log("✅ Payment successful:", paymentResult);
    setPaymentCompleted(true);
    // Navigate to order confirmation instead of review step
    navigate("/order-confirmation", {
      state: {
        order: createdOrder,
        orderNumber: createdOrder?.orderNumber,
        paymentResult: paymentResult,
      },
    });
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    console.error("❌ Payment error:", error);
    alert(error.message || "Payment failed. Please try again.");
  };

  // Handle payment cancel
  const handlePaymentCancel = () => {
    console.log("🔍 Payment cancelled by user");
    // Optionally reset order state
    setCreatedOrder(null);
  };

  const handleCreateOrderForPayment = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to place an order");
      }

      // 🔄 CRITICAL: Fetch latest stock before Razorpay order creation
      console.log("🔄 Refreshing stock from server before Razorpay...");
      await fetchLatestStock();
      console.log("✅ Stock validation passed - creating Razorpay order");

      // Prepare order data based on existing successful order structure
      const user = JSON.parse(localStorage.getItem("user"));

      console.log(" Creating order with calculations:", {
        subtotal,
        tax,
        shipping,
        total,
        couponDiscount,
        cartItems: cartItems.length,
      });

      // ✅ VALIDATE STOCK AVAILABILITY BEFORE ORDER SUBMISSION
      console.log("🔍 Starting stock validation for Razorpay order...");
      const outOfStockItems = [];

      for (const item of cartItems) {
        // Try to get stock from item
        let stock = item.stock;

        // If stock info is not available, we should fetch it
        if (stock === undefined || stock === null) {
          console.warn(
            `⚠️ Stock info missing for "${item.name}", attempting to fetch...`,
          );
          try {
            // Fetch product details from backend to get stock info
            const response = await fetch(
              `${API_BASE_URL}/products/${item.productId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (response.ok) {
              const productData = await response.json();
              stock = productData.data?.stock || 0;
              console.log(`✅ Fetched stock for "${item.name}": ${stock}`);
            } else {
              console.warn(
                `❌ Could not fetch stock for "${item.name}", assuming insufficient`,
              );
              stock = 0;
            }
          } catch (err) {
            console.warn(
              `❌ Error fetching stock for "${item.name}":`,
              err.message,
            );
            stock = 0;
          }
        }

        // Check if sufficient stock is available
        if (stock < item.quantity) {
          outOfStockItems.push({
            name: item.name,
            requested: item.quantity,
            available: stock,
          });
          console.error(
            `❌ Insufficient stock for "${item.name}". Available: ${stock}, Requested: ${item.quantity}`,
          );
        } else {
          console.log(
            `✅ Stock OK for "${item.name}": ${stock} available (need ${item.quantity})`,
          );
        }
      }

      // If any items are out of stock, throw error with details
      if (outOfStockItems.length > 0) {
        setIsProcessing(false);
        const itemsList = outOfStockItems
          .map(
            (item) =>
              `"${item.name}" (Available: ${item.available}, Requested: ${item.requested})`,
          )
          .join(", ");
        throw new Error(
          `Insufficient stock for the following items: ${itemsList}. Please remove these items from cart and try again.`,
        );
      }
      console.log("✅ All items passed stock validation");

      // Enhanced order structure to match API requirements
      const orderData = {
        user: user?._id || user?.id,
        userId: user?._id || user?.id,
        type: "product",
        status: "pending",
        items: cartItems.map((item) => {
          console.log(" Processing cart item:", {
            _id: item._id,
            productId: item.productId,
            price: item.price,
            quantity: item.quantity,
          });
          return {
            product: item._id || item.productId, // Handle both cases
            productModel: "VendorProduct",
            quantity: item.quantity || 1,
            unitPrice: Number(item.price) || 0,
            totalPrice: Number(item.price * (item.quantity || 1)) || 0,
            name: item.name,
            thumbnail: item.thumbnail || item.image,
          };
        }),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.pincode,
          country: shippingInfo.country || "India",
        },
        billingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.pincode,
          country: shippingInfo.country || "India",
        },
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        pricing: {
          subtotal: Number(subtotal) || 0,
          tax: Number(tax) || 0,
          shipping: Number(shipping) || 0,
          total: Number(total) || 0,
          discount: Number(couponDiscount) || 0,
        },
      };

      console.log(" Final order data:", JSON.stringify(orderData, null, 2));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error ||
          (result.errors && result.errors.length > 0
            ? result.errors[0].msg || result.errors[0].message || result.message
            : result.message) ||
          "Failed to create order. Please try again.";

        throw new Error(errorMessage);
      }

      const order = result.data || result;

      if (!order || !order._id) {
        throw new Error("Invalid order response from server");
      }

      setCreatedOrder(order);

      // Show success message before payment
      showSuccess("Order created. Opening payment...");

      // Directly open Razorpay after order creation
      setTimeout(() => {
        openRazorpayDirectly(order);
      }, 1000);
    } catch (error) {
      console.error("Error creating order:", error.message);
      showError(error.message || "Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to place an order");
      }

      // 🔄 CRITICAL: Fetch latest stock before proceeding with COD
      console.log("🔄 Refreshing stock from server before COD checkout...");
      await fetchLatestStock();
      console.log("✅ Stock validation passed - proceeding with order");
      const outOfStockItems = [];

      for (const item of cartItems) {
        // Try to get stock from item
        let stock = item.stock;

        // If stock info is not available, we should fetch it
        if (stock === undefined || stock === null) {
          console.warn(
            `⚠️ Stock info missing for "${item.name}", attempting to fetch...`,
          );
          try {
            // Fetch product details from backend to get stock info
            const response = await fetch(
              `${API_BASE_URL}/products/${item.productId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (response.ok) {
              const productData = await response.json();
              stock = productData.data?.stock || 0;
              console.log(`✅ Fetched stock for "${item.name}": ${stock}`);
            } else {
              console.warn(
                `❌ Could not fetch stock for "${item.name}", assuming insufficient`,
              );
              stock = 0;
            }
          } catch (err) {
            console.warn(
              `❌ Error fetching stock for "${item.name}":`,
              err.message,
            );
            stock = 0;
          }
        }

        // Check if sufficient stock is available
        if (stock < item.quantity) {
          outOfStockItems.push({
            name: item.name,
            requested: item.quantity,
            available: stock,
          });
          console.error(
            `❌ Insufficient stock for "${item.name}". Available: ${stock}, Requested: ${item.quantity}`,
          );
        } else {
          console.log(
            `✅ Stock OK for "${item.name}": ${stock} available (need ${item.quantity})`,
          );
        }
      }

      // If any items are out of stock, throw error with details
      if (outOfStockItems.length > 0) {
        setIsProcessing(false);
        const itemsList = outOfStockItems
          .map(
            (item) =>
              `"${item.name}" (Available: ${item.available}, Requested: ${item.requested})`,
          )
          .join(", ");
        throw new Error(
          `Insufficient stock for the following items: ${itemsList}. Please remove these items from cart and try again.`,
        );
      }
      console.log("✅ All items passed stock validation");

      // Calculate totals
      const subtotal = getTotalPrice();
      const tax = subtotal * 0.18; // 18% GST
      const shipping = subtotal > 5000 ? 0 : 200; // Free shipping above 5000
      const total = subtotal + tax + shipping;

      console.log("💰 Calculated totals:", { subtotal, tax, shipping, total });

      // Prepare shipping address
      const shippingAddress = {
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.pincode,
        country: shippingInfo.country,
      };

      // Prepare order data using real cart items (matching backend requirements)
      console.log("🛒 Raw cart items:", cartItems);
      const orderData = {
        items: cartItems.map((item) => {
          console.log("🔍 Processing item:", item);
          console.log("🆔 productId:", item.productId);
          console.log("💰 price:", item.price);
          console.log("📊 quantity:", item.quantity);
          return {
            product: item.productId, // ✅ Schema expects 'product'
            productModel: "Product", // ✅ Required field
            quantity: item.quantity,
            unitPrice: Number(item.price) || 0, // ✅ Schema expects this
            totalPrice: Number(item.price * item.quantity) || 0, // ✅ Schema expects this
          };
        }),
        // Force cache bust
        timestamp: Date.now(),
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        pricing: {
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          total: total,
        },
        eventInfo: eventInfo,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      };
      console.log(
        "📋 Final order data being sent:",
        JSON.stringify(orderData, null, 2),
      );
      // Create order via API
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      console.log("❌ ORDER API STATUS:", response.status);
      console.log("❌ ORDER API ERROR BODY:", result);
      if (!response.ok) {
        throw new Error(JSON.stringify(result));
      }
      // Clear cart after successful order
      // Navigate to order confirmation with order data

      navigate("/order-confirmation", {
        state: {
          order: result.data,
          orderNumber: result.data.orderNumber,
        },
      });
    } catch (error) {
      console.error("Order creation error:", error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation cartCount={cartItems.length} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/cart"
            className="text-gray-600 hover:text-red-500 flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Back to Cart
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step > 1 ? <Check size={16} /> : "1"}
                </div>
                <span className="ml-2 font-medium text-gray-900 text-sm sm:text-base">
                  Event Details
                </span>
              </div>
              <div className="hidden sm:block flex-1 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step > 2 ? <Check size={16} /> : "2"}
                </div>
                <span className="ml-2 font-medium text-gray-900 text-sm sm:text-base">
                  Shipping
                </span>
              </div>
              <div className="hidden sm:block flex-1 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 3
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step > 3 ? <Check size={16} /> : "3"}
                </div>
                <span className="ml-2 font-medium text-gray-900 text-sm sm:text-base">
                  Payment
                </span>
              </div>
              <div className="hidden sm:block flex-1 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 4
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  4
                </div>
                <span className="ml-2 font-medium text-gray-900 text-sm sm:text-base">
                  Review
                </span>
              </div>
            </div>

            {/* Step 1: Event Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    Event Details
                  </h2>

                  <p className="text-gray-600">
                    Tell us about your special event to provide the best
                    decoration service
                  </p>
                </div>

                <form onSubmit={handleEventSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Star className="inline w-4 h-4 mr-1" />
                        Event Type *
                      </label>

                      <select
                        required
                        value={eventInfo.eventType}
                        onChange={(e) =>
                          setEventInfo({
                            ...eventInfo,
                            eventType: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-500">
                          Select event type
                        </option>

                        <option value="birthday" className="text-gray-900">
                          Birthday Party
                        </option>

                        <option value="anniversary" className="text-gray-900">
                          Anniversary
                        </option>

                        <option value="proposal" className="text-gray-900">
                          Proposal
                        </option>

                        <option value="wedding" className="text-gray-900">
                          Wedding
                        </option>

                        <option value="baby-shower" className="text-gray-900">
                          Baby Shower
                        </option>

                        <option value="corporate" className="text-gray-900">
                          Corporate Event
                        </option>

                        <option value="festival" className="text-gray-900">
                          Festival Celebration
                        </option>

                        <option value="other" className="text-gray-900">
                          Other
                        </option>
                      </select>
                    </div>

                    {eventInfo.eventType === "other" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Please specify event type *
                        </label>
                        <input
                          type="text"
                          required
                          value={eventInfo.customEventType || ""}
                          onChange={(e) =>
                            setEventInfo({
                              ...eventInfo,
                              customEventType: e.target.value,
                            })
                          }
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-900 bg-white"
                          placeholder="Enter your custom event type"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Event Date *
                      </label>

                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={eventInfo.eventDate}
                        onChange={(e) =>
                          setEventInfo({
                            ...eventInfo,
                            eventDate: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Event Time *
                      </label>

                      <input
                        type="time"
                        required
                        value={eventInfo.eventTime}
                        onChange={(e) =>
                          setEventInfo({
                            ...eventInfo,
                            eventTime: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Venue Type *
                    </label>

                    <div
                      className="grid grid-cols-2 md:grid-cols-4 gap-3 text-gray-600"
                      style={{ overflow: "visible" }}
                    >
                      {["home", "banquet", "outdoor", "office"].map((venue) => (
                        <label key={venue} className="relative">
                          <input
                            type="radio"
                            name="venueType"
                            value={venue}
                            checked={eventInfo.venueType === venue}
                            onChange={(e) =>
                              setEventInfo({
                                ...eventInfo,
                                venueType: e.target.value,
                              })
                            }
                            className="sr-only peer"
                            required
                          />

                          <div
                            className="border-2 rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50 flex flex-col items-center justify-center h-[90px] sm:h-[110px]"
                            style={{
                              overflow: "visible",
                              width: "100%",
                            }}
                          >
                            <MapPin className="w-5 h-5 mx-auto mb-3 flex-shrink-0" />

                            <span className="text-xs sm:text-sm font-medium capitalize whitespace-nowrap">
                              {venue}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Address *
                    </label>

                    <textarea
                      required
                      rows={3}
                      value={eventInfo.venueAddress}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          venueAddress: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-900"
                      placeholder="Complete venue address for decoration setup"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventInfo.setupRequired}
                        onChange={(e) =>
                          setEventInfo({
                            ...eventInfo,
                            setupRequired: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />

                      <span className="font-medium text-gray-600">
                        Professional Setup Service (+₹500)
                      </span>
                    </label>

                    <p className="text-sm text-gray-600 mt-1 ml-7">
                      Our team will arrive 2 hours before your event to set up
                      decorations
                    </p>
                  </div>

                  {eventInfo.setupRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Setup Time Slot
                      </label>

                      <select
                        value={eventInfo.setupTimeSlot}
                        onChange={(e) =>
                          setEventInfo({
                            ...eventInfo,
                            setupTimeSlot: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-500">
                          Select time slot
                        </option>

                        <option value="6am-8am" className="text-gray-900">
                          6:00 AM - 8:00 AM
                        </option>

                        <option value="8am-10am" className="text-gray-900">
                          8:00 AM - 10:00 AM
                        </option>

                        <option value="10am-12pm" className="text-gray-900">
                          10:00 AM - 12:00 PM
                        </option>

                        <option value="2pm-4pm" className="text-gray-900">
                          2:00 PM - 4:00 PM
                        </option>

                        <option value="4pm-6pm" className="text-gray-900">
                          4:00 PM - 6:00 PM
                        </option>

                        <option value="6pm-8pm" className="text-gray-900">
                          6:00 PM - 8:00 PM
                        </option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>

                    <textarea
                      rows={3}
                      value={eventInfo.specialInstructions}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          specialInstructions: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-900"
                      placeholder="Any specific requirements, themes, or preferences for your decoration"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/cart")}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={16} />
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Continue to Shipping Details
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Shipping Information */}
            {step === 2 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Shipping Information
                </h2>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>

                      <input
                        type="text"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>

                      <input
                        type="text"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>

                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>

                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            phone: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>

                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          address: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>

                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            city: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>

                      <input
                        type="text"
                        required
                        value={shippingInfo.state}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            state: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>

                      <input
                        type="text"
                        required
                        value={shippingInfo.pincode}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            pincode: e.target.value,
                          })
                        }
                        className="w-full min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 text-gray-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={16} />
                      Back to Event Details
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Payment Information */}
            {step === 3 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Payment Information
                </h2>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-gray-800">
                    Select Payment Method
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-gray-600">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />

                      <CreditCard size={20} />

                      <span>Online Payment (Razorpay)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-gray-600">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />

                      <Truck size={20} />

                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === "online" && (
                  <div className="space-y-4">
                    {/* First create order, then show payment gateway */}
                    {!createdOrder ? (
                      <div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-blue-900 mb-2">
                            Secure Online Payment
                          </h4>

                          <p className="text-sm text-blue-700">
                            Pay via Credit Card, Debit Card, UPI, Net Banking,
                            Wallets & more through Razorpay's secure payment
                            gateway
                          </p>
                        </div>

                        <button
                          onClick={handleCreateOrderForPayment}
                          disabled={isProcessing}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isProcessing
                            ? "Opening Payment..."
                            : `Pay ₹${total.toFixed(2)} with Razorpay`}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-green-900 mb-2">
                            Order Created
                          </h4>

                          <p className="text-sm text-green-700">
                            Order #{createdOrder._id?.slice(-8)} created
                            successfully. Please complete payment below.
                          </p>
                        </div>
                        {createdOrder && !paymentCompleted && (
                          <div className="space-y-3">
                            <button
                              onClick={() => openRazorpayDirectly(createdOrder)}
                              disabled={isProcessing}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {isProcessing
                                ? "Processing..."
                                : `Pay ₹${total.toFixed(2)} with Razorpay`}
                            </button>

                            <button
                              onClick={() => openRazorpayDirectly(createdOrder)}
                              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            >
                              Retry Payment
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Cash on Delivery
                      </h4>

                      <p className="text-sm text-yellow-700">
                        Pay when you receive your order. Additional charges may
                        apply for COD orders.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={16} />
                        Back to Shipping
                      </button>
                      <button
                        onClick={handlePaymentSubmit}
                        disabled={isProcessing}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing
                          ? "Processing..."
                          : `Place Order (₹${total.toFixed(2)})`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Order Review */}
            {step === 4 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Order Review</h2>

                {/* Event Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Event Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {eventInfo.eventType}
                    </div>

                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {eventInfo.eventDate}
                    </div>

                    <div>
                      <span className="font-medium">Time:</span>{" "}
                      {eventInfo.eventTime}
                    </div>

                    <div>
                      <span className="font-medium">Guests:</span>{" "}
                      {eventInfo.guestCount}
                    </div>

                    <div>
                      <span className="font-medium">Venue:</span>{" "}
                      {eventInfo.venueType}
                    </div>

                    <div>
                      <span className="font-medium">Setup:</span>{" "}
                      {eventInfo.setupRequired ? "Yes" : "No"}
                    </div>
                  </div>

                  {eventInfo.specialInstructions && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">
                        Special Instructions:
                      </span>

                      <p className="text-sm text-gray-700 mt-1">
                        {eventInfo.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>

                  <div className="text-sm text-gray-700">
                    <p>
                      {shippingInfo.firstName} {shippingInfo.lastName}
                    </p>

                    <p>{shippingInfo.address}</p>

                    <p>
                      {shippingInfo.city}, {shippingInfo.state}{" "}
                      {shippingInfo.pincode}
                    </p>

                    <p>{shippingInfo.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // For COD orders, create order first then navigate
                    if (paymentMethod === "cod") {
                      handlePaymentSubmit({ preventDefault: () => {} });
                    } else {
                      // For paid orders, navigate to confirmation
                      navigate("/order-confirmation", {
                        state: {
                          order: createdOrder,
                          orderNumber: createdOrder?.orderNumber,
                        },
                      });
                    }
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Confirm Order (₹{total.toFixed(2)})
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3 items-start">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={
                            item.thumbnail.startsWith("http")
                              ? item.thumbnail
                              : `${IMAGE_BASE_URL}${item.thumbnail}`
                          }
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = `${IMAGE_BASE_URL}/uploads/products/placeholder.jpg`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 break-words">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-700 font-medium">
                        Qty: {item.quantity}
                      </p>

                      {item.sku && (
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      )}
                    </div>

                    <span className="font-bold text-gray-900 text-base">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-800 font-medium">Subtotal</span>

                  <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-800 font-medium">Shipping</span>

                  <span className="text-gray-900">
                    {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-800 font-medium">
                    Tax (18% GST)
                  </span>

                  <span className="text-gray-900">₹{tax.toFixed(2)}</span>
                </div>

                {setupCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-800 font-medium">
                      Setup Service
                    </span>

                    <span className="text-gray-900">
                      ₹{setupCharges.toFixed(2)}
                    </span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span className="text-gray-900">
                      -₹{couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-xl font-bold text-gray-900">Total</span>

                  <span className="text-xl font-bold text-blue-600">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck size={16} />

                  <span>Free shipping on available items</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} />

                  <span>Secure payment processing</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-600">
                  <Tag size={16} className="text-green-600" />
                  Have a coupon?
                </h3>

                {!appliedCoupon ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter coupon code"
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-gray-900"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {appliedCoupon.code} applied
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
