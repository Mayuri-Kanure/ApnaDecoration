import React, { useState, useContext } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import Navigation from '../components/Navigation';

import Footer from '../components/Footer';

import { CreditCard, Truck, Shield, ChevronLeft, Check, Calendar, Clock, MapPin, Users, Star, Tag, X } from 'lucide-react';

import { useCart } from '../contexts/CartContext';

import { IMAGE_BASE_URL } from '../config/constants';

import PaymentGateway from '../components/Payment/PaymentGateway';

import couponService from '../services/couponService';



const Checkout = () => {

  const navigate = useNavigate();

  const { cartItems, getTotalPrice } = useCart();

  const [step, setStep] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState('card');

  const [isProcessing, setIsProcessing] = useState(false);

  const [createdOrder, setCreatedOrder] = useState(null);

  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);



  const [eventInfo, setEventInfo] = useState({

    eventType: '',

    eventDate: '',

    eventTime: '',

    venueType: 'home',

    venueAddress: '',

    guestCount: '',

    specialInstructions: '',

    setupRequired: false,

    setupTimeSlot: ''

  });



  const [shippingInfo, setShippingInfo] = useState({

    firstName: '',

    lastName: '',

    email: '',

    phone: '',

    address: '',

    city: '',

    state: '',

    pincode: '',

    country: 'India'

  });



  const [billingInfo, setBillingInfo] = useState({

    sameAsShipping: true,

    ...shippingInfo

  });



  const [paymentInfo, setPaymentInfo] = useState({

    cardNumber: '',

    expiryMonth: '',

    expiryYear: '',

    cvv: '',

    nameOnCard: ''

  });



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

  // Coupon functions
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const result = await couponService.applyCoupon(couponCode, subtotal + tax + setupCharges);
      
      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        setCouponDiscount(result.data.discountAmount);
        alert(`Coupon applied! You saved ₹${result.data.discountAmount.toFixed(2)}`);
      } else {
        alert(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      alert('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
  };



  // Create order for payment (card payment method)

  const handleCreateOrderForPayment = async () => {

    setIsProcessing(true);

    try {

      const token = localStorage.getItem('token');

      if (!token) {

        throw new Error('Please login to place an order');

      }



      // Prepare order data

      const orderData = {

        items: cartItems.map(item => ({

          product: item.productId,

          productModel: 'Product',

          quantity: item.quantity,

          unitPrice: Number(item.price) || 0,

          totalPrice: Number(item.price * item.quantity) || 0

        })),

        shippingAddress: {

          street: shippingInfo.address,

          city: shippingInfo.city,

          state: shippingInfo.state,

          zipCode: shippingInfo.pincode,

          country: shippingInfo.country

        },

        paymentMethod: 'razorpay',

        pricing: {

          subtotal: subtotal,

          tax: tax,

          shipping: shipping,

          total: total

        },

        eventInfo: eventInfo,

        paymentStatus: 'pending'

      };



      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`

        },

        body: JSON.stringify(orderData)

      });



      const result = await response.json();



      if (!response.ok) {

        throw new Error(result.message || 'Failed to create order');

      }



      setCreatedOrder(result.data || result);

      console.log('✅ Order created for payment:', result.data || result);



    } catch (error) {

      console.error('❌ Error creating order for payment:', error);

      alert(error.message || 'Failed to create order');

    } finally {

      setIsProcessing(false);

    }

  };



  // Handle payment success

  const handlePaymentSuccess = (paymentResult) => {

    console.log('✅ Payment successful:', paymentResult);

    setPaymentCompleted(true);

    setStep(4); // Move to order confirmation

  };



  // Handle payment error

  const handlePaymentError = (error) => {

    console.error('❌ Payment error:', error);

    alert(error.message || 'Payment failed. Please try again.');

  };



  // Handle payment cancel

  const handlePaymentCancel = () => {

    console.log('🔍 Payment cancelled by user');

    // Optionally reset order state

    setCreatedOrder(null);

  };



  const handlePaymentSubmit = async (e) => {

    e.preventDefault();

    setIsProcessing(true);

    

    try {

      // Get authentication token

      const token = localStorage.getItem('token');

      if (!token) {

        throw new Error('Please login to place an order');

      }



      // Calculate totals

      const subtotal = getTotalPrice();

      const tax = subtotal * 0.18; // 18% GST

      const shipping = subtotal > 5000 ? 0 : 200; // Free shipping above 5000

      const total = subtotal + tax + shipping;

      

      console.log('💰 Calculated totals:', { subtotal, tax, shipping, total });



      // Prepare shipping address

      const shippingAddress = {

        street: shippingInfo.address,

        city: shippingInfo.city,

        state: shippingInfo.state,

        zipCode: shippingInfo.pincode,

        country: shippingInfo.country

      };



      // Prepare order data using real cart items (matching backend requirements)

      console.log('🛒 Raw cart items:', cartItems);

      

      const orderData = {

        items: cartItems.map(item => {

          console.log('🔍 Processing item:', item);

          console.log('🆔 productId:', item.productId);

          console.log('💰 price:', item.price);

          console.log('📊 quantity:', item.quantity);

          

          return {

            product: item.productId,        // ✅ Schema expects 'product'

            productModel: 'Product',       // ✅ Required field

            quantity: item.quantity,

            unitPrice: Number(item.price) || 0,        // ✅ Schema expects this

            totalPrice: Number(item.price * item.quantity) || 0  // ✅ Schema expects this

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

          total: total

        },

        eventInfo: eventInfo,

        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'

      };



      console.log('📋 Final order data being sent:', JSON.stringify(orderData, null, 2));



      // Create order via API

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`

        },

        body: JSON.stringify(orderData)

      });



      const result = await response.json();

      

      console.log('❌ ORDER API STATUS:', response.status);

      console.log('❌ ORDER API ERROR BODY:', result);

      

      if (!response.ok) {

        throw new Error(JSON.stringify(result));

      }



      // Clear cart after successful order

      // TODO: Implement cart clearing



      // Navigate to order confirmation with order data

      navigate('/order-confirmation', { 

        state: { 

          order: result.data,

          orderNumber: result.data.orderNumber 

        } 

      });



    } catch (error) {

      console.error('Order creation error:', error);

      alert(`Order failed: ${error.message}`);

    } finally {

      setIsProcessing(false);

    }

  };



  return (

    <div className="min-h-screen bg-gray-50">

      <Navigation cartCount={cartItems.length} />



      <div className="container mx-auto px-4 py-8">

        <div className="flex items-center gap-2 mb-8">

          <Link to="/cart" className="text-gray-600 hover:text-red-500 flex items-center gap-1">

            <ChevronLeft size={16} />

            Back to Cart

          </Link>

        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}

          <div className="lg:col-span-2">

            {/* Progress Steps */}

            <div className="flex items-center justify-between mb-8">

              <div className="flex items-center">

                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${

                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'

                }`}>

                  {step > 1 ? <Check size={16} /> : '1'}

                </div>

                <span className="ml-2 font-medium">Event Details</span>

              </div>

              <div className="flex-1 h-1 bg-gray-300 mx-4"></div>

              <div className="flex items-center">

                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${

                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'

                }`}>

                  {step > 2 ? <Check size={16} /> : '2'}

                </div>

                <span className="ml-2 font-medium">Shipping</span>

              </div>

              <div className="flex-1 h-1 bg-gray-300 mx-4"></div>

              <div className="flex items-center">

                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${

                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'

                }`}>

                  {step > 3 ? <Check size={16} /> : '3'}

                </div>

                <span className="ml-2 font-medium">Payment</span>

              </div>

              <div className="flex-1 h-1 bg-gray-300 mx-4"></div>

              <div className="flex items-center">

                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${

                  step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'

                }`}>

                  4

                </div>

                <span className="ml-2 font-medium">Review</span>

              </div>

            </div>



            {/* Step 1: Event Information */}

            {step === 1 && (

              <div className="bg-white rounded-lg p-6 shadow-sm">

                <div className="mb-6">

                  <h2 className="text-xl font-semibold mb-2">Event Details</h2>

                  <p className="text-gray-600">Tell us about your special event to provide the best decoration service</p>

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

                        onChange={(e) => setEventInfo({...eventInfo, eventType: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      >

                        <option value="">Select event type</option>

                        <option value="birthday">Birthday Party</option>

                        <option value="anniversary">Anniversary</option>

                        <option value="proposal">Proposal</option>

                        <option value="wedding">Wedding</option>

                        <option value="baby-shower">Baby Shower</option>

                        <option value="corporate">Corporate Event</option>

                        <option value="festival">Festival Celebration</option>

                        <option value="other">Other</option>

                      </select>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">

                        <Users className="inline w-4 h-4 mr-1" />

                        Number of Guests *

                      </label>

                      <input

                        type="number"

                        required

                        min="1"

                        value={eventInfo.guestCount}

                        onChange={(e) => setEventInfo({...eventInfo, guestCount: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                        placeholder="Expected number of guests"

                      />

                    </div>

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

                        min={new Date().toISOString().split('T')[0]}

                        value={eventInfo.eventDate}

                        onChange={(e) => setEventInfo({...eventInfo, eventDate: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

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

                        onChange={(e) => setEventInfo({...eventInfo, eventTime: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                  </div>



                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      <MapPin className="inline w-4 h-4 mr-1" />

                      Venue Type *

                    </label>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                      {['home', 'banquet', 'outdoor', 'office'].map((venue) => (

                        <label key={venue} className="relative">

                          <input

                            type="radio"

                            name="venueType"

                            value={venue}

                            checked={eventInfo.venueType === venue}

                            onChange={(e) => setEventInfo({...eventInfo, venueType: e.target.value})}

                            className="sr-only peer"

                            required

                          />

                          <div className="border-2 rounded-lg p-3 text-center cursor-pointer transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50">

                            <MapPin className="w-5 h-5 mx-auto mb-1" />

                            <span className="text-sm font-medium capitalize">{venue}</span>

                          </div>

                        </label>

                      ))}

                    </div>

                  </div>



                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address *</label>

                    <textarea

                      required

                      rows={3}

                      value={eventInfo.venueAddress}

                      onChange={(e) => setEventInfo({...eventInfo, venueAddress: e.target.value})}

                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      placeholder="Complete venue address for decoration setup"

                    />

                  </div>



                  <div>

                    <label className="flex items-center gap-3 cursor-pointer">

                      <input

                        type="checkbox"

                        checked={eventInfo.setupRequired}

                        onChange={(e) => setEventInfo({...eventInfo, setupRequired: e.target.checked})}

                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"

                      />

                      <span className="font-medium">Professional Setup Service (+₹500)</span>

                    </label>

                    <p className="text-sm text-gray-600 mt-1 ml-7">

                      Our team will arrive 2 hours before your event to set up decorations

                    </p>

                  </div>



                  {eventInfo.setupRequired && (

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Setup Time Slot</label>

                      <select

                        value={eventInfo.setupTimeSlot}

                        onChange={(e) => setEventInfo({...eventInfo, setupTimeSlot: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      >

                        <option value="">Select time slot</option>

                        <option value="6am-8am">6:00 AM - 8:00 AM</option>

                        <option value="8am-10am">8:00 AM - 10:00 AM</option>

                        <option value="10am-12pm">10:00 AM - 12:00 PM</option>

                        <option value="2pm-4pm">2:00 PM - 4:00 PM</option>

                        <option value="4pm-6pm">4:00 PM - 6:00 PM</option>

                        <option value="6pm-8pm">6:00 PM - 8:00 PM</option>

                      </select>

                    </div>

                  )}



                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>

                    <textarea

                      rows={3}

                      value={eventInfo.specialInstructions}

                      onChange={(e) => setEventInfo({...eventInfo, specialInstructions: e.target.value})}

                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      placeholder="Any specific requirements, themes, or preferences for your decoration"

                    />

                  </div>



                  <button

                    type="submit"

                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"

                  >

                    Continue to Shipping Details

                  </button>

                </form>

              </div>

            )}



            {/* Step 2: Shipping Information */}

            {step === 2 && (

              <div className="bg-white rounded-lg p-6 shadow-sm">

                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

                <form onSubmit={handleShippingSubmit} className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>

                      <input

                        type="text"

                        required

                        value={shippingInfo.firstName}

                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>

                      <input

                        type="text"

                        required

                        value={shippingInfo.lastName}

                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

                      <input

                        type="email"

                        required

                        value={shippingInfo.email}

                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>

                      <input

                        type="tel"

                        required

                        value={shippingInfo.phone}

                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                  </div>

                  

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>

                    <input

                      type="text"

                      required

                      value={shippingInfo.address}

                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}

                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                    />

                  </div>

                  

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>

                      <input

                        type="text"

                        required

                        value={shippingInfo.city}

                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>

                      <input

                        type="text"

                        required

                        value={shippingInfo.state}

                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>

                      <input

                        type="text"

                        required

                        value={shippingInfo.pincode}

                        onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value})}

                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"

                      />

                    </div>

                  </div>



                  <button

                    type="submit"

                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"

                  >

                    Continue to Payment

                  </button>

                </form>

              </div>

            )}



            {/* Step 3: Payment Information */}

            {step === 3 && (

              <div className="bg-white rounded-lg p-6 shadow-sm">

                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>

                

                {/* Payment Method Selection */}

                <div className="mb-6">

                  <h3 className="font-medium mb-3">Select Payment Method</h3>

                  <div className="space-y-3">

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">

                      <input

                        type="radio"

                        name="payment"

                        value="card"

                        checked={paymentMethod === 'card'}

                        onChange={(e) => setPaymentMethod(e.target.value)}

                      />

                      <CreditCard size={20} />

                      <span>Credit/Debit Card</span>

                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">

                      <input

                        type="radio"

                        name="payment"

                        value="cod"

                        checked={paymentMethod === 'cod'}

                        onChange={(e) => setPaymentMethod(e.target.value)}

                      />

                      <Truck size={20} />

                      <span>Cash on Delivery</span>

                    </label>

                  </div>

                </div>



                {paymentMethod === 'card' && (

                  <div className="space-y-4">

                    {/* First create order, then show payment gateway */}

                    {!createdOrder ? (

                      <div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">

                          <h4 className="font-medium text-blue-900 mb-2">Secure Payment</h4>

                          <p className="text-sm text-blue-700">

                            Click below to create your order and proceed to secure payment via Razorpay

                          </p>

                        </div>

                        <button

                          onClick={handleCreateOrderForPayment}

                          disabled={isProcessing}

                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"

                        >

                          {isProcessing ? 'Creating Order...' : `Create Order & Pay ₹${total.toFixed(2)}`}

                        </button>

                      </div>

                    ) : (

                      <div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">

                          <h4 className="font-medium text-green-900 mb-2">Order Created</h4>

                          <p className="text-sm text-green-700">

                            Order #{createdOrder._id?.slice(-8)} created successfully. Please complete payment below.

                          </p>

                        </div>

                        <PaymentGateway

                          order={createdOrder}

                          amount={total}

                          onPaymentSuccess={handlePaymentSuccess}

                          onPaymentError={handlePaymentError}

                          onPaymentCancel={handlePaymentCancel}

                          disabled={paymentCompleted}

                        />

                      </div>

                    )}

                  </div>

                )}



                {paymentMethod === 'cod' && (

                  <div className="space-y-4">

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">

                      <h4 className="font-medium text-yellow-800 mb-2">Cash on Delivery</h4>

                      <p className="text-sm text-yellow-700">

                        Pay when you receive your order. Additional charges may apply for COD orders.

                      </p>

                    </div>

                    

                    <button

                      onClick={handlePaymentSubmit}

                      disabled={isProcessing}

                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"

                    >

                      {isProcessing ? 'Processing...' : `Place Order (₹${total.toFixed(2)})`}

                    </button>

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

                  <h3 className="font-semibold text-blue-900 mb-3">Event Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">

                    <div><span className="font-medium">Type:</span> {eventInfo.eventType}</div>

                    <div><span className="font-medium">Date:</span> {eventInfo.eventDate}</div>

                    <div><span className="font-medium">Time:</span> {eventInfo.eventTime}</div>

                    <div><span className="font-medium">Guests:</span> {eventInfo.guestCount}</div>

                    <div><span className="font-medium">Venue:</span> {eventInfo.venueType}</div>

                    <div><span className="font-medium">Setup:</span> {eventInfo.setupRequired ? 'Yes' : 'No'}</div>

                  </div>

                  {eventInfo.specialInstructions && (

                    <div className="mt-3">

                      <span className="font-medium text-sm">Special Instructions:</span>

                      <p className="text-sm text-gray-700 mt-1">{eventInfo.specialInstructions}</p>

                    </div>

                  )}

                </div>



                {/* Shipping Summary */}

                <div className="mb-6">

                  <h3 className="font-semibold mb-3">Shipping Address</h3>

                  <div className="text-sm text-gray-700">

                    <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>

                    <p>{shippingInfo.address}</p>

                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.pincode}</p>

                    <p>{shippingInfo.phone}</p>

                  </div>

                </div>



                <button

                  onClick={() => navigate('/order-confirmation')}

                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"

                >

                  Confirm Order (₹{total.toFixed(2)})

                </button>

              </div>

            )}

          </div>



          {/* Order Summary */}

          <div className="lg:col-span-1">

            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">

              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              

              <div className="space-y-3 mb-4">

                {cartItems.map(item => (

                  <div key={item.cartItemId} className="flex gap-3">

                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">

                      {item.thumbnail ? (

                        <img 
                          src={
                            item.thumbnail.startsWith('http') 
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

                          <span className="text-xs text-gray-500">No Image</span>

                        </div>

                      )}

                    </div>

                    <div className="flex-1">

                      <h3 className="font-medium text-sm">{item.name}</h3>

                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>

                      {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}

                    </div>

                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>

                  </div>

                ))}

              </div>

              

              <div className="border-t pt-4 space-y-2">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">Subtotal</span>

                  <span>₹{subtotal.toFixed(2)}</span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">Shipping</span>

                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">Tax (18% GST)</span>

                  <span>₹{tax.toFixed(2)}</span>

                </div>

                {setupCharges > 0 && (

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-600">Setup Service</span>

                    <span>₹{setupCharges.toFixed(2)}</span>

                  </div>

                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}

              </div>

              

              <div className="border-t pt-4 mb-4">

                <div className="flex justify-between">

                  <span className="text-lg font-semibold">Total</span>

                  <span className="text-lg font-bold text-red-500">₹{total.toFixed(2)}</span>

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
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-green-600" />
                  Have a coupon?
                </h3>
                
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
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

