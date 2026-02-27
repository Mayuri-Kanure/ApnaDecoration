import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useCart } from '../contexts/CartContext';
import { Search, Filter, Grid, List, Star, Heart, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Slider,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip
} from '@mui/material';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const { addToCart, isInWishlist, addToWishlist, removeFromWishlist } = useCart();

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api` : 'https://user-api.apnadecoration.com/api';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchSuggestions(query);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Enhanced search function
  const performSearch = useCallback(async (searchQuery, page = 1, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page,
        limit: 20,
        category: filters.category || selectedCategory,
        minPrice: filters.minPrice || priceRange[0],
        maxPrice: filters.maxPrice || priceRange[1],
        minRating: filters.minRating || ratingFilter,
        sortBy: filters.sortBy || sortBy,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/products/search?${params}`);
      const data = await response.json();
      
      if (page === 1) {
        setSearchResults(data.products || []);
        setTotalResults(data.total || 0);
      } else {
        setSearchResults(prev => [...prev, ...(data.products || [])]);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search products. Please try again.');
      setNotification({
        open: true,
        message: 'Failed to search products. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, priceRange, ratingFilter, sortBy]);

  // Load more results
  const loadMoreResults = () => {
    if (!loading && searchResults.length < totalResults) {
      performSearch(query, currentPage + 1);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    performSearch(query, 1, {
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating: ratingFilter,
      sortBy: sortBy
    });
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setRatingFilter(0);
    setSortBy('relevance');
    setCurrentPage(1);
    performSearch(query, 1);
    setShowFilters(false);
  };

  // Sort results
  const sortResults = (results, sortOption) => {
    const sorted = [...results];
    
    switch (sortOption) {
      case 'price-low-high':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating-high-low':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-low-high':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'name-a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return sorted;
    }
  };

  // Initial search effect
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchParams({ q: newQuery });
    setCurrentPage(1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchParams({ q: suggestion });
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    performSearch(query, 1, { sortBy: newSortBy });
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    performSearch(query, 1, { category });
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product) => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        setNotification({
          open: true,
          message: 'Removed from wishlist',
          severity: 'success'
        });
      } else {
        await addToWishlist(product);
        setNotification({
          open: true,
          message: 'Added to wishlist',
          severity: 'success'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to update wishlist',
        severity: 'error'
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      setNotification({
        open: true,
        message: 'Added to cart',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to add to cart',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Navigation />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', pt: 2 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
          {/* Search Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Search Products
            </Typography>
            
            {/* Search Input */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for products..."
                value={query}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={20} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ backgroundColor: 'white' }}
              />
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <Box sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  boxShadow: 3,
                  zIndex: 1000,
                  maxHeight: 300,
                  overflowY: 'auto'
                }}>
                  {suggestions.map((suggestion, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f8fafc' }
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Typography variant="body2">{suggestion}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Quick Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price-low-high">Price: Low to High</MenuItem>
                  <MenuItem value="price-high-low">Price: High to Low</MenuItem>
                  <MenuItem value="rating-high-low">Rating: High to Low</MenuItem>
                  <MenuItem value="name-a-z">Name: A to Z</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Grid size={16} />}
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'inherit'}
                >
                  Grid
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<List size={16} />}
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'inherit'}
                >
                  List
                </Button>
              </Box>
            </Box>

            {/* Results Summary */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="#64748b">
                {totalResults > 0 ? `Found ${totalResults} products` : 'No products found'}
              </Typography>
              {query && (
                <Typography variant="body2" color="#64748b">
                  Searching for: "{query}"
                </Typography>
              )}
            </Box>
          </Box>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Advanced Filters</Typography>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {/* Price Range */}
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                    </Typography>
                    <Slider
                      value={priceRange}
                      onChange={(e, newValue) => setPriceRange(newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={10000}
                      step={100}
                      marks={[
                        { value: 0, label: '₹0' },
                        { value: 5000, label: '₹5K' },
                        { value: 10000, label: '₹10K' }
                      ]}
                    />
                  </Box>

                  {/* Rating Filter */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Minimum Rating: {ratingFilter}+ Stars
                    </Typography>
                    <Slider
                      value={ratingFilter}
                      onChange={(e, newValue) => setRatingFilter(newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5}
                      step={1}
                      marks={[
                        { value: 0, label: 'All' },
                        { value: 3, label: '3+' },
                        { value: 4, label: '4+' },
                        { value: 5, label: '5' }
                      ]}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button variant="contained" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                  <Button variant="outlined" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Search Results */}
          {!loading && !error && (
            <>
              {searchResults.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' 
                      ? { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
                      : '1fr',
                    gap: 3
                  }}
                >
                  {searchResults.map((product) => (
                    <Card key={product._id} sx={{ height: 'fit-content' }}>
                      <CardContent>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={product.thumbnail || product.image || '/api/placeholder/300/300'}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: viewMode === 'grid' ? 200 : 100,
                              objectFit: 'cover',
                              borderRadius: 8
                            }}
                          />
                          {product.stock <= 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              Out of Stock
                            </Box>
                          )}
                        </Box>

                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                          {product.name}
                        </Typography>

                        <Typography variant="body2" color="#64748b" sx={{ mb: 1 }}>
                          {product.description?.substring(0, 100)}...
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" color="#1976d2" fontWeight="bold">
                            ₹{product.price}
                          </Typography>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <Typography
                              variant="body2"
                              color="#9ca3af"
                              sx={{ ml: 1, textDecoration: 'line-through' }}
                            >
                              ₹{product.originalPrice}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Star size={16} fill="#fbbf24" color="#fbbf24" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {product.rating || 0} ({product.reviews || 0} reviews)
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ShoppingBag size={16} />}
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            sx={{ flex: 1 }}
                          >
                            Add to Cart
                          </Button>
                          <IconButton
                            onClick={() => handleWishlistToggle(product)}
                            color={isInWishlist(product.id) ? 'error' : 'default'}
                          >
                            <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="#64748b" sx={{ mb: 2 }}>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="#9ca3af">
                    Try adjusting your search terms or filters
                  </Typography>
                </Box>
              )}

              {/* Load More Button */}
              {searchResults.length > 0 && searchResults.length < totalResults && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={loadMoreResults}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SearchPage;
