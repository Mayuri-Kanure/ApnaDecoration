import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  Star,
  Plus,
  Minus,
  Truck,
  Shield,
  RefreshCw,
  Tag
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ProductReviews from '../components/ProductReviews';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { IMAGE_BASE_URL } from '../config/constants';

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x400?text=No+Image';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, isInCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { success, error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [clearanceData, setClearanceData] = useState(null);
  const [isOnSale, setIsOnSale] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api';

 useEffect(() => {
    const fetchProductOrService = async () => {
    setLoading(true);
    let data = null;
    let type = 'product';

    try {
      console.log('🔍 Fetching item with ID:', id);
      
      // Try Main Products API first
      let res = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/products/${id}`);
      if (res.ok) {
        data = await res.json();
        console.log('✅ Fetched from main product API', data);
      } else {
        console.warn('⚠️ Main Product API returned', res.status);
        
        // Try alternative main products endpoint
        res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${id}`);
        if (res.ok) {
          data = await res.json();
          console.log('✅ Fetched from alternative product API', data);
        } else {
          console.warn('⚠️ Alternative Product API returned', res.status);
          
          // Try Services API
          res = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/services/${id}`);
          if (res.ok) {
            data = await res.json();
            console.log('✅ Fetched from service API', data);
            console.log('🔍 Service data structure:', {
              name: data.data?.name,
              thumbnail: data.data?.thumbnail,
              bannerImage: data.data?.bannerImage,
              images: data.data?.images,
              hasThumbnail: !!data.data?.thumbnail,
              hasBannerImage: !!data.data?.bannerImage,
              hasImages: !!(data.data?.images && data.data?.images.length > 0)
            });
            type = 'service';
          } else {
            console.warn('⚠️ Service API returned', res.status);
            
            // Try Vendor Products API
            const token = localStorage.getItem('token');
            const vendorHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            // Try different vendor product endpoints
            const vendorEndpoints = [
              `${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/vendor/products/${id}`,
              `${process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com'}/api/vendor/products/${id}`,
              `${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/vendor-products/${id}`,
              `${process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com'}/api/vendor-products/${id}`
            ];
            
            for (const endpoint of vendorEndpoints) {
              console.log(`🔍 Trying vendor endpoint: ${endpoint}`);
              res = await fetch(endpoint, {
                headers: vendorHeaders
              });
              
              if (res.ok) {
                console.log(`✅ Vendor product found at: ${endpoint}`);
                data = await res.json();
                console.log('✅ Fetched from vendor product API', data);
                console.log('🔍 Vendor product data structure:', {
                  name: data.data?.name,
                  thumbnail: data.data?.thumbnail,
                  images: data.data?.images,
                  hasThumbnail: !!data.data?.thumbnail,
                  hasImages: !!(data.data?.images && data.data?.images.length > 0)
                });
                type = 'vendor-product';
                break;
              } else {
                console.log(`❌ Vendor endpoint failed: ${endpoint} - ${res.status}`);
              }
            }
            
            if (!res.ok) {
              console.warn('⚠️ Vendor Product API returned', res.status);
              console.error('❌ Item not found in any collection. ID:', id);
              throw new Error(`Item with ID ${id} not found in products, services, or vendor products`);
            }
          }
        }
      }

      const actualData = data?.data || data;

      // Normalize product object
      const normalized = {
        id: actualData._id || actualData.id,
        name: actualData.name || 'No Name',
        description: actualData.description || '',
        price: actualData.price || 0,
        stock: actualData.stock || 0,
        thumbnail: actualData.thumbnail || null,
        bannerImage: actualData.bannerImage || null, // Add bannerImage for services
        images: actualData.images || [],
        rating: actualData.rating || 4.5,
        reviews: actualData.reviews || 0,
        type
      };

      console.log('🔍 Normalized product data:', {
        id: normalized.id,
        name: normalized.name,
        type: normalized.type,
        thumbnail: normalized.thumbnail,
        bannerImage: normalized.bannerImage,
        images: normalized.images,
        hasThumbnail: !!normalized.thumbnail,
        hasBannerImage: !!normalized.bannerImage,
        hasImages: !!(normalized.images && normalized.images.length > 0)
      });

      setProduct(normalized);
    } catch (err) {
      console.error(err);
      showError('Product or service not found');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPORTANT: function close + call
  fetchProductOrService();
}, [id]);

  // Fetch clearance sale data to check if product is on sale
  useEffect(() => {
    const fetchClearanceSaleData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/clearance-sale/public`);
        setClearanceData(response.data.data);
        
        // Check if current product is in clearance sale
        if (response.data.data?.inhouseOffer?.isActive && product) {
          const applicableProducts = response.data.data.inhouseOffer.applicableProducts || [];
          const isProductInSale = applicableProducts.some(p => 
            p._id === product._id || p === product._id
          );
          setIsOnSale(isProductInSale);
        }
      } catch (error) {
        console.error('Error fetching clearance sale data:', error);
      }
    };

    if (product) {
      fetchClearanceSaleData();
    }
  }, [product]);

  // 🔹 Fetch related items (products OR services based on type)
  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!product?.id) return;
      setLoadingRelated(true);

      try {
        let data = [];
        if (product.type === 'product') {
          // fetch related products
          const res = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com'}/api/products?related=${product.id}&limit=4`);
          const resData = await res.json();
          data = resData.data || [];
        } else if (product.type === 'service') {
          // fetch related services
          const res = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/services?limit=4`);
          const resData = await res.json();
          data = resData.data || [];
        }

        // Normalize each item (product or service) to use same keys
        const normalized = data.map(item => ({
          id: item._id || item.id,
          name: item.name,
          price: item.price || 0,
          thumbnail: item.thumbnail || null,
          type: product.type === 'product' ? 'product' : 'service'
        }));

        setRelatedProducts(normalized);
      } catch (err) {
        console.error('Error fetching related items:', err);
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedItems();
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      // Create product object with sale information
      const cartProduct = {
        ...product,
        quantity,
        isOnSale,
        saleInfo: isOnSale ? getSaleInfo() : null,
        finalPrice: isOnSale ? calculateSalePrice() : product.price
      };
      
      const result = await addToCart(cartProduct, quantity);
      if (result.success) {
        const priceText = isOnSale ? 
          `at sale price ₹${calculateSalePrice().toFixed(2)}` : 
          `at ₹${product.price}`;
        success(`${product.name} added to cart ${priceText}`);
      } else {
        showError(result.error || 'Failed to add to cart');
      }
    } catch {
      showError('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        success('Added to wishlist');
      }
    } catch {
      showError('Failed to update wishlist');
    }
  };

  // Calculate sale price if product is on clearance sale
  const calculateSalePrice = () => {
    if (!isOnSale || !clearanceData?.inhouseOffer) {
      return product.price;
    }
    
    const originalPrice = parseFloat(product.price) || 0;
    const discountAmount = parseFloat(clearanceData.inhouseOffer.discountAmount) || 0;
    const discountType = clearanceData.inhouseOffer.discountType;
    
    if (discountType === 'percentage') {
      return originalPrice * (1 - discountAmount / 100);
    } else if (discountType === 'flat') {
      return Math.max(0, originalPrice - discountAmount);
    }
    
    return originalPrice;
  };

  const getSaleInfo = () => {
    if (!isOnSale || !clearanceData?.inhouseOffer) {
      return null;
    }
    
    const originalPrice = parseFloat(product.price) || 0;
    const salePrice = calculateSalePrice();
    const discountPercentage = originalPrice > 0 ? 
      Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
    
    return {
      originalPrice,
      salePrice,
      discountPercentage,
      discountType: clearanceData.inhouseOffer.discountType,
      discountAmount: clearanceData.inhouseOffer.discountAmount
    };
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (!product) return <p className="p-8 text-center">Product not found</p>;

  console.log('🔍 Product loaded:', product);
  console.log('🔍 Product image data:', {
    thumbnail: product.thumbnail,
    bannerImage: product.bannerImage,
    images: product.images,
    hasThumbnail: !!product.thumbnail,
    hasBannerImage: !!product.bannerImage,
    hasImages: !!(product.images && product.images.length > 0)
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500">
          <ChevronLeft size={20} /> Back to Products
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          {console.log('🔍 Product data for image:', product)}
          {console.log('🔍 Image sources:', {
            thumbnail: product.thumbnail,
            bannerImage: product.bannerImage,
            images: product.images,
            firstImage: product.images?.[0],
            fallback: FALLBACK_IMAGE
          })}
          {console.log('🔍 Product type check:', {
            type: product.type,
            isService: product.type === 'service',
            hasBannerImage: !!product.bannerImage,
            hasImages: !!(product.images && product.images.length > 0),
            hasThumbnail: !!product.thumbnail
          })}
          
          {/* For services, show multiple images */}
          {product.type === 'service' ? (
            <div className="space-y-4">
              <div className="bg-purple-100 p-3 rounded-lg mb-4">
                <p className="text-purple-800 font-semibold">🎯 Service Product - Multiple Images Mode</p>
                <p className="text-purple-600 text-sm">Showing banner image + regular image + additional images</p>
              </div>
              
              {/* Main Banner Image */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">🎨 Banner Image</p>
                <img
                  src={product.bannerImage ? product.bannerImage : (product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE)}
                  alt={`${product.name} - Banner`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              {/* Regular Image */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">📷 Regular Image</p>
                <img
                  src={product.thumbnail ? (product.thumbnail.startsWith('http') ? product.thumbnail : IMAGE_BASE_URL + product.thumbnail) : (product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE)}
                  alt={`${product.name} - Regular`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              {/* Additional Images Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">🖼️ Additional Images</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.images.slice(1, 3).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 2}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          Image {index + 2}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Image Labels */}
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span>Banner Image (shown on detail page)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Regular Image (shown on product cards)</span>
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Additional Images</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-blue-100 p-3 rounded-lg mb-4">
                <p className="text-blue-800 font-semibold">📦 Regular Product - Single Image Mode</p>
                <p className="text-blue-600 text-sm">Type: {product.type || 'unknown'}</p>
              </div>
              <img
                src={product.thumbnail ? (product.thumbnail.startsWith('http') ? product.thumbnail : IMAGE_BASE_URL + product.thumbnail) : (product.bannerImage ? product.bannerImage : (product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE))}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6 product-detail-container">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-2 product-rating">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'text-yellow-500' : 'text-gray-400'} />
            ))}
            <span className="text-sm text-gray-900 font-medium">{product.rating} ({product.reviews} reviews)</span>
          </div>

          {/* Sale Badge */}
          {isOnSale && (
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Tag size={16} />
                Clearance Sale
              </div>
              {getSaleInfo() && (
                <div className="bg-green-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                  {getSaleInfo().discountPercentage}% OFF
                </div>
              )}
            </div>
          )}

          {/* Price Display */}
          <div className="flex items-center gap-3">
            {isOnSale && getSaleInfo() ? (
              <>
                <span className="text-gray-400 line-through text-lg">₹{getSaleInfo().originalPrice.toFixed(2)}</span>
                <span className="text-3xl font-bold text-red-600">₹{getSaleInfo().salePrice.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                  Save ₹{(getSaleInfo().originalPrice - getSaleInfo().salePrice).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-red-600">₹{product.price}</span>
            )}
          </div>

          <div dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available</p>' }} className="text-gray-700" />

          {/* Quantity & Actions */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-700"><Minus size={16} /></button>
              <span className="px-4 py-2 text-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-700"><Plus size={16} /></button>
            </div>

            <button onClick={handleAddToCart} className="flex-1 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
              <ShoppingBag size={20} /> {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
            </button>

            <button onClick={handleToggleWishlist} className="p-3 border rounded-lg">
              <Heart size={20} className={isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'} />
            </button>
          </div>

          {/* Extra Info */}
          <div className="space-y-2 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Truck size={16} /> Free shipping on orders over ₹99</div>
            <div className="flex items-center gap-2"><Shield size={16} /> Quality guarantee</div>
            <div className="flex items-center gap-2"><RefreshCw size={16} /> Easy returns</div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="container mx-auto px-4 py-12">
        <ProductReviews productId={id} />
      </div>

      {/* Related Items */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Related {product.type === 'product' ? 'Products' : 'Services'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(item => (
              <Link key={item.id} to={`/product/${item.id}`} className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden">
                <img src={item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : IMAGE_BASE_URL + item.thumbnail) : FALLBACK_IMAGE} alt={item.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-red-500 font-bold">₹{item.price}</p>
                  <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
