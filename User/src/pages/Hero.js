import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart, 
  Heart, 
  Star, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Shield,
  Zap,
  Clock,
  Package,
  Timer
} from 'lucide-react';
import { IMAGE_BASE_URL, API_BASE_URL } from '../config/constants';
import apiService from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import categoryService from '../services/categoryService';
import serviceService from '../services/serviceService';
import serviceCategoryService from '../services/serviceCategoryService';
import { useProducts } from '../contexts/ProductContext';
import { isClearanceSaleDataActive } from '../utils/clearanceSale';

const FALLBACK_IMAGE = 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770901463/apna-decoration/service-categories/1770901461463-4u587m.jpg';

// Countdown Timer Component
const CountdownTimer = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  return (
    <div className="flex items-center text-sm text-red-600 font-semibold">
      <Timer className="mr-1" size={14} />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

const Hero = () => {
  const { featuredProducts, loading, error } = useProducts();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [clearanceProducts, setClearanceProducts] = useState([]);
  const [clearanceData, setClearanceData] = useState(null);
  const [clearanceLoading, setClearanceLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [serviceCategoriesLoading, setServiceCategoriesLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const { success, error: showError } = useToast();
  
  // Check if clearance sale is active
  const isClearanceActive = isClearanceSaleDataActive(clearanceData);
  
  // 🔐 Guards against multiple API calls
  const bannersLoadedRef = useRef(false);
  const categoriesLoadedRef = useRef(false);
  const serviceCategoriesLoadedRef = useRef(false);

  // Fetch real clearance products and clearance data
  useEffect(() => {
    const fetchClearanceData = async () => {
      try {
        setClearanceLoading(true);
        
        // Fetch clearance products
        const productsResponse = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/clearance-sale/products`);
        const productsData = await productsResponse.json();
        setClearanceProducts(productsData.data || []);
        
        // Fetch clearance sale data (includes end date)
        const clearanceResponse = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/clearance-sale/public`);
        const clearanceSaleData = await clearanceResponse.json();
        setClearanceData(clearanceSaleData.data);
        
        console.log('🔍 Clearance sale data:', clearanceSaleData.data);
        setClearanceLoading(false);
      } catch (error) {
        console.error('❌ Error fetching clearance data:', error);
        setClearanceLoading(false);
      }
    };

    fetchClearanceData();
  }, []);

  // Remove mock data - only use real banners from backend
  // const heroSlides = [
  //   {
  //     id: 1,
  //     image: 'https://picsum.photos/800/400?random=1',
  //     title: 'Welcome to Apna Decoration',
  //     subtitle: 'Transform your home with our beautiful decorations'
  //   },
  //   {
  //     id: 2,
  //     image: 'https://picsum.photos/800/400?random=2',
  //     title: 'Special Offers',
  //     subtitle: 'Get up to 50% off on selected items'
  //   },
  //   {
  //     id: 3,
  //     image: 'https://picsum.photos/800/400?random=3',
  //     title: 'New Arrivals',
  //     subtitle: 'Check out our latest collection'
  //   }
  // ];

  // Handle image errors
  const handleImageError = (slideId) => {
    setImageErrors(prev => ({ ...prev, [slideId]: true }));
  };

  // Handle wishlist for featured products
  const handleWishlist = async (product, e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      if (isInWishlist(product.id || product._id)) {
        await removeFromWishlist(product.id || product._id);
        success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        success('Added to wishlist');
      }
    } catch (error) {
      showError('Failed to update wishlist');
    }
  };

  // Auto slide logic - only use real banners
  useEffect(() => {
    if (banners.length === 0) return; // Don't auto-slide if no banners
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  // Fetch banners from API with proper debouncing
  useEffect(() => {
    if (bannersLoadedRef.current) return;
    
    const timer = setTimeout(() => {
      bannersLoadedRef.current = true;
      
      const fetchBanners = async () => {
        try {
          console.log('🚀 Starting fetchBanners...');
          const fetchedBanners = await apiService.getBanners();
          console.log('📡 Raw banners response:', fetchedBanners);
          
          // Filter for published banners and transform to hero slides format
          const bannerArray = fetchedBanners?.banners || fetchedBanners || [];
          console.log('📊 Raw banner array from API:', bannerArray);
          console.log('📊 Raw banner count:', bannerArray.length);
          
          const heroSlidesFromDB = bannerArray
            .filter(banner => {
              const isPublished = banner.published || banner.published === true || banner.published === 'true' || banner.published === 1;
              console.log(`🔍 Banner ${banner._id}: published=${banner.published}, isPublished=${isPublished}`);
              return isPublished;
            })
            .map(banner => {
              let imageUrl = banner.image;
              
              // Simple and direct URL construction
              if (imageUrl) {
                // If it's already a full URL, use it as-is
                if (imageUrl.startsWith('http')) {
                  imageUrl = imageUrl;
                } else if (imageUrl.startsWith('/uploads')) {
                  // Local path - construct full URL
                  imageUrl = `${API_BASE_URL}${imageUrl}`;
                } else {
                  // Unknown format - use fallback
                  imageUrl = null;
                }
                
                console.log('🖼️ Banner URL:', {
                  original: banner.image,
                  final: imageUrl
                });
              }
              
              return {
                id: banner._id || banner.id,
                image: imageUrl || banner.bannerUrl,
                fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwiPkJhbm5lciBQcmludGluZzwvdGV4dD4KPHN2ZyB4PSIzMDAiIHk9IjIwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM2MzY2RjEiPgo8cmVjdCB4PSIzMjAiIHk9IjIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIHJ4PSI4IiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2NkYxIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+UHJpbnQ8L3RleHQ+Cjwvc3ZnPgo8L3N2Zz4=',
                title: banner.bannerType || 'Banner'
              };
            });
          
          console.log('🎯 Final hero slides from DB:', heroSlidesFromDB);
          console.log('🎯 Hero slides count:', heroSlidesFromDB.length);
          
          // Combine static slides with database slides
          const allSlides = [...heroSlidesFromDB];
          console.log('🔄 All slides after combining:', allSlides);
          console.log('🔄 Total slides count:', allSlides.length);
          console.log('🔄 Active slide:', activeSlide);
          console.log('🔄 Current slide data:', allSlides[activeSlide]);
          
          setBanners(allSlides);
          console.log('✅ Banners set in state:', allSlides.length, 'banners');
        } catch (err) {
          console.error('Failed to fetch banners:', err);
          // Use fallback banners if API fails
          setBanners([
            {
              id: 1,
              image: 'https://picsum.photos/1200/600?random=1',
              fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwiPkJhbm5lciBQcmludGluZzwvdGV4dD4KPHN2ZyB4PSIzMDAiIHk9IjIwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM2MzY2RjEiPgo8cmVjdCB4PSIzMjAiIHk9IjIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIHJ4PSI4IiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2NkYxIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+UHJpbnQ8L3RleHQ+Cjwvc3ZnPgo8L3N2Zz4=',
              title: 'Main Banner'
            }
          ]);
        }
      };

      fetchBanners();
    }, 100); // 100ms delay for banners

    return () => clearTimeout(timer);
  }, []);

  // Fetch categories from API with debouncing
  useEffect(() => {
    if (categoriesLoadedRef.current) return;
    
    const timer = setTimeout(() => {
      categoriesLoadedRef.current = true;
      
      const fetchCategories = async () => {
        try {
          setCategoriesLoading(true);
          const fetchedCategories = await categoryService.getHomeCategories();
          setCategories(fetchedCategories?.categories || []);
          // console.log('Categories fetched for homepage:', fetchedCategories); // Removed for production
        } catch (err) {
          console.error('Failed to fetch categories:', err);
          // If categoryService fails, set fallback categories directly
          const fallbackCategories = [
            { id: 'furniture', name: 'Furniture', priority: 1, homeCategory: true },
            { id: 'decor', name: 'Decor', priority: 2, homeCategory: true },
            { id: 'lighting', name: 'Lighting', priority: 3, homeCategory: true },
            { id: 'textiles', name: 'Textiles', priority: 4, homeCategory: true },
            { id: 'accessories', name: 'Accessories', priority: 5, homeCategory: true },
            { id: 'electronics', name: 'Electronics', priority: 6, homeCategory: true }
          ];
          setCategories(fallbackCategories);
          // console.log('Using direct fallback categories:', fallbackCategories); // Removed for production
        } finally {
          setCategoriesLoading(false);
        }
      };

      fetchCategories();
    }, 500); // 500ms delay for categories

    return () => clearTimeout(timer);
  }, []);

  // Fetch service categories with debouncing
  useEffect(() => {
    if (serviceCategoriesLoadedRef.current) return;
    
    const timer = setTimeout(() => {
      serviceCategoriesLoadedRef.current = true;
      
      const fetchServiceCategories = async () => {
        try {
          setServiceCategoriesLoading(true);
          console.log('🔍 Fetching service categories...');
          const fetchedCategories = await serviceCategoryService.getPublicServiceCategories();
          console.log('📊 Service categories response:', fetchedCategories);
          const categories = fetchedCategories?.categories || fetchedCategories?.data || fetchedCategories || [];
          console.log('📊 Service categories count:', categories.length);
          console.log('📊 First service category:', categories[0]);
          console.log('📊 First service category image:', categories[0]?.image);
          console.log('📊 First service category ID:', categories[0]?._id || categories[0]?.id);
          console.log('📊 First service category full object:', categories[0]);
          
          // Ensure it's always an array and fix ID issue
          const processedCategories = Array.isArray(categories) ? categories.map(cat => ({
            ...cat,
            id: cat._id || cat.id || `category-${cat.name}`,
            serviceCategoryId: cat._id || cat.id || `category-${cat.name}`
          })) : [];
          
          setServiceCategories(processedCategories);
        } catch (err) {
          console.error('Failed to fetch service categories:', err);
          // Set fallback service categories
          const fallbackServiceCategories = [
            { id: 'anniversary', name: 'Anniversary', priority: 1, homeCategory: true, icon: 'favorite' },
            { id: 'proposal', name: 'Proposal', priority: 2, homeCategory: true, icon: 'favorite' },
            { id: 'party', name: 'Party', priority: 3, homeCategory: true, icon: 'celebration' },
            { id: 'wedding', name: 'Wedding', priority: 4, homeCategory: true, icon: 'favorite' },
            { id: 'festival', name: 'Festival', priority: 5, homeCategory: true, icon: 'celebration' },
            { id: 'office', name: 'Office', priority: 6, homeCategory: true, icon: 'business' }
          ];
          setServiceCategories(fallbackServiceCategories);
          // console.log('Using fallback service categories:', fallbackServiceCategories); // Removed for production
        } finally {
          setServiceCategoriesLoading(false);
        }
      };

      fetchServiceCategories();
    }, 1000); // 1000ms delay for service categories

    return () => clearTimeout(timer);
  }, []);

  // Navigation links with admin data
  const navLinks = ["Home", "Products", "Services", "About", "Contact", "Account"];
  
  return (
    <div className=" bg-gray-50 font-sans text-gray-800">
      <Navigation />

      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl overflow-hidden">
          
          {/* MAIN BANNER IMAGE */}
          <div className="w-full relative">
            {banners.length > 0 && banners[activeSlide]?.image ? (
              <img
                src={(() => {
                  const slide = banners[activeSlide];
                  let imgSrc = slide.image;
                  
                  // Handle if image is an object
                  if (typeof imgSrc === 'object' && imgSrc !== null) {
                    imgSrc = imgSrc.url || imgSrc.src || imgSrc.secure_url || Object.values(imgSrc)[0];
                  }
                  
                  // If still not a string, return null
                  if (typeof imgSrc !== 'string') {
                    console.warn('Invalid banner image format:', imgSrc);
                    return null;
                  }
                  
                  console.log('🖼️ Banner image src being rendered:', {
                    slideId: slide.id,
                    activeSlide,
                    totalSlides: banners.length,
                    imageSrc: imgSrc,
                    usingBackend: banners.length > 0,
                    timestamp: new Date().toISOString()
                  });
                  return imgSrc;
                })()}
                alt={`Banner slide ${banners[activeSlide]?.id}`}
                className="w-full h-64 md:h-96 lg:h-[500px] object-cover object-center transition-all duration-700 ease-in-out"
                style={{ 
                  imageRendering: '-webkit-optimize-contrast',
                  WebkitImageRendering: '-webkit-optimize-contrast',
                  transformOrigin: 'center'
                }}
                onLoad={() => {
                  console.log('✅ Banner image loaded successfully:', {
                    slideId: banners[activeSlide]?.id,
                    src: banners[activeSlide]?.image
                  });
                }}
                onError={(e) => {
                  console.error('❌ Banner image failed to load:', {
                    slideId: banners[activeSlide]?.id,
                    src: banners[activeSlide]?.image,
                    error: e.target.error?.message || 'Unknown error',
                    timestamp: new Date().toISOString()
                  });
                  handleImageError(banners[activeSlide]?.id);
                }}
                loading="eager"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              />
            ) : (
              <div className="w-full h-64 md:h-96 lg:h-[500px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <h2 className="text-2xl font-bold mb-2">Welcome to Apna Decoration</h2>
                  <p className="text-sm">Transform your home with our beautiful decorations</p>
                </div>
              </div>
            )}
            
           
            
            {/* HERO OVERLAY - Event-Focused Messaging */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                  {banners[activeSlide]?.title || 'Make Every Celebration Memorable'}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-md max-w-2xl mx-auto">
                  {banners[activeSlide]?.description || 'Professional decorations for Birthdays, Weddings, Anniversaries & Corporate Events'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/services"
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
                  >
                    Book Your Event
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((banner, index) => (
            <button
              key={`banner-${banner.id || banner._id || index}`}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${
                activeSlide === index
                  ? 'w-8 bg-indigo-600'
                  : 'w-2 bg-slate-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 🔥 Clearance Sale Section */}
      {isClearanceActive && (
        <section className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg my-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-full mb-4">
              <Zap className="mr-2" size={20} />
              <span className="font-bold text-lg">Clearance Sale</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Huge Discounts on Selected Decorations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Limited time offers on premium decoration items. Save up to 70% on selected products!
            </p>
            <div className="flex justify-center mb-8">
              <Link 
                to="/clearance-sale" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 inline-flex items-center"
              >
                <ShoppingCart className="mr-2" size={20} />
                View All Clearance Deals
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
          </div>
          
          {/* Featured Clearance Products Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clearanceLoading ? (
              // Loading skeleton
              [1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  </div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  </div>
                </div>
              ))
            ) : (
              clearanceProducts.slice(0, 4).map((product, index) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discountPercentage || 20}%
                      </span>
                    </div>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.thumbnail || product.images?.[0] ? (
                        <img
                          src={product.thumbnail || product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ IMAGE FAILED:', product.thumbnail || product.images?.[0]);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('✅ Clearance product image loaded:', product.name);
                          }}
                        />
                      ) : (
                        <>
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ShoppingCart className="text-gray-400" size={24} />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">{product.name}</h3>
                      
                      {/* Stock Indicator */}
                      {(product.stock !== undefined && product.stock <= 5) && (
                        <div className="flex items-center text-sm text-orange-600 font-semibold mb-2">
                          <Package className="mr-1" size={14} />
                          <span>Only {product.stock} left!</span>
                        </div>
                      )}
                      
                      {/* Pricing */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 line-through text-sm">₹{product.originalPrice?.toFixed(2)}</span>
                          <span className="text-xl font-bold text-red-600">₹{product.clearancePrice?.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Money Saved */}
                      <div className="flex items-center text-sm text-green-600 font-semibold mb-2">
                        <span>Save ₹{(product.originalPrice - product.clearancePrice)?.toFixed(2)}</span>
                      </div>
                      
                      {/* Countdown Timer */}
                      {product.saleEnds && (
                        <div className="mb-2">
                          <CountdownTimer expiryDate={product.saleEnds} />
                        </div>
                      )}
                      
                      {/* Limited Time Badge */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1" size={14} />
                        <span>Limited time offer</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Why Choose Us Section - Trust Elements */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're dedicated to making your celebrations unforgettable with professional service and quality decorations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">5+ Years Experience</h3>
            <p className="text-gray-600">Trusted by thousands of happy customers for their special moments</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2000+ Happy Customers</h3>
            <p className="text-gray-600">4.9/5 average rating from satisfied clients across all events</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Satisfaction Guarantee</h3>
            <p className="text-gray-600">We stand behind our work with a satisfaction promise</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Team</h3>
            <p className="text-gray-600">Expert decorators dedicated to making your event perfect</p>
          </div>
        </div>
      </section>

      {/* Clearance Sale Section */}
      {isClearanceActive && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-1">🔥 Clearance Sale</h2>
                    <p className="text-white/90 text-lg">Limited Time Offers - Up to 70% OFF!</p>
                  </div>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Don't miss out on amazing deals on selected products, services, and vendor items. 
                  Limited stock available - grab your favorites before they're gone!
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/clearance-sale"
                    className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Shop Now →
                  </Link>
                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Limited Time Only</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold mb-1">70%</div>
                  <div className="text-sm text-white/90">Max Discount</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold mb-1">100+</div>
                  <div className="text-sm text-white/90">Items</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  {clearanceData?.inhouseOffer?.endDate ? (
                    <>
                      <div className="text-3xl font-bold mb-1">
                        <CountdownTimer expiryDate={clearanceData.inhouseOffer.endDate} />
                      </div>
                      <div className="text-sm text-white/90">Left</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold mb-1">24h</div>
                      <div className="text-sm text-white/90">Left</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-indigo-600 rounded-sm animate-pulse"></div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonLoader key={index} type="product" />
              ))}
            </div>
          </div>
        ) : error ? (
          <EmptyState 
            type="error"
            title="Failed to load products"
            description="We couldn't load our featured products. Please try again."
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        ) : featuredProducts.length === 0 ? (
          <EmptyState 
            type="search"
            title="No featured products"
            description="Check back soon for our latest products."
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-indigo-600 rounded-sm"></div>
                <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              </div>
              <Link 
                to="/featured-products"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <Link 
                  key={`featured-product-${product.id || product._id || index}`} 
                  to={`/product/${product.id || product._id}`}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative block"
                  aria-label={`View ${product.name} details`}
                >
                  {product.discount && (
                    <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {product.discount}% OFF
                    </span>
                  )}
                  <span className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    Featured
                  </span>
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-indigo-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition duration-300">
                    {product.thumbnail && product.thumbnail.startsWith('http') ? (
                      <img 
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center" style={{ display: product.thumbnail && product.thumbnail.startsWith('http') ? 'none' : 'flex' }}>
                      <Sparkles className="text-indigo-400" size={32} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{product.name}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
                      {product.sku}
                    </span>
                    {product.inStock && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                        In Stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold text-lg">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-slate-400 line-through text-sm">${product.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-sm text-slate-600">{product.rating || 4.5}</span>
                    </div>
                    <button 
                      onClick={(e) => handleWishlist(product, e)}
                      className={`p-2 rounded-lg transition-colors ${
                        isInWishlist(product.id || product._id)
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                      aria-label={isInWishlist(product.id || product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart 
                        size={16} 
                        fill={isInWishlist(product.id || product._id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-600 rounded-sm"></div>
            <h2 className="text-2xl font-bold text-slate-900">Shop by Product Category</h2>
          </div>
          {categories.length > 0 && (
            <Link
              to="/categories"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors group"
            >
              View All
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-slate-100 rounded-xl mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id || category._id} 
                to={`/products?category=${category.id || category._id}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center block group"
                aria-label={`Shop ${category.name} products`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-slate-100 rounded-xl mx-auto mb-3 group-hover:scale-110 transition duration-300 flex items-center justify-center overflow-hidden">
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
                    <Sparkles className="text-indigo-400" size={24} />
                  </div>
                </div>
                <h3 className="font-medium text-slate-900 text-sm">{category.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Service Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-600 rounded-sm"></div>
            <h2 className="text-2xl font-bold text-slate-900">Services by Category</h2>
          </div>
          {serviceCategories.length > 0 && (
            <Link
              to="/service-categories"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors group"
            >
              View All Services
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        
        {serviceCategoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-xl mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        ) : serviceCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No service categories available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceCategories.slice(0, 6).map((serviceCategory) => (
              <Link 
                key={serviceCategory.id || serviceCategory._id || `service-${serviceCategory.name}`} 
                to={`/services?type=${serviceCategory.id || serviceCategory._id}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center block group"
                aria-label={`View ${serviceCategory.name} services`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-xl mx-auto mb-3 group-hover:scale-110 transition duration-300 flex items-center justify-center overflow-hidden">
                  {serviceCategory.image ? (
                    <img 
                      src={(() => {
                        let imageUrl = serviceCategory.image;

                        // Handle if image is an object
                        if (typeof imageUrl === 'object' && imageUrl !== null) {
                          imageUrl = imageUrl.url || imageUrl.src || imageUrl.secure_url || Object.values(imageUrl)[0];
                        }

                        // If still not a string, return null
                        if (typeof imageUrl !== 'string') {
                          console.warn('Invalid service category image format:', imageUrl);
                          return null;
                        }

                        // If it's already a full URL, use it as-is
                        if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
                          return imageUrl;
                        }

                        // If it's a data URL, use it as-is
                        if (imageUrl.startsWith('data:')) {
                          return imageUrl;
                        }

                        console.log('🖼️ Service category image src being rendered:', {
                          serviceCategoryId: serviceCategory.id,
                          imageSrc: imageUrl,
                          timestamp: new Date().toISOString()
                        });

                        return imageUrl;
                      })()}
                      alt={serviceCategory.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        console.error('❌ Service category image failed to load:', {
                          serviceCategoryId: serviceCategory.id,
                          src: serviceCategory.image,
                          error: e.target.error?.message || 'Unknown error',
                          timestamp: new Date().toISOString()
                        });
                        // Use a simple colored background as fallback instead of broken image
                        e.target.style.display = 'none';
                        const parentDiv = e.target.parentElement;
                        if (parentDiv) {
                          parentDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        }
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center" style={{ display: serviceCategory.image ? 'none' : 'flex' }}>
                    <Sparkles className="text-pink-400" size={24} />
                  </div>
                </div>
                <h3 className="font-medium text-slate-900 text-sm">{serviceCategory.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default Hero;
