import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import serviceCategoryService from '../services/serviceCategoryService';
import { Search, Grid, List, Star, Clock, Users, Sparkles, TrendingUp, ArrowRight, ChevronLeft } from 'lucide-react';
import '../components/ServiceCategories.css';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch all service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await serviceCategoryService.getPublicServiceCategories();
        console.log('📊 ServiceCategories API Response:', response);
        const categories = response?.categories || response?.data || response || [];
        console.log('📊 ServiceCategories extracted:', categories);
        console.log('📊 ServiceCategories count:', categories.length);
        setCategories(categories);
      } catch (err) {
        console.error('Failed to fetch service categories:', err);
        setError('Failed to load service categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get category stats (mock data for now)
  const getCategoryStats = (category) => {
    const stats = {
      services: Math.floor(Math.random() * 20) + 5,
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviews: Math.floor(Math.random() * 100) + 10,
      popular: Math.random() > 0.7
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg animate-pulse">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-3 bg-gray-100 rounded mx-auto w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <EmptyState 
            type="error"
            title="Failed to load service categories"
            description="We couldn't load the service categories. Please try again."
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Professional Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            Professional Event Services
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Service Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our premium decoration services tailored for weddings, birthdays, corporate events, and special occasions
          </p>
        </div>

        {/* Professional Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  placeholder="Search professional services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-6 py-4 rounded-xl flex items-center gap-2 font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid size={18} /> Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-4 rounded-xl flex items-center gap-2 font-medium transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List size={18} /> List View
              </button>
            </div>
          </div>
        </div>

        {/* Professional Categories */}
        {filteredCategories.length === 0 ? (
          <EmptyState 
            type="search"
            title="No service categories found"
            description="Try adjusting your search terms"
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
            {filteredCategories.map((category) => {
              const stats = getCategoryStats(category);
              return (
                <Link
                  key={category.id || category._id}
                  to={`/services?category=${category.id || category._id}`}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group ${
                    viewMode === 'list' ? 'flex items-center gap-8 p-8' : 'p-8'
                  }`}
                >
                  {/* Category Image */}
                  <div className={`${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'w-24 h-24 mx-auto mb-6'} bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                    {category.image ? (
                      <Fragment>
                        <img 
                          src={category.image.startsWith('data:') ? category.image : category.image.startsWith('http') ? category.image : category.image}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-2xl"
                          onLoad={() => console.log(`✅ Image loaded: ${category.name} -> ${category.image}`)}
                          onError={(e) => {
                            console.error(`❌ Image failed: ${category.name} -> ${category.image}`);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      </Fragment>
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center" style={{ display: category.image ? 'none' : 'flex' }}>
                      <Sparkles className="text-purple-400" size={32} />
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {category.name}
                      </h3>
                      {stats.popular && (
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{stats.services} Services</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-current" />
                        <span>{stats.rating}</span>
                        <span>({stats.reviews})</span>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="flex items-center justify-between">
                      <span className="text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                        Explore Services
                      </span>
                      <ArrowRight size={18} className="text-purple-600 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Professional Results Count */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <span className="text-gray-600">Showing</span>
            <span className="font-bold text-purple-600">{filteredCategories.length}</span>
            <span className="text-gray-600">of</span>
            <span className="font-bold text-purple-600">{categories.length}</span>
            <span className="text-gray-600">professional service categories</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceCategories;
