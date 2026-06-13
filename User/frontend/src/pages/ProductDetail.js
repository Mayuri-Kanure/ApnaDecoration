import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
  Tag,
  Store,
  User,
} from "lucide-react";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductReviews from "../components/ProductReviews";

import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { ProductContext } from "../contexts/ProductContext";

import {
  IMAGE_BASE_URL,
  API_BASE_URL,
  PRODUCT_API_URL,
} from "../config/constants";

import { robustFetch } from "../utils/fetchUtils";
import { canAddToCart } from "../utils/stockValidator";

const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } =
    useCart();

  const { success, error: showError } = useToast();

  const { products, services } = useContext(ProductContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [clearanceData, setClearanceData] = useState(null);
  const [isOnSale, setIsOnSale] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let foundItem =
          products.find((p) => p._id === id || p.id === id) ||
          services.find((s) => s._id === id || s.id === id);

        if (foundItem) {
          const productId = foundItem._id || foundItem.id;

          setProduct({
            id: productId,
            _id: productId,
            name: foundItem.name || "No Name",
            description: foundItem.description || "",
            price: foundItem.price || 0,
            stock: foundItem.stock || 0,
            thumbnail: foundItem.thumbnail || null,
            bannerImage: foundItem.bannerImage || null,
            images: foundItem.images || [],
            rating: foundItem.rating || 4.5,
            reviews: foundItem.reviews || 0,
            type:
              foundItem.type ||
              (services.includes(foundItem) ? "service" : "product"),
            vendor: foundItem.vendorId || null,
          });

          setLoading(false);
          return;
        }

        const endpoints = [
          `${process.env.REACT_APP_API_URL}/services/${id}`,
          `${process.env.REACT_APP_API_URL}/products/${id}`,
          `${process.env.REACT_APP_API_URL}/vendor-products/public/${id}`,
        ];

        let data = null;
        let type = "product";

        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);

            if (res.ok) {
              data = await res.json();

              if (endpoint.includes("/services/")) {
                type = "service";
              }

              if (endpoint.includes("/vendor-products/")) {
                type = "vendor-product";
              }

              break;
            }
          } catch (err) {
            console.log(err);
          }
        }

        if (!data) {
          throw new Error("Product not found");
        }

        const actualData = data?.data || data;

        const productId = actualData._id || actualData.id;

        setProduct({
          id: productId,
          _id: productId,
          name: actualData.name || "No Name",
          description: actualData.description || "",
          price: actualData.price || 0,
          stock: actualData.stock || 0,
          thumbnail: actualData.thumbnail || null,
          bannerImage: actualData.bannerImage || null,
          images: actualData.images || [],
          rating: actualData.rating || 4.5,
          reviews: actualData.reviews || 0,
          type,
          vendor: actualData.vendorId || null,
        });
      } catch (err) {
        console.error(err);
        showError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL.replace("admin-api", "user-api")}/products?limit=8`,
        );

        const data = await res.json();

        const normalized = (data.data || []).map((item) => ({
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          thumbnail: item.thumbnail,
          type: "product",
        }));

        setRelatedProducts(normalized.slice(0, 4));
      } catch (err) {
        console.log(err);
      }
    };

    fetchRelated();
  }, [product?.id]);

  useEffect(() => {
    const fetchClearance = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/clearance-sale/public`,
        );

        setClearanceData(response.data.data);

        if (response.data.data?.inhouseOffer?.isActive && product) {
          const applicableProducts =
            response.data.data.inhouseOffer.applicableProducts || [];

          const isProductInSale = applicableProducts.some(
            (p) => p._id === product._id || p === product._id,
          );

          setIsOnSale(isProductInSale);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (product) {
      fetchClearance();
    }
  }, [product]);

  const calculateSalePrice = () => {
    if (!isOnSale || !clearanceData?.inhouseOffer) {
      return product.price;
    }

    const originalPrice = parseFloat(product.price) || 0;

    const discountAmount =
      parseFloat(clearanceData.inhouseOffer.discountAmount) || 0;

    const discountType = clearanceData.inhouseOffer.discountType;

    if (discountType === "percentage") {
      return originalPrice * (1 - discountAmount / 100);
    }

    if (discountType === "flat") {
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

    return {
      originalPrice,
      salePrice,
      discountPercentage: Math.round(
        ((originalPrice - salePrice) / originalPrice) * 100,
      ),
    };
  };

  const handleAddToCart = async () => {
    const validation = canAddToCart(product, quantity);

    if (!validation.allowed) {
      showError(validation.message);
      return;
    }

    try {
      await addToCart(product, quantity);
      success("Added to cart");
    } catch (err) {
      showError("Failed to add");
    }
  };

  const handleBuyNow = async () => {
    try {
      const validation = canAddToCart(product, quantity);
      if (!validation.allowed) {
        showError(validation.message);
        return;
      }

      success("Redirecting to checkout...");
      navigate("/checkout", {
        state: {
          buyNowItem: {
            ...product,
            quantity,
          },
        },
      });
    } catch (err) {
      showError("Failed to proceed to checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product Not Found
      </div>
    );
  }

  return (
    <div className="product-detail-container min-h-screen bg-gray-50 overflow-x-hidden text-gray-900">
      <Navigation />

      {/* BACK BUTTON */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500"
        >
          <ChevronLeft size={20} />
          Back to Products
        </Link>
      </div>

      {/* MAIN SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* IMAGE SECTION */}
          <div className="space-y-4">
            {/* Create combined gallery from thumbnail + images array */}
            {(() => {
              const galleryImages = [];
              if (product.thumbnail) galleryImages.push(product.thumbnail);
              if (product.bannerImage && product.bannerImage !== product.thumbnail) galleryImages.push(product.bannerImage);
              if (product.images && Array.isArray(product.images)) {
                galleryImages.push(...product.images);
              }
              
              const mainImage = selectedImage || galleryImages[0] || product.thumbnail || FALLBACK_IMAGE;
              
              return (
                <>
                  <div className="aspect-square max-h-[450px] overflow-hidden rounded-2xl bg-white shadow">
                    <img
                      src={
                        mainImage.startsWith("http")
                          ? mainImage
                          : IMAGE_BASE_URL + mainImage
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {galleryImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {galleryImages.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(image)}
                          className={`aspect-square overflow-hidden rounded-xl border-2 ${
                            selectedImage === image
                              ? "border-blue-500"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={
                              image.startsWith("http")
                                ? image
                                : IMAGE_BASE_URL + image
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* PRODUCT INFO */}
          <div className="space-y-6">
            {/* TITLE */}
            <div className="flex flex-wrap items-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                {product.name}
              </h1>

              {product.type === "service" && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Service
                </span>
              )}

              {product.type === "vendor-product" && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  Vendor Product
                </span>
              )}
            </div>

            {/* RATING */}
            <div className="flex items-center gap-2 flex-wrap text-gray-700">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(product.rating)
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}

              <span className="text-sm text-gray-700">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* PRICE */}
            <div className="space-y-2">
              {isOnSale && getSaleInfo() ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-400 line-through text-lg">
                    ₹{getSaleInfo().originalPrice.toFixed(2)}
                  </span>

                  <span className="text-3xl font-bold text-red-600">
                    ₹{getSaleInfo().salePrice.toFixed(2)}
                  </span>

                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    {getSaleInfo().discountPercentage}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-red-600">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">
              <div
                className="prose max-w-none text-gray-800 prose-p:text-gray-800 prose-headings:text-gray-900 prose-li:text-gray-800 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description || "<p>No description available</p>",
                }}
              />
            </div>

            {/* VENDOR */}
            {product.vendor && (
              <div className="p-4 rounded-2xl bg-white shadow-sm border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Store size={18} />
                    <span className="font-medium">
                      Sold by {product.vendor.name}
                    </span>
                  </div>

                  <Link
                    to={`/vendor/${product.vendor._id}`}
                    className="text-blue-600 text-sm"
                  >
                    Visit Shop →
                  </Link>
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="quantity-box flex border border-gray-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 text-gray-800"
                >
                  <Minus size={16} />
                </button>

                <div className="px-5 flex items-center justify-center font-medium text-gray-900 bg-white">
                  {quantity}
                </div>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 text-gray-800"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="btn-text-white w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="btn-text-white w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                Buy Now
              </button>

              <button
                onClick={() => {
                  if (isInWishlist(product.id || product._id)) {
                    removeFromWishlist(product.id || product._id);
                  } else {
                    addToWishlist(product);
                  }
                }}
                className={`w-full sm:w-auto px-4 py-3 rounded-xl border flex items-center justify-center ${
                  isInWishlist(product.id || product._id)
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <Heart
                  size={18}
                  fill={
                    isInWishlist(product.id || product._id)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck size={16} />
                Free Delivery
              </div>

              <div className="flex items-center gap-2">
                <Shield size={16} />
                Secure Payment
              </div>

              <div className="flex items-center gap-2">
                <RefreshCw size={16} />
                Easy Returns
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <nav className="flex overflow-x-auto whitespace-nowrap gap-4 border-b pb-4 scrollbar-hide">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-2 px-1 font-medium ${
                activeTab === "description"
                  ? "border-b-2 border-blue-500 tab-active"
                  : "tab-inactive"
              }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab("specifications")}
              className={`pb-2 px-1 font-medium ${
                activeTab === "specifications"
                  ? "border-b-2 border-blue-500 tab-active"
                  : "tab-inactive"
              }`}
            >
              Specifications
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 px-1 font-medium ${
                activeTab === "reviews"
                  ? "border-b-2 border-blue-500 tab-active"
                  : "tab-inactive"
              }`}
            >
              Reviews
            </button>
          </nav>

          <div className="pt-6 text-gray-800">
            {activeTab === "description" && (
              <div
                className="prose max-w-none break-words text-gray-800 prose-p:text-gray-800 prose-headings:text-gray-900 prose-li:text-gray-800 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description || "<p>No description available</p>",
                }}
              />
            )}

            {activeTab === "specifications" && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-gray-800">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-900">Name</td>
                      <td className="py-3 text-gray-800">{product.name}</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-900">Price</td>
                      <td className="py-3 text-gray-800">
                        ₹
                        {isOnSale && getSaleInfo()
                          ? getSaleInfo().salePrice.toFixed(2)
                          : product.price}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-900">Type</td>
                      <td className="py-3 text-gray-800">{product.type}</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-900">Rating</td>
                      <td className="py-3 text-gray-800">{product.rating}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && <ProductReviews productId={id} />}
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Related Products
          </h2>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                <img
                  src={
                    item.thumbnail
                      ? item.thumbnail.startsWith("http")
                        ? item.thumbnail
                        : IMAGE_BASE_URL + item.thumbnail
                      : FALLBACK_IMAGE
                  }
                  alt={item.name}
                  className="w-full h-52 object-cover"
                />

                <div className="p-4">
                  <h3 className="related-product-title font-semibold text-sm sm:text-base line-clamp-2 break-words text-gray-900">
                    {item.name}
                  </h3>

                  <div className="flex items-center justify-between mt-3 gap-2">
                    <p className="text-red-500 font-bold">₹{item.price}</p>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(item, 1);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1"
                    >
                      <ShoppingBag size={12} />
                      Add
                    </button>
                  </div>
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
