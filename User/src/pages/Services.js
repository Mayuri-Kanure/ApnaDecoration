import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BookingModal from '../components/BookingModal';
import serviceService from '../services/serviceService';
import serviceCategoryService from '../services/serviceCategoryService';
import { useCart } from '../contexts/CartContext';
import { Search, Grid, List, Star, Clock, Heart, ChevronLeft } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [, forceUpdate] = useState({});
  
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useCart();

  // Fetch services and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Services Page: Fetching services...');
        
        const [servicesRes, categoriesRes] = await Promise.all([
          serviceService.getServices(),
          serviceCategoryService.getPublicServiceCategories()
        ]);
        
        console.log('🔍 Services Page: Services response:', servicesRes);
        console.log('🔍 Services Page: Categories response:', categoriesRes);
        
        const servicesData = Array.isArray(servicesRes?.services) ? servicesRes.services : 
                           Array.isArray(servicesRes?.data) ? servicesRes.data :
                           Array.isArray(servicesRes) ? servicesRes : [];
        const categoriesData = categoriesRes?.categories || categoriesRes?.data || [];
        
        console.log('🔍 Services Page: Processed services:', servicesData);
        console.log('🔍 Services Page: Processed categories:', categoriesData);
        
        setServices(servicesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('❌ Services Page: Failed to fetch services:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle booking
  const handleBookNow = (service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    console.log('Booking created:', booking);
    // You can add additional success handling here
  };

  // Handle wishlist
  const handleWishlist = async (e, service) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(service.id || service._id)) {
      await removeFromWishlist(service.id || service._id);
    } else {
      await addToWishlist(service);
    }
    forceUpdate({});
  };

  // Close booking modal
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  // Filter services
  const filteredServices = (Array.isArray(services) ? services : []).filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           service.category?._id === selectedCategory ||
                           service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <EmptyState 
            type="error"
            title="Failed to load services"
            description="We couldn't load our services. Please try again."
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link 
          to="/service-categories" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          Back to Service Categories
        </Link>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional decoration services for all your special occasions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id || category._id} value={category.id || category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid size={16} /> Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List size={16} /> List
              </button>
            </div>
          </div>
        </div>

        {/* Services */}
        {filteredServices.length === 0 ? (
          <EmptyState 
            type="search"
            title="No services found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {filteredServices.map(service => (
              <Link
                to={`/service/${service._id || service.id}`}
                key={service.id || service._id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow block ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {service.image && (
                  <div className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'h-48'}>
                    <img
                      src={service.image.startsWith('data:') ? service.image : service.image.startsWith('http') ? service.image : `${process.env.REACT_APP_IMAGE_BASE_URL}${service.image}`}
                      alt={service.name}
                      className="w-full h-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {service.bannerImage && !service.image && (
                  <div className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'h-48'}>
                    <img
                      src={service.bannerImage.startsWith('data:') ? service.bannerImage : service.bannerImage.startsWith('http') ? service.bannerImage : `${process.env.REACT_APP_IMAGE_BASE_URL}${service.bannerImage}`}
                      alt={service.name}
                      className="w-full h-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {service.images && service.images.length > 0 && !service.image && !service.bannerImage && (
                  <div className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'h-48'}>
                    <img
                      src={service.images[0].startsWith('data:') ? service.images[0] : service.images[0].startsWith('http') ? service.images[0] : `${process.env.REACT_APP_IMAGE_BASE_URL}${service.images[0]}`}
                      alt={service.name}
                      className="w-full h-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                      {service.category && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                          {service.category.name || 'Service'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleWishlist(e, service)}
                        className={`p-2 rounded-lg transition-colors ${
                          isInWishlist(service.id || service._id)
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                        }`}
                        title={isInWishlist(service.id || service._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart 
                          size={16} 
                          fill={isInWishlist(service.id || service._id) ? 'currentColor' : 'none'}
                        />
                      </button>
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{service.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-indigo-600">
                      ₹{service.price || 'Contact'}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleBookNow(service);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                  
                  {service.duration && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>{service.duration}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        service={selectedService}
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default Services;
