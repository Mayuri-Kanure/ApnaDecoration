import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Check, Package, Truck, ArrowLeft } from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderData || !orderId) {
      navigate('/');
    }
  }, [orderData, orderId, navigate]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleTrackOrder = () => {
    navigate('/orders');
  };

  if (!orderData || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for your order. We've received your order and will start processing it right away.
            </p>
            <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-semibold">
              Order ID: {orderId}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{new Date(orderData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{orderData.payment.method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium capitalize ${
                      orderData.payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {orderData.payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status:</span>
                    <span className="font-medium text-blue-600 capitalize">{orderData.status}</span>
                  </div>
                </div>
              </div>

              {/* Items Ordered */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Items Ordered</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description || 'Premium decoration service'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-lg">₹{(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping & Payment Summary */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-2">
                    <p className="font-medium">{orderData.shipping.name}</p>
                    <p className="text-gray-600">{orderData.shipping.address}</p>
                    <p className="text-gray-600">
                      {orderData.shipping.city}, {orderData.shipping.state} - {orderData.shipping.pincode}
                    </p>
                    <p className="text-gray-600">
                      📱 {orderData.shipping.phone}
                    </p>
                    <p className="text-gray-600">
                      📧 {orderData.shipping.email}
                    </p>
                  </div>
                </div>

              {/* Payment Summary */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{orderData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">₹50</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-indigo-600">₹{(orderData.total + 50).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContinueShopping}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
            <button
              onClick={handleTrackOrder}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Truck className="w-4 h-4" />
              Track Order
            </button>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>You'll receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>We'll process your order within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>You'll receive tracking details once shipped</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Estimated delivery: 3-5 business days</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderSuccess;
