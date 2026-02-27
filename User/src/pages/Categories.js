import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import EmptyState from '../components/EmptyState';
import categoryService from '../services/categoryService';
import { ArrowRight, Grid, List, Search, Filter, Sparkles } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await categoryService.getCategories();
        const categoriesData = fetchedCategories?.categories || [];
        
        // If API returns empty or fails, use fallback data
        if (categoriesData.length === 0) {
          console.log('No categories from API, using fallback data');
          const fallbackCategories = [
            { id: 1, name: 'Birthday Decorations', description: 'Everything for birthday celebrations', image: null },
            { id: 2, name: 'Wedding Decorations', description: 'Beautiful wedding decoration items', image: null },
            { id: 3, name: 'Party Supplies', description: 'Party essentials and supplies', image: null },
            { id: 4, name: 'Festival Decorations', description: 'Festival and seasonal decorations', image: null }
          ];
          setCategories(fallbackCategories);
          setFilteredCategories(fallbackCategories);
        } else {
          setCategories(categoriesData);
          setFilteredCategories(categoriesData);
        }
        
        console.log('Categories fetched:', fetchedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        
        // Use fallback data on error
        const fallbackCategories = [
          { id: 1, name: 'Birthday Decorations', description: 'Everything for birthday celebrations', image: null },
          { id: 2, name: 'Wedding Decorations', description: 'Beautiful wedding decoration items', image: null },
          { id: 3, name: 'Party Supplies', description: 'Party essentials and supplies', image: null },
          { id: 4, name: 'Festival Decorations', description: 'Festival and seasonal decorations', image: null }
        ];
        
        setCategories(fallbackCategories);
        setFilteredCategories(fallbackCategories);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-indigo-600 rounded-sm animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <EmptyState 
            type="error"
            title="Failed to load categories"
            description="We couldn't load the categories. Please try again."
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-600 rounded-sm"></div>
            <h1 className="text-2xl font-bold text-gray-900">All Categories</h1>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Categories Display */}
        {filteredCategories.length === 0 ? (
          <EmptyState 
            type="search"
            title="No categories found"
            description={searchTerm ? `No categories match "${searchTerm}"` : "No categories available at the moment."}
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <Link
                    key={category.id || category._id}
                    to={`/products?category=${category.id || category._id}`}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative block"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-slate-100 rounded-xl mx-auto mb-4 group-hover:scale-110 transition duration-300 flex items-center justify-center overflow-hidden">
                      {category.image ? (
                        <img
                          src={category.image.startsWith('data:') ? category.image : category.image.startsWith('http') ? category.image : `${process.env.REACT_APP_IMAGE_BASE_URL}${category.image}`}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: category.image ? 'none' : 'flex' }}>
                        <Sparkles className="text-indigo-400" size={32} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-center mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm text-center line-clamp-2 mb-3">{category.description}</p>
                    )}
                    <div className="flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Shop Now
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                    {category.homeCategory && (
                      <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <Link
                    key={category.id || category._id}
                    to={`/products?category=${category.id || category._id}`}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex gap-6 relative block"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {category.image ? (
                        <img
                          src={category.image.startsWith('data:') ? category.image : category.image.startsWith('http') ? category.image : `${process.env.REACT_APP_IMAGE_BASE_URL}${category.image}`}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: category.image ? 'none' : 'flex' }}>
                        <Sparkles className="text-indigo-400" size={32} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.name}</h3>
                          {category.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>
                          )}
                          <div className="flex items-center gap-4">
                            <span className="text-indigo-600 font-medium flex items-center gap-1">
                              Shop Products
                              <ArrowRight size={16} />
                            </span>
                            {category.homeCategory && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                Featured Category
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;
