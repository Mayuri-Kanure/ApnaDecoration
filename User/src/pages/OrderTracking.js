import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { 
  Package, 
  Truck, 
  Check, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronLeft,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingSteps, setTrackingSteps] = useState([]);

  useEffect(() => {
    fetchOrderTracking();
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.data || data);
        generateTrackingSteps(data.data || data);
      } else {
        console.error('Failed to fetch order tracking');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingSteps = (orderData) => {
    const steps = [
      {
        id: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been received and confirmed',
        icon: Check,
        completed: true,
        timestamp: orderData.createdAt
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'We are preparing your decoration items',
        icon: Package,
        completed: ['processing', 'ready', 'shipped', 'delivered'].includes(orderData.status),
        timestamp: orderData.processingDate
      },
      {
        id: 'ready',
        title: 'Ready for Setup',
        description: 'Your items are ready for delivery and setup',
        icon: Clock,
        completed: ['ready', 'shipped', 'delivered'].includes(orderData.status),
        timestamp: orderData.readyDate
      },
      {
        id: 'shipped',
        title: 'Out for Delivery',
        description: 'Our team is on the way to your location',
        icon: Truck,
        completed: ['shipped', 'delivered'].includes(orderData.status),
        timestamp: orderData.shippedDate
      },
      {
        id: 'delivered',
        title: 'Delivered & Setup Complete',
        description: 'Your decoration has been delivered and set up',
        icon: Check,
        completed: orderData.status === 'delivered',
        timestamp: orderData.deliveredDate
      }
    ];

    setTrackingSteps(steps);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'ready':
        return 'text-purple-600 bg-purple-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstimatedDelivery = () => {
    if (order?.estimatedDelivery) {
      return new Date(order.estimatedDelivery).toLocaleDateString();
    }
    
    // Calculate estimated delivery based on order date
    const orderDate = new Date(order?.createdAt);
    const estimatedDate = new Date(orderDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
    return estimatedDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">We couldn't find the tracking information for this order.</p>
            <Link
              to="/orders"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/orders"
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Orders
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Track Order #{order.orderNumber || order._id}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Order Progress</h2>
              
              <div className="space-y-6">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === trackingSteps.length - 1;
                  
                  return (
                    <div key={step.id} className="relative">
                      {/* Timeline line */}
                      {!isLast && (
                        <div className={`absolute left-6 top-12 w-0.5 h-6 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                      
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon size={20} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold ${
                              step.completed ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </h3>
                            {step.timestamp && (
                              <span className="text-sm text-gray-500">
                                {new Date(step.timestamp).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            step.completed ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-medium">{getEstimatedDelivery()}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    {order.shippingAddress ? (
                      <div className="font-medium">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p>{order.shippingAddress.zipCode}</p>
                      </div>
                    ) : (
                      <p className="font-medium">Address not available</p>
                    )}
                  </div>
                </div>
                
                {order.trackingNumber && (
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium font-mono">{order.trackingNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              
              <div className="space-y-3">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Call Support</p>
                    <p className="text-sm text-gray-600">+91 98765 43210</p>
                  </div>
                </a>
                
                <Link
                  to="/support"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Chat Support</p>
                    <p className="text-sm text-gray-600">Get instant help</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              
              <div className="space-y-3">
                {order.items?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.product?.name || item.productName || 'Product'}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                
                {order.items?.length > 3 && (
                  <p className="text-sm text-gray-600 text-center pt-2 border-t">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-green-600">
                    ₹{(order.pricing?.total || order.total || 0).toFixed(2)}
                  </span>
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

export default OrderTracking;