import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import {
  Package,
  Truck,
  Check,
  Clock,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  Users,
  HelpCircle,
} from "lucide-react";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Support access function
  const handleNeedHelp = (orderId) => {
    navigate("/support", {
      state: {
        orderId: orderId,
        category: "order",
        subject: `Issue with Order ${orderId}`,
      },
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Show empty state on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4" />;
      case "confirmed":
        return <Check className="w-4 h-4" />;
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "ready":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "pending":
        return <Package className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "confirmed":
        return "Confirmed";
      case "processing":
        return "Processing";
      case "ready":
        return "Ready for Setup";
      case "shipped":
        return "Shipped";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const handleTrackOrder = (trackingNumber) => {
    if (trackingNumber) {
      // In a real app, this would open a tracking modal or redirect to tracking page
      alert(`Tracking number: ${trackingNumber}`);
    }
  };

  const handleReorder = (order) => {
    // Add items from this order back to cart
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track and manage your decoration orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "pending",
              "confirmed",
              "processing",
              "ready",
              "completed",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status === "ready"
                  ? "Ready for Setup"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber || order._id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                      {order.eventInfo && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {order.eventInfo.eventDate
                                ? new Date(
                                    order.eventInfo.eventDate,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>
                              {order.eventInfo?.guestCount || 0} guests
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="capitalize">
                              {order.eventInfo?.venueType || "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || "pending")}`}
                      >
                        {getStatusIcon(order.status || "pending")}
                        {getStatusText(order.status || "pending")}
                      </span>
                      <button
                        onClick={() => handleReorder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 border rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product?.name || "Product"}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                          {/* Fallback for broken images */}
                          <div className="w-full h-full hidden items-center justify-center bg-gray-100">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.product?.name ||
                              item.productName ||
                              item.name ||
                              "Product"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity || 0} × ₹
                            {(item.unitPrice || item.price || 0)
                              .toFixed(2)
                              .toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹
                            {(
                              item.totalPrice ||
                              (item.quantity || 0) *
                                (item.unitPrice || item.price || 0)
                            )
                              .toFixed(2)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="text-lg font-bold text-gray-900">
                          ₹
                          {(order.pricing?.total || order.total || 0)
                            .toFixed(2)
                            .toLocaleString()}
                        </span>
                      </div>
                      {order.tracking && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Tracking:
                          </span>
                          <button
                            onClick={() => handleTrackOrder(order.tracking)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            {order.tracking}
                          </button>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Event Date:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {order.estimatedDelivery
                              ? new Date(
                                  order.estimatedDelivery,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <Link
                        to={`/order-details/${order._id}`}
                        className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleNeedHelp(order._id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                      >
                        <HelpCircle size={16} />
                        Need Help
                      </button>
                      {order.status === "completed" && (
                        <button className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 transition-colors">
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
