import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  ChevronLeft,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  Star,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductReviews from "../components/ProductReviews";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { ProductContext } from "../contexts/ProductContext";
import BookingModal from "../components/BookingModal";
import {
  API_BASE_URL,
  PRODUCT_API_URL,
  IMAGE_BASE_URL,
} from "../config/constants";

const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

const ServiceDetail = () => {
  const { id } = useParams();
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlist,
  } = useCart();
  const { success, error: showError } = useToast();
  const { services } = useContext(ProductContext);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allOtherServices, setAllOtherServices] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://user-api.apnadecoration.com/api/services/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
              // Add auth token if available
              ...(localStorage.getItem("token") && {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }),
            },
          },
        );
        const data = await response.json();

        if (data.success && data.data) {
          setService(data.data);
        } else {
          showError("Service not found");
        }
      } catch (error) {
        console.error("Failed to fetch service:", error);
        showError("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Use context services for related items
  const fetchRelatedServices = () => {
    console.log("Context services:", services);
    console.log("Services length:", services.length);

    // Filter out the current service and remove duplicates
    const otherServices = services
      .filter((s) => s.id !== service?.id)
      .filter(
        (service, index, self) =>
          index === self.findIndex((s) => s.id === service.id),
      );
    console.log("Other services (no duplicates):", otherServices);

    // Store all other services for "View More" button logic
    setAllOtherServices(otherServices);

    // Take first 4 services for Related Services section
    const relatedServices = otherServices.slice(0, 4);

    console.log("Related services:", relatedServices);

    setRelatedProducts(relatedServices);
    setLoadingRelated(false);
  };

  useEffect(() => {
    fetchRelatedServices();
  }, [service?.id]);

  const handleBookNow = () => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    console.log("Booking created:", booking);
    // You can add additional success handling here
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  const handleAddToCart = async () => {
    if (!service) return;

    try {
      await addToCart(service);
      success(`${service.name} added to cart!`);
    } catch (err) {
      showError("Failed to add to cart");
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
      showError("Failed to update wishlist");
    }
  };

  const handleAddRelatedToCart = async (relatedService) => {
    try {
      await addToCart(relatedService);
      success(`${relatedService.name} added to cart!`);
    } catch (err) {
      showError("Failed to add to cart");
    }
  };

  const handleRelatedServiceClick = (e, serviceId) => {
    // Smooth scroll to top when navigating to related service
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Service Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The service you're looking for doesn't exist.
          </p>
          <Link
            to="/services"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navigation />

      {/* HERO SECTION - Service Images & Info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Service Image Gallery */}
          <div className="space-y-4">
            {/* Main Service Image */}
            <div className="aspect-square overflow-hidden rounded-xl shadow-sm bg-gray-100">
              <img
                src={
                  service.thumbnail
                    ? service.thumbnail.startsWith("http")
                      ? service.thumbnail
                      : IMAGE_BASE_URL + service.thumbnail
                    : service.bannerImage
                      ? service.bannerImage.startsWith("https://")
                        ? service.bannerImage
                        : service.bannerImage.startsWith("http://")
                          ? service.bannerImage.replace("http://", "https://")
                          : IMAGE_BASE_URL + service.bannerImage
                      : FALLBACK_IMAGE
                }
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {service.images && service.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {service.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer transition-all ${
                      selectedImage === image
                        ? "ring-2 ring-blue-500"
                        : "hover:opacity-80"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={
                        image.startsWith("http")
                          ? image
                          : IMAGE_BASE_URL + image
                      }
                      alt={`${service.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Service Info */}
          <div className="space-y-6">
            {/* Service Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {service.name}
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                <Star size={14} className="mr-1" />
                Service
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(service.rating || 4.5)
                      ? "text-yellow-500 fill-current"
                      : "text-gray-400"
                  }
                />
              ))}
              <span className="text-sm text-gray-600">
                {service.rating || 4.5} ({service.reviews || 0} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-red-500">
                  ₹{service.price}
                </span>
              </div>

              {/* Short Description */}
              <div className="text-gray-700">
                {service.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        service.description.length > 200
                          ? service.description.substring(0, 200) + "..."
                          : service.description,
                    }}
                  />
                ) : (
                  <p>No description available</p>
                )}
              </div>

              {/* Service Highlights */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Key Features</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li> Professional service team</li>
                  <li> Flexible booking dates</li>
                  <li> 24/7 customer support</li>
                  <li> Quality assured service</li>
                </ul>
              </div>

              {/* Service Provider Information */}
              <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Service Provider
                    </h3>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Verified Provider
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Provided by:</span> Apna
                      Decoration
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      Verified Provider Professional Service
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Quality assured by Apna Decoration service partners
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBookNow}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Book Now
              </button>

              <button
                onClick={handleAddToCart}
                disabled={!service.availability}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !service.availability
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
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
                  className={
                    isInWishlist(service._id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-600"
                  }
                />
              </button>
            </div>

            {/* Booking Modal */}
            <BookingModal
              service={selectedService}
              isOpen={isBookingModalOpen}
              onClose={closeBookingModal}
              onSuccess={handleBookingSuccess}
            />

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

      {/* DETAILED INFORMATION SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-8">
          {/* Tabs for Description, Specifications, Reviews */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "description"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "specifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          {/* Description Tab */}
          {activeTab === "description" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Service Description
              </h3>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {service.description || "No description available"}
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specifications" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Service Specifications
              </h3>
              <div className="space-y-4">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-900 w-1/3">
                        Service Name
                      </td>
                      <td className="py-2 text-gray-700">{service.name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-900 w-1/3">
                        Price
                      </td>
                      <td className="py-2 text-gray-700">₹ {service.price}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-900 w-1/3">
                        Type
                      </td>
                      <td className="py-2 text-gray-700 capitalize">
                        {service.type || "Service"}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-900 w-1/3">
                        Rating
                      </td>
                      <td className="py-2 text-gray-700">
                        {service.rating || 4.5} / 5.0
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-900 w-1/3">
                        Reviews
                      </td>
                      <td className="py-2 text-gray-700">
                        {service.reviews || 0} reviews
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-900 w-1/3">
                        Availability
                      </td>
                      <td className="py-2 text-gray-700">
                        {service.availability ? "Available" : "Not Available"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Reviews
              </h3>
              <ProductReviews productId={id} />
            </div>
          )}
        </div>
      </div>

      {/* Related Services */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Related Services
        </h2>
        {console.log("Rendering related services:", relatedProducts)}
        {relatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/service/${item.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden h-full flex flex-col"
                  onClick={(e) => handleRelatedServiceClick(e, item.id)}
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
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2 min-h-[50px]">
                      <p className="text-red-500 font-bold">₹ {item.price}</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddRelatedToCart(item);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                    <div className="mt-auto">
                      <span className="text-xs text-gray-500 capitalize">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {allOtherServices.length > 4 && (
              <div className="text-center mt-6">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View More Services
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No related services found</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
