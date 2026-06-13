import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Upload,
  Image,
  Save,
} from "lucide-react";
import { IMAGE_BASE_URL } from "../config/constants";
import orderService from "../services/orderService";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  const { success, error: showError } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [formData, setFormData] = useState({
    serviceId: service?._id || "",
    bookingDate: "",
    bookingTime: "",
    referenceImage: null,
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
      specialRequests: "",
    },
  });

  // Update formData when service changes and auto-fill user data
  useEffect(() => {
    if (service) {
      // Auto-save user details if authenticated
      const savedCustomerInfo = localStorage.getItem("customerInfo");
      let customerInfo = {
        name: "",
        email: "",
        phone: "",
        address: "",
        specialRequests: "",
      };

      // Load saved customer info
      if (savedCustomerInfo) {
        try {
          customerInfo = JSON.parse(savedCustomerInfo);
        } catch (error) {
          console.error("Error parsing saved customer info:", error);
        }
      }

      // Auto-fill from user profile if authenticated
      if (isAuthenticated && user) {
        customerInfo = {
          ...customerInfo,
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : customerInfo.name || user.name || "",
          email: customerInfo.email || user.email || "",
          phone: customerInfo.phone || user.phone || "",
          address: customerInfo.address || user.address || "",
        };
      }

      setFormData({
        serviceId: service._id || "",
        bookingDate: "",
        bookingTime: "",
        referenceImage: null,
        customerInfo,
      });
    }
  }, [service, isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add null checks for service and formData
    if (!service) {
      showError("Service information not available");
      return;
    }

    if (!formData.bookingDate || !formData.bookingTime) {
      showError("Please select booking date and time");
      return;
    }

    if (
      !formData?.customerInfo?.name ||
      !formData?.customerInfo?.email ||
      !formData?.customerInfo?.phone ||
      !formData?.customerInfo?.address
    ) {
      showError(
        "Please fill in all required customer information including address",
      );
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("serviceId", formData.serviceId);
      formDataToSend.append("bookingDate", formData.bookingDate);
      formDataToSend.append("bookingTime", formData.bookingTime);
      formDataToSend.append("notes", formData.notes || "");

      // Add customer info as JSON string
      formDataToSend.append(
        "customerInfo",
        JSON.stringify(formData.customerInfo),
      );

      // Add reference image if selected
      if (formData.referenceImage) {
        formDataToSend.append("referenceImage", formData.referenceImage);
      }

      const booking = await orderService.createServiceBooking(formDataToSend);
      // Auto-save customer info for future bookings
      localStorage.setItem(
        "customerInfo",
        JSON.stringify(formData.customerInfo),
      );

      success("Service booking created successfully!");
      setBookingData(booking);
      setShowPayment(true);
      onSuccess(booking);
    } catch (error) {
      showError(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showError("Image size should be less than 5MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Only image files are allowed");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        referenceImage: file,
      }));
    }
  };

  const handleInputChange = (field, value) => {
    // Auto-save customer info when any field changes
    if (field.startsWith("customerInfo.")) {
      const updatedFormData = { ...formData };
      const [parent, child] = field.split(".");
      updatedFormData[parent] = {
        ...updatedFormData[parent],
        [child]: value,
      };
      setFormData(updatedFormData);

      // Auto-save to localStorage
      localStorage.setItem(
        "customerInfo",
        JSON.stringify(updatedFormData.customerInfo),
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  if (!isOpen || !service) return null;

  // Reset payment state when modal closes
  const handleClose = () => {
    setShowPayment(false);
    setBookingData(null);
    onClose();
  };

  // Handle Razorpay payment
  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!bookingData || !bookingData._id) {
        showError("Booking data not found");
        return;
      }

      if (!service || !service.price) {
        showError("Service price not available");
        return;
      }

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        showError("Failed to load payment gateway. Please try again.");
        return;
      }

      // Create Razorpay order from backend
      console.log("📱 Creating Razorpay order for booking:", bookingData._id);
      const razorpayOrderResponse =
        await orderService.createRazorpayOrderForService({
          bookingId: bookingData._id,
          amount: service.price,
          serviceName: service.name,
          customerInfo: {
            name: bookingData.customerInfo?.name,
            email: bookingData.customerInfo?.email,
            phone: bookingData.customerInfo?.phone,
          },
        });

      if (!razorpayOrderResponse || !razorpayOrderResponse.razorpayOrderId) {
        showError(
          "Failed to create payment order. Please try again.",
        );
        return;
      }

      console.log(
        "✅ Razorpay order created:",
        razorpayOrderResponse.razorpayOrderId,
      );

      // Get Razorpay Key ID from environment
      const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

      if (!RAZORPAY_KEY_ID) {
        showError("Payment configuration error. Please contact support.");
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: service.price * 100, // Convert to paise
        currency: "INR",
        order_id: razorpayOrderResponse.razorpayOrderId,
        name: "APNA DECORATION",
        description: `Service Booking - ${service.name}`,
        image:
          "https://apnadecoration.com/logo.png",
        prefill: {
          name: bookingData.customerInfo?.name || "",
          email: bookingData.customerInfo?.email || "",
          contact: bookingData.customerInfo?.phone || "",
        },
        handler: async (response) => {
          try {
            console.log(
              "✅ Payment successful! Verifying payment...",
              response,
            );

            // Verify payment with backend
            const verificationResponse =
              await orderService.verifyServicePayment({
                bookingId: bookingData._id,
                razorpayOrderId: razorpayOrderResponse.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

            if (
              verificationResponse &&
              verificationResponse.success
            ) {
              success("Payment successful! Your service is confirmed.");
              setTimeout(() => {
                handleClose();
              }, 1500);
            } else {
              showError(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            showError(
              error.message ||
                "Payment verification failed. Please contact support.",
            );
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            showError("Payment cancelled. Please try again.");
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      showError(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-gray-900">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Book Service
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Service Info */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {service.image && (
              <img
                src={`${IMAGE_BASE_URL}${service.image}`}
                alt={service.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">
                {service.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="sm:size-16" />
                  <span>{service.duration}</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-indigo-600">
                  ₹{service.price}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-4 sm:space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Booking Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.bookingDate}
                  onChange={(e) =>
                    handleInputChange("bookingDate", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                ></input>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Preferred Time
                </label>
                <select
                  required
                  value={formData.bookingTime}
                  onChange={(e) =>
                    handleInputChange("bookingTime", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                >
                  <option value="">Select time</option>
                  <option value="07:00 AM">07:00 AM</option>
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                  <option value="09:00 PM">09:00 PM</option>
                  <option value="10:00 PM">10:00 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                </select>
              </div>
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Image size={20} />
                Reference Image (Optional)
              </h3>
              <p className="text-sm text-gray-600">
                Upload a reference image to help us understand your decoration
                requirements better
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-indigo-500 transition-colors">
                {formData.referenceImage ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative inline-block max-w-full">
                      <img
                        src={URL.createObjectURL(formData.referenceImage)}
                        alt="Reference"
                        className="max-w-full sm:max-w-xs max-h-32 sm:max-h-48 w-auto h-auto rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            referenceImage: null,
                          }))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 text-gray-900 z-10"
                      >
                        <X size={14} className="sm:size-16" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate max-w-full">
                      {formData.referenceImage.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <Upload
                      size={36}
                      className="mx-auto text-gray-400 sm:size-48"
                    />
                    <div>
                      <label
                        htmlFor="referenceImage"
                        className="cursor-pointer"
                      >
                        <span className="mt-2 block text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500">
                          Upload Reference Image
                        </span>
                        <input
                          id="referenceImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} className="sm:size-20" />
                Customer Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerInfo.name}
                    onChange={(e) =>
                      handleInputChange("customerInfo.name", e.target.value)
                    }
                    className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerInfo.email}
                    onChange={(e) =>
                      handleInputChange("customerInfo.email", e.target.value)
                    }
                    className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerInfo.phone}
                    onChange={(e) =>
                      handleInputChange("customerInfo.phone", e.target.value)
                    }
                    className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Address *
                  </label>
                  <textarea
                    required
                    value={formData.customerInfo.address}
                    onChange={(e) =>
                      handleInputChange("customerInfo.address", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    rows={3}
                    placeholder="Your address for service delivery (required)"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <Save size={14} className="text-green-600" />
                    <span className="text-xs text-gray-500">
                      Auto-saved for future bookings
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Special Requests
                </label>
                <textarea
                  value={formData.customerInfo.specialRequests}
                  onChange={(e) =>
                    handleInputChange(
                      "customerInfo.specialRequests",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  rows={3}
                  placeholder="Any special requirements or requests..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {!showPayment && (
            <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}
        </form>

        {/* Payment Step */}
        {showPayment && (
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your service has been booked successfully. Choose a payment
                  method to complete the booking.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.bookingDate}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formData.bookingTime}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-indigo-600">
                      ₹{service.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Payment Method:
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Service bookings are processed through Razorpay for your
                  convenience and security.
                </p>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-lg">
                        Razorpay Checkout
                      </div>
                      <div className="text-sm text-gray-600">
                        Card, UPI, Net Banking, Wallet & More
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-indigo-600"
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
                </button>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-green-800">
                      <strong>Secure Payment:</strong> Your payment information
                      is encrypted and protected.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Booking
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Pay Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
