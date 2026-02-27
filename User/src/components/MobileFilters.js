import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const MobileFilters = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  priceRange, 
  setPriceRange, 
  sortBy, 
  setSortBy, 
  showFeaturedOnly, 
  setShowFeaturedOnly,
  loading 
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    sort: true,
    featured: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <span className="font-medium">Filters</span>
          </div>
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filter Sections */}
            <div className="p-4 space-y-6">
              {/* Categories */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('category')}
                  className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Categories</span>
                  {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.category && (
                  <div className="p-4 bg-white">
                    {loading ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category._id || category.id} value={category._id || category.id}>
                            {category.name || category.category_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Price Range</span>
                  {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.price && (
                  <div className="p-4 bg-white">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Min: ₹{priceRange[0].toLocaleString()}</span>
                        <span className="text-gray-600">Max: ₹{priceRange[1].toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sort By */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('sort')}
                  className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Sort By</span>
                  {expandedSections.sort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.sort && (
                  <div className="p-4 bg-white">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Featured Only */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('featured')}
                  className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Featured Products</span>
                  {expandedSections.featured ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.featured && (
                  <div className="p-4 bg-white">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show only featured products</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilters;
