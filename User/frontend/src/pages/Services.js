import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import BookingModal from "../components/BookingModal";
import serviceService from "../services/serviceService";
import serviceCategoryService from "../services/serviceCategoryService";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../contexts/ProductContext";
import { Search, Star, Clock, Heart, ChevronLeft } from "lucide-react";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [, forceUpdate] = useState({});
  const [searchResults, setSearchResults] = useState({ services: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const searchRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } =
    useCart();
  const { services: contextServices, loading: contextLoading } = useProducts();

  // Use services from context and fetch categories separately
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("Using services from context, fetching categories...");

        // Use services from context
        setServices(contextServices);

        // Fetch categories separately
        const categoriesRes =
          await serviceCategoryService.getPublicServiceCategories();

        console.log("Services from context:", contextServices);
        console.log("Categories response:", categoriesRes);

        const categoriesData = Array.isArray(categoriesRes)
          ? categoriesRes
          : categoriesRes?.data || categoriesRes?.categories || [];

        console.log("Setting services:", contextServices);
        console.log("Setting categories:", categoriesData);

        setServices(contextServices);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");

        // Set fallback data
        setServices(contextServices);
        setCategories([
          { id: "all", name: "All Categories" },
          { id: "decoration", name: "Decoration" },
          { id: "planning", name: "Event Planning" },
          { id: "photography", name: "Photography" },
          { id: "catering", name: "Catering" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (contextServices.length > 0 || !contextLoading) {
      fetchData();
    }
  }, [contextServices, contextLoading]);

  // Handle booking
  const handleBookNow = (service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    console.log("Booking created:", booking);
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

  // Helper function to get category name from ID
  const getCategoryNameFromId = (id) => {
    return categories.find((cat) => (cat.id || cat._id).toString() === id)
      ?.name;
  };

  // Popular search suggestions
  const popularSearches = [
    "Birthday Decoration",
    "Wedding Flowers",
    "Anniversary Gifts",
    "Party Lights",
    "Festive Decor",
  ];

  // Search functionality
  useEffect(() => {
    if (debouncedSearchTerm.trim().length > 0) {
      performSearch(debouncedSearchTerm);
    } else {
      setSearchResults({ services: [] });
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (term) => {
    try {
      setSearchLoading(true);
      console.log("Searching for:", term);

      // Filter services locally (like Navigation does for products)
      const searchLower = term.toLowerCase();
      const filteredServices = services
        .filter(
          (service) =>
            service.name?.toLowerCase().includes(searchLower) ||
            service.description?.toLowerCase().includes(searchLower) ||
            service.category?.name?.toLowerCase().includes(searchLower) ||
            service.category_name?.toLowerCase().includes(searchLower),
        )
        .slice(0, 5); // Show max 5 results

      console.log("Search results:", filteredServices);
      setSearchResults({ services: filteredServices });
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({ services: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter services
  const filteredServices = (Array.isArray(services) ? services : []).filter(
    (service) => {
      // Enhanced search - search in name, description, and category
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        service.name?.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower) ||
        service.category?.name?.toLowerCase().includes(searchLower) ||
        service.category_name?.toLowerCase().includes(searchLower);

      // Debug: Check if services have category data in different fields
      const serviceCategoryData = {
        category: service.category,
        category_id: service.category_id,
        categoryName: service.category_name,
        categoryId: service.categoryId,
        serviceType: service.type,
        fullService: service,
      };

      // Try to match by category if data exists
      const selectedCategoryName = getCategoryNameFromId(selectedCategory);
      const matchesCategory =
        selectedCategory === "all" ||
        // Check multiple possible category fields
        service.category?.name === selectedCategoryName ||
        service.category_name === selectedCategoryName ||
        service.category_id?.toString() === selectedCategory ||
        service.categoryId?.toString() === selectedCategory ||
        (typeof service.category === "string" &&
          service.category === selectedCategoryName);

      // Debug logging
      console.log(`Category Filter Debug:`, {
        selectedCategory,
        selectedCategoryName,
        serviceCategoryData,
        matchesCategory,
        serviceName: service.name,
        searchTerm,
        totalServices: services.length,
      });

      return matchesSearch && matchesCategory;
    },
  );

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === "price-low") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === "price-high") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    // Default: featured (no sorting)
    return 0;
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
    <>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        {/* Back Button */}
        <div className="w-full px-4 lg:px-6 py-4">
          <Link
            to="/service-categories"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            Back to Service Categories
          </Link>
        </div>

        <div className="w-full px-4 lg:px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional decoration services for all your special occasions
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
              {/* Search */}
              <div className="relative flex-1 w-full lg:w-auto" ref={searchRef}>
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onBlur={() =>
                    setTimeout(() => setSearchDropdownOpen(false), 200)
                  }
                  className="w-full lg:w-96 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white shadow-sm"
                />

                {/* Search Dropdown */}
                {searchDropdownOpen && searchRef.current && (
                  <div
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999] max-h-96 overflow-y-auto"
                    style={{
                      top: searchRef.current.getBoundingClientRect().bottom + 8,
                      left: searchRef.current.getBoundingClientRect().left,
                      width: searchRef.current.offsetWidth,
                    }}
                  >
                    {searchLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Searching...
                      </div>
                    ) : (
                      <>
                        {/* Search Results */}
                        {searchResults.services.length > 0 && (
                          <div className="border-b border-gray-100">
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Services
                            </div>
                            {searchResults.services.map((service) => (
                              <Link
                                key={service.id || service._id}
                                to={`/service/${service._id || service.id}`}
                                className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                  setSearchTerm(service.name);
                                  setSearchDropdownOpen(false);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">
                                      {service.name}
                                    </div>
                                    {service.description && (
                                      <div className="text-xs text-gray-500 mt-1 truncate">
                                        {service.description}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    <svg
                                      className="w-4 h-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Popular Searches */}
                        {searchResults.services.length === 0 &&
                          searchTerm.trim() === "" && (
                            <div>
                              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Popular Searches
                              </div>
                              {popularSearches.map((search, index) => (
                                <button
                                  key={index}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                  onClick={() => {
                                    setSearchTerm(search);
                                    setSearchDropdownOpen(false);
                                  }}
                                >
                                  <Search size={16} className="text-gray-400" />
                                  <span className="text-sm text-gray-700">
                                    {search}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                        {/* No Results */}
                        {searchResults.services.length === 0 &&
                          searchTerm.trim() !== "" && (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No services found for "{searchTerm}"
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full lg:w-56 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white shadow-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option
                    key={category.id || category._id}
                    value={category.id || category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full lg:w-56 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white shadow-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services */}
        {sortedServices.length === 0 ? (
          <EmptyState
            type="search"
            title="No services found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {sortedServices.map((service) => (
              <Link
                to={`/service/${service._id || service.id}`}
                key={service.id || service._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow block h-full flex flex-col"
              >
                {service.thumbnail ? (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={
                        service.thumbnail.startsWith("data:")
                          ? service.thumbnail
                          : service.thumbnail.startsWith("http")
                            ? service.thumbnail
                            : `${process.env.REACT_APP_IMAGE_BASE_URL}${service.thumbnail}`
                      }
                      alt={service.name}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg
                        className="w-12 h-12 mx-auto mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm">No Image</p>
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 min-h-[56px] line-clamp-2">
                        {service.name}
                      </h3>
                      {service.category && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                          {service.category?.name ||
                            service.category_name ||
                            "Service"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleWishlist(e, service)}
                        className={`p-2 rounded-lg transition-colors ${
                          isInWishlist(service.id || service._id)
                            ? "text-red-500 bg-red-50 hover:bg-red-100"
                            : "text-gray-400 bg-gray-50 hover:bg-gray-100"
                        }`}
                        title={
                          isInWishlist(service.id || service._id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          size={16}
                          fill={
                            isInWishlist(service.id || service._id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star
                            size={16}
                            className="text-yellow-400 fill-current"
                          />
                          <span className="text-sm text-gray-600">
                            {service.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3 min-h-[72px]">
                    {service.description}
                  </p>

                  <div className="space-y-4 mt-auto">
                    <div className="text-2xl font-bold text-indigo-600 min-h-[36px]">
                      {service.price ? `₹${service.price}` : "Contact"}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleBookNow(service);
                      }}
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Book Now
                    </button>

                    {service.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>{service.duration}</span>
                      </div>
                    )}
                  </div>
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
    </>
  );
};

export default Services;
