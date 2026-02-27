import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { 
  Package, 
  Truck, 
  Check, 
  Clock, 
  X, 
  RefreshCw, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronLeft,
  Star,
  MessageCircle,
  Download
} from 'lucide-react';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Fetch real order data from API
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
      } else {
        console.error('Failed to fetch order details');
        // Show error message or redirect
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'setup':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'ready':
        return 'Ready for Setup';
      case 'setup':
        return 'Setup Scheduled';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      // Implement cancel order logic
      alert('Order cancellation request submitted');
    }
  };

  const handleContactSupport = () => {
    // Implement contact support logic
    alert(`Support contact: ${order.support.vendor.phone}`);
  };

  const handleDownloadInvoice = () => {
    // Implement invoice download logic
    alert('Invoice download started');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
            <Link
              to="/orders"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/orders"
              className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Orders
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadInvoice}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  title="Download Invoice"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={handleContactSupport}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  title="Contact Support"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Order Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Order Number</span>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Order Date</span>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Order Status</span>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Payment Method</span>
              <p className="font-medium capitalize">{order.paymentMethod || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Payment Status</span>
              <p className="font-medium capitalize">{order.paymentStatus || 'Pending'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Items Count</span>
              <p className="font-medium">{order.items?.length || 0} items</p>
            </div>
          </div>
          
          {order.shippingAddress && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Shipping Address</span>
              <p className="font-medium">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['details'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.product?.name || item.productName || 'Product'}
                          </h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: ₹{item.unitPrice || item.price || 0}</p>
                          <p className="text-sm font-medium text-gray-900">
                            Total: ₹{(item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0))).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{(order.pricing?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>₹{(order.pricing?.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>₹{(order.pricing?.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{(order.pricing?.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status</span>
                      <span className="text-green-600 font-medium">Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderDetails;
