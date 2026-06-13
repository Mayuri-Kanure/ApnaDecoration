import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Star,
  Tag,
  X,
  Home,
  Briefcase,
  Building2,
  Plus,
} from "lucide-react";

import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useOrders } from "../contexts/OrderContext";
import { IMAGE_BASE_URL } from "../config/constants";

import couponService from "../services/couponService";
import paymentService from "../services/paymentService";
import addressService from "../services/addressService";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, getTotalPrice, isCartLoading } = useCart();
  const { success: showSuccess, error: showError } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addOrder } = useOrders();

  // Get buyNowItem from location state if available
  const buyNowItem = location.state?.buyNowItem;
  
  // Use buyNowItem if available (Buy Now flow), otherwise use cartItems (Add to Cart flow)
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

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
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "home",
    isDefault: false,
  });

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

  // ✅ KEPT EXACTLY UNCHANGED: Stays identical to your original text form field layout
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

  // Auto-fill shipping information from user profile and localStorage
  useEffect(() => {
    const savedShippingInfo = localStorage.getItem("shippingInfo");
    let initialShippingInfo = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    };

    if (savedShippingInfo) {
      try {
        initialShippingInfo = JSON.parse(savedShippingInfo);
      } catch (error) {
        console.error("Error parsing saved shipping info:", error);
      }
    }

    if (isAuthenticated && user) {
      const mergedShippingInfo = {
        ...initialShippingInfo,
        firstName: initialShippingInfo.firstName || user.firstName || "",
        lastName: initialShippingInfo.lastName || user.lastName || "",
        email: initialShippingInfo.email || user.email || "",
        phone: initialShippingInfo.phone || user.phone || "",
        address: initialShippingInfo.address || user.address || "",
        city: initialShippingInfo.city || user.city || "",
        state: initialShippingInfo.state || user.state || "",
        pincode: initialShippingInfo.pincode || user.pincode || "",
        country: initialShippingInfo.country || user.country || "India",
      };
      setShippingInfo(mergedShippingInfo);
    } else {
      setShippingInfo(initialShippingInfo);
    }
  }, [isAuthenticated, user]);

  // Load addresses when authenticated
  useEffect(() => {
    const loadAddresses = async () => {
      if (isAuthenticated) {
        setLoadingAddresses(true);
        try {
          const response = await addressService.getAddresses();
          const addressList = Array.isArray(response)
            ? response
            : response?.data || [];
          setSavedAddresses(addressList);

          const defaultAddr = addressList.find((addr) => addr.isDefault);
          if (defaultAddr) {
            handleAddressSelect(defaultAddr);
          }
        } catch (error) {
          console.error("Failed to load addresses:", error);
        } finally {
          setLoadingAddresses(false);
        }
      }
    };
    loadAddresses();
  }, [isAuthenticated]);

  // Fetch available coupons on mount
  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  // ✅ FIX: Clean adaptation maps data correctly onto your singular address key without breaking inputs
  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);

    const nameParts = (address.name || "").split(" ");
    const fullAddressString = `${address.addressLine1}${address.addressLine2 ? ", " + address.addressLine2 : ""}${address.landmark ? ", Near " + address.landmark : ""}`;

    setShippingInfo((prev) => ({
      ...prev,
      firstName: nameParts[0] || prev.firstName,
      lastName: nameParts.slice(1).join(" ") || prev.lastName,
      phone: address.phone || prev.phone,
      address: fullAddressString,
      city: address.city || prev.city,
      state: address.state || prev.state,
      pincode: address.pincode || prev.pincode,
      country: address.country || "India",
    }));
  };

  // ✅ KEPT EXACTLY UNCHANGED: Handlers are mapped perfectly to your standard fields
  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem("shippingInfo", JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await addressService.createAddress(newAddress);
      if (response) {
        showSuccess("Address added successfully!");
        const updatedAddresses = await addressService.getAddresses();
        const addressList = Array.isArray(updatedAddresses)
          ? updatedAddresses
          : [];
        setSavedAddresses(addressList);

        const newAddr =
          addressList.find(
            (addr) => addr.addressLine1 === newAddress.addressLine1,
          ) || addressList[addressList.length - 1];
        if (newAddr) {
          handleAddressSelect(newAddr);
        }
        setShowNewAddressForm(false);
        setNewAddress({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          addressType: "home",
          isDefault: false,
        });
      }
    } catch (error) {
      showError("Failed to add address. Please try again.");
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "work":
        return <Briefcase className="w-4 h-4" />;
      case "other":
        return <Building2 className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const fetchLatestStock = async () => {
    try {
      const token = localStorage.getItem("token");
      const stockValidations = [];

      for (const item of checkoutItems) {
        try {
          const endpoint =
            item.type === "vendor-product"
              ? `${API_BASE_URL}/vendor-products/${item.productId}`
              : `${API_BASE_URL}/products/${item.productId}`;

          const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
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
          stockValidations.push({
            productId: item.productId,
            name: item.name,
            cartQty: item.quantity,
            currentStock: 0,
            isValid: false,
          });
        }
      }

      const invalidItems = stockValidations.filter((item) => !item.isValid);
      if (invalidItems.length > 0) {
        const itemList = invalidItems
          .map((item) => `"${item.name}" (Available: ${item.currentStock})`)
          .join(", ");
        throw new Error(`Stock has changed. Please refresh cart: ${itemList}`);
      }
      return true;
    } catch (err) {
      showError(err.message);
      throw err;
    }
  };

  const subtotal = getTotalPrice();
  const shipping = 0;
  const tax = 0;
  const setupCharges = eventInfo.setupRequired ? 500 : 0;
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
    if (step > 1) setStep(step - 1);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await couponService.applyCoupon(
        couponCode,
        subtotal + tax + setupCharges,
      );
      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        setCouponDiscount(result.data.discountAmount);
        showSuccess(
          `Coupon applied! You saved ₹${result.data.discountAmount.toFixed(2)}`,
        );
      } else {
        showError(result.message || "Invalid coupon code");
      }
    } catch (error) {
      showError("Failed to apply coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // ✅ EXPLICIT SINGLE DECLARATION: Handles side coupon clicks properly without triggering Babels redeclaration panic
  const handleApplyAvailableCoupon = async (coupon) => {
    setCouponCode(coupon.code);
    setShowCoupons(false);
    setCouponLoading(true);
    try {
      const result = await couponService.applyCoupon(
        coupon.code,
        subtotal + tax + setupCharges,
      );
      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        setCouponDiscount(result.data.discountAmount);
        showSuccess(
          `Coupon applied! You saved ₹${result.data.discountAmount.toFixed(2)}`,
        );
      } else {
        showError(result.message || "Invalid coupon code");
      }
    } catch (error) {
      showError("Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/available`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableCoupons(data.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const openRazorpayDirectly = async (order) => {
    try {
      setIsProcessing(true);
      const response = await paymentService.createRazorpayOrder(
        order._id,
        total,
      );
      const razorpayOrder = response;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_live_RsakLTdHRff3gk",
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: "APNA DECORATION",
        description: `Payment for Order #${order._id}`,
        order_id: razorpayOrder.order.id,
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email || "",
          contact: shippingInfo.phone || "",
        },
        theme: { color: "#2F66FF" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentCancelled(true);
            alert("Payment cancelled.");
          },
          backdropclose: false,
          escape: true,
          handleback: true,
        },
        handler: async function (response) {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            setPaymentCompleted(true);
            setStep(4);
          } catch (error) {
            showError("Payment verification failed.");
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const razorpay = await paymentService.initializeRazorpay(options);
      if (razorpay && typeof razorpay.open === "function") {
        razorpay.open();
      } else {
        throw new Error("Razorpay instance is not valid");
      }
    } catch (error) {
      showError("Failed to open payment gateway");
      setIsProcessing(false);
    }
  };

  const handleCreateOrderForPayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to place an order");

      await fetchLatestStock();

      const orderData = {
        user: user?._id || user?.id,
        userId: user?._id || user?.id,
        type: "product",
        status: "pending",
        items: checkoutItems.map((item) => ({
          product: item.productId,
          productModel:
            item.type === "vendor-product" ? "VendorProduct" : "Product",
          quantity: item.quantity || 1,
          unitPrice: Number(item.price) || 0,
          totalPrice: Number(item.price * (item.quantity || 1)) || 0,
          name: item.name,
          thumbnail: item.thumbnail || item.image,
          vendor: item.vendorId,
        })),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.pincode,
          country: shippingInfo.country || "India",
        },
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        pricing: { subtotal, tax, shipping, total, discount: couponDiscount },
        eventInfo,
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to create order.");

      const order = result.data || result;
      setCreatedOrder(order);
      openRazorpayDirectly(order);
    } catch (error) {
      showError(error.message);
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to place an order");

      await fetchLatestStock();

      const orderData = {
        items: checkoutItems.map((item) => ({
          product: item.productId,
          productModel:
            item.type === "vendor-product" ? "VendorProduct" : "Product",
          quantity: item.quantity,
          unitPrice: Number(item.price) || 0,
          totalPrice: Number(item.price * item.quantity) || 0,
          vendor: item.vendorId,
        })),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.pincode,
          country: shippingInfo.country || "India",
        },
        paymentMethod,
        pricing: { subtotal, tax, shipping, total },
        eventInfo,
        paymentStatus: "pending",
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to place order.");

      const newOrder = result.data || result;
      setCreatedOrder(newOrder);
      
      // Update OrderContext to notify Profile/Orders pages
      addOrder(newOrder);
      
      setStep(4);
    } catch (error) {
      alert(`Order failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation cartCount={0} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation cartCount={cartItems.length} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/cart"
            className="text-gray-600 hover:text-red-500 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Progress Steps UI */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
                >
                  4
                </div>
                <span className="ml-2 font-medium text-gray-900 text-sm sm:text-base">
                  Review
                </span>
              </div>
            </div>

            {/* STEP 1: EVENT DETAILS */}
            {step === 1 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Event Details
                </h2>
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
                        className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none"
                      >
                        <option value="">Select event type</option>
                        <option value="birthday">Birthday Party</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="proposal">Proposal</option>
                        <option value="wedding">Wedding</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {eventInfo.eventType === "other" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specify Event *
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
                          className="w-full border rounded-lg px-3 py-2 text-gray-900"
                          placeholder="Enter custom type"
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
                        className="w-full border rounded-lg px-3 py-2 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Setup Arrival Time *
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
                        className="w-full border rounded-lg px-3 py-2 text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Base Address *
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
                      className="w-full border rounded-lg px-3 py-2 text-gray-900"
                      placeholder="Full address configuration setup"
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
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="font-medium text-gray-600">
                        Include On-Site Styling Setup Assistant (+₹500)
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/cart")}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={16} /> Return to Cart
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      Proceed to Shipping <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: SHIPPING INFORMATION */}
            {step === 2 && (
              <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Shipping Information
                </h2>

                {/* Amazon/Flipkart-style Cards Grid selector */}
                {isAuthenticated && savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Select a saved address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => handleAddressSelect(address)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                            selectedAddressId === address._id
                              ? "border-blue-600 bg-blue-50/40"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                {getAddressIcon(address.addressType)}{" "}
                                {address.addressType}
                              </span>
                              {address.isDefault && (
                                <span className="text-[10px] tracking-wider uppercase font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-gray-900 text-sm">
                              {address.name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mb-2">
                              {address.phone}
                            </p>
                            <p className="text-xs text-gray-600 font-medium">
                              {address.addressLine1}
                              {address.addressLine2
                                ? `, ${address.addressLine2}`
                                : ""}
                              {address.landmark
                                ? ` (Near ${address.landmark})`
                                : ""}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800">
                              {address.city}, {address.state} -{" "}
                              {address.pincode}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address._id ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}
                            >
                              {selectedAddressId === address._id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors pt-1"
                    >
                      <Plus size={14} />{" "}
                      {showNewAddressForm
                        ? "Cancel New Entry"
                        : "Ship to a different location"}
                    </button>
                  </div>
                )}

                {/* Inline Register Address Subform Panel */}
                {showNewAddressForm && (
                  <form
                    onSubmit={handleAddAddress}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4"
                  >
                    <h3 className="text-sm font-bold text-gray-800">
                      Add a New Location Card
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        name="name"
                        placeholder="Full Name *"
                        value={newAddress.name}
                        onChange={handleAddressInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                      />
                      <input
                        type="tel"
                        required
                        name="phone"
                        placeholder="Contact Mobile *"
                        value={newAddress.phone}
                        onChange={handleAddressInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      name="addressLine1"
                      placeholder="Flat, House no., Building, Street *"
                      value={newAddress.addressLine1}
                      onChange={handleAddressInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      type="text"
                      name="addressLine2"
                      placeholder="Colony, Area, Sector (Optional)"
                      value={newAddress.addressLine2}
                      onChange={handleAddressInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Landmark identifier (Optional)"
                      value={newAddress.landmark}
                      onChange={handleAddressInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        name="city"
                        placeholder="City *"
                        value={newAddress.city}
                        onChange={handleAddressInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                      />
                      <input
                        type="text"
                        required
                        name="state"
                        placeholder="State *"
                        value={newAddress.state}
                        onChange={handleAddressInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                      />
                      <input
                        type="text"
                        required
                        name="pincode"
                        placeholder="6-Digit Pincode *"
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={handleAddressInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 tracking-widest"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <select
                        name="addressType"
                        value={newAddress.addressType}
                        onChange={handleAddressInputChange}
                        className="border rounded-lg px-2 py-1.5 text-sm text-gray-900 bg-white"
                      >
                        <option value="home">Home Label</option>
                        <option value="work">Work Label</option>
                        <option value="other">Other/Venue Label</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="px-4 py-1.5 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save & Choose Card
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Main operational form is entirely preserved with your exact fields */}
                <form
                  onSubmit={handleShippingSubmit}
                  className="space-y-4 pt-2 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
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
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
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
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        required
                        name="pincode"
                        maxLength={6}
                        value={shippingInfo.pincode}
                        onChange={handleShippingInputChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none font-semibold tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
                    >
                      <ChevronLeft size={16} /> Return to Event
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition-colors"
                    >
                      Continue to Payment <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: TERMINAL SECURE PAYMENT */}
            {step === 3 && (
              <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Secure Payment Terminal
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 text-gray-700 font-medium">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300"
                    />
                    <CreditCard size={18} className="text-blue-500" />{" "}
                    <span>
                      Online Payment Gateway (Razorpay Netbanking / UPI)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 text-gray-700 font-medium">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300"
                    />
                    <Truck size={18} className="text-orange-500" />{" "}
                    <span>Cash / Pay on Delivery (COD Service)</span>
                  </label>
                </div>

                {paymentMethod === "online" ? (
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 space-y-4">
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                      Clicking the button will create a secured order payload
                      and verify catalog quantities against server storage logs
                      before rendering the direct checkout gateway view.
                    </p>
                    {!createdOrder ? (
                      <button
                        onClick={handleCreateOrderForPayment}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Verifying Stock Logs..."
                          : `Pay Securely ₹${total.toFixed(2)}`}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => openRazorpayDirectly(createdOrder)}
                          disabled={isProcessing}
                          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all"
                        >
                          {isProcessing
                            ? "Opening Portal..."
                            : "Re-Launch Payment Frame Window"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
                    >
                      <ChevronLeft size={16} /> Return to Address
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing
                        ? "Processing..."
                        : `Complete COD Checkout (₹${total.toFixed(2)})`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: SUCCESS PROFILE */}
            {step === 4 && (
              <div className="bg-white rounded-lg p-6 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Check size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Fulfillment Context Registered Successfully!
                </h2>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Your verification structure has been safely mapped into
                  MongoDB Atlas records. Your items are now held for logistics
                  processing.
                </p>
                <button
                  onClick={() =>
                    navigate("/order-confirmation", {
                      state: {
                        order: createdOrder,
                        orderNumber: createdOrder?.orderNumber,
                        paymentMethod,
                      },
                    })
                  }
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  View Final Invoice Slip
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: ORDER LINE ITEMS CALCULATOR SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
                Order Line Items ({checkoutItems.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3 text-xs font-medium text-gray-800"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                      <img
                        src={
                          item.thumbnail?.startsWith("http")
                            ? item.thumbnail
                            : `${IMAGE_BASE_URL}${item.thumbnail}`
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `${IMAGE_BASE_URL}/uploads/products/placeholder.jpg`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-gray-500 font-semibold mt-0.5">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-xs font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Basket Subtotal</span>
                  <span className="text-gray-900 font-bold">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics Shipping</span>
                  <span className="text-gray-900 font-bold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST Breakdown (18%)</span>
                  <span className="text-gray-900 font-bold">
                    ₹{tax.toFixed(2)}
                  </span>
                </div>
                {setupCharges > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>On-Site Assistant Setup Charge</span>
                    <span className="font-bold">
                      ₹{setupCharges.toFixed(2)}
                    </span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Adjustment Saved</span>
                    <span className="font-bold">
                      -₹{couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">
                  Grand Total Due
                </span>
                <span className="text-xl font-black text-blue-600">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              {/* Coupons Picker Section */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1">
                    <Tag size={13} className="text-emerald-500" /> Apply Coupon
                    Offer
                  </span>
                  {availableCoupons.length > 0 && (
                    <button
                      onClick={() => setShowCoupons(!showCoupons)}
                      className="text-blue-600 hover:underline text-[11px]"
                    >
                      {showCoupons ? "Hide" : "View Stored Cards"}
                    </button>
                  )}
                </div>

                {showCoupons && availableCoupons.length > 0 && (
                  <div className="bg-gray-50 border rounded-lg p-2 max-h-32 overflow-y-auto space-y-1.5">
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon._id}
                        onClick={() => handleApplyAvailableCoupon(coupon)}
                        className="p-1.5 bg-white border rounded text-[11px] flex justify-between items-center cursor-pointer hover:border-blue-400"
                      >
                        <div>
                          <span className="font-bold text-gray-900 block">
                            {coupon.code}
                          </span>
                          <span className="text-gray-500 text-[10px]">
                            {coupon.description}
                          </span>
                        </div>
                        <span className="text-emerald-600 font-bold">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="CODE VALUE"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="border text-center font-bold px-2 py-1.5 rounded-lg text-xs w-full text-gray-900 bg-white"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-emerald-600 text-white px-3 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                    <span className="font-bold">
                      {appliedCoupon.code} Activated
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <X size={14} />
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
