import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ChevronLeft, Calendar, User as UserIcon, Phone, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { API_BASE_URL, PRODUCT_API_URL, IMAGE_BASE_URL } from '../config/constants';

const ServiceDetail = () => {
  const { id } = useParams();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useCart();
  const { success, error: showError } = useToast();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    address: '',
    message: '',
    referenceImage: null
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${PRODUCT_API_URL}/services/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setService(data.data);
        } else {
          showError('Service not found');
        }
      } catch (error) {
        console.error('Failed to fetch service:', error);
        showError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.date) {
      showError('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('service', service._id);
      formData.append('serviceName', service.name);
      formData.append('customerName', bookingData.name);
      formData.append('customerEmail', bookingData.email);
      formData.append('customerPhone', bookingData.phone);
      formData.append('preferredDate', bookingData.date);
      formData.append('message', bookingData.message);
      
      if (bookingData.referenceImage) {
        formData.append('referenceImage', bookingData.referenceImage);
      }

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        success('Booking request submitted successfully! We will contact you soon.');
        setShowBookingForm(false);
        setBookingData({ name: '', email: '', phone: '', date: '', time: '', address: '', message: '', referenceImage: null });
      } else {
        showError(data.message || 'Failed to submit booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      showError('Failed to submit booking');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookingData(prev => ({ ...prev, referenceImage: file }));
    }
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddToCart = async () => {
    if (!service) return;
    
    try {
      await addToCart(service);
      success(`${service.name} added to cart!`);
    } catch (err) {
      showError('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!service) return;
    
    try {
      if (isInWishlist(service._id)) {
        await removeFromWishlist(service._id);
        success(`Removed from wishlist!`);
      } else {
        await addToWishlist(service);
        success(`Added to wishlist!`);
      }
      forceUpdate({});
    } catch (err) {
      showError('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
          <Link to="/services" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-4">
        <Link 
          to="/services" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          Back to Services
        </Link>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-red-500">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-red-500">Services</Link>
          <span>/</span>
          <span className="text-gray-900">{service.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {service.bannerImage ? (
                <img 
                  src={
                    service.bannerImage.startsWith('https://') 
                      ? service.bannerImage
                      : service.bannerImage.startsWith('http://')
                        ? service.bannerImage
                        : `${IMAGE_BASE_URL}${service.bannerImage}`
                  }
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {service.serviceType}
                </span>
                {service.availability && (
                  <span className="text-sm text-green-600">Available</span>
                )}
                {service.customizationAvailable && (
                  <span className="text-sm text-purple-600">Customizable</span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-red-500">₹{service.price}</span>
              </div>

              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={!service.availability}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !service.availability 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Add to Cart
              </button>
              
              <button 
                onClick={handleToggleWishlist}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Heart 
                  size={20} 
                  className={isInWishlist(service._id) ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
                />
              </button>
            </div>

            {/* Booking Form Modal */}
            {showBookingForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Book Service</h3>
                        <div className="space-y-1">
                          <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <p className="text-xl font-bold text-red-500">₹{service.price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowBookingForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                          <input
                            type="date"
                            value={bookingData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="dd-mm-yyyy"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option>Select time</option>
                            <option>Morning (9 AM - 12 PM)</option>
                            <option>Afternoon (12 PM - 4 PM)</option>
                            <option>Evening (4 PM - 8 PM)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference Image (Optional)</label>
                        <p className="text-xs text-gray-500 mb-2">Upload a reference image to help us understand your decoration requirements better</p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                          <input type="file" className="hidden" id="reference-image" accept="image/*" onChange={handleImageChange} />
                          <label htmlFor="reference-image" className="cursor-pointer">
                            <div className="text-gray-600">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-sm font-medium">Upload Reference Image</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-semibold mb-3">Customer Information</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                              type="text"
                              value={bookingData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Your full name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                              type="email"
                              value={bookingData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="your.email@example.com"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input
                              type="tel"
                              value={bookingData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="+91 98765 43210"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Your address for service delivery"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                            <textarea
                              value={bookingData.message}
                              onChange={(e) => handleInputChange('message', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Any special requirements..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowBookingForm(false)}
                          className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar size={20} />
                <span>Flexible booking dates</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={20} />
                <span>24/7 customer support</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <UserIcon size={20} />
                <span>Professional service team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ServiceDetail;
