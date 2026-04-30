import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useDebounce } from "../hooks/useDebounce";
import { isClearanceSaleDataActive } from "../utils/clearanceSale";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  MapPin,
  Package,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Home,
  Grid3x3,
  Phone,
  Mail,
  Star,
  Zap,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems, wishlist } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [clearanceData, setClearanceData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setNotifications([]);
          return;
        }

        const response = await fetch(
          "https://user-api.apnadecoration.com/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data || data.notifications || []);
        } else {
          console.error("Failed to fetch notifications");
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }
    };

    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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
      setSearchResults({ products: [], categories: [] });
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (term) => {
    try {
      setSearchLoading(true);
      console.log("Searching for:", term);

      // Try different API endpoints for products
      const productEndpoints = [
        `${process.env.REACT_APP_PRODUCT_API_URL || "https://admin-api.apnadecoration.com/api"}/products/search?q=${encodeURIComponent(term)}`,
        `${process.env.REACT_APP_PRODUCT_API_URL || "https://admin-api.apnadecoration.com/api"}/products?search=${encodeURIComponent(term)}`,
        `${process.env.REACT_APP_PRODUCT_API_URL || "https://admin-api.apnadecoration.com/api"}/products`,
      ];

      let productsData = { data: [] };

      // Try each endpoint until one works
      for (const endpoint of productEndpoints) {
        try {
          console.log("Trying endpoint:", endpoint);
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            console.log("Products response:", data);

            // If we have a search endpoint with results, use it
            if (data.data && data.data.length > 0) {
              productsData = data;
              break;
            }

            // If it's a general products endpoint, filter locally
            if (data.data && Array.isArray(data.data)) {
              const filtered = data.data.filter(
                (product) =>
                  product.name &&
                  product.name.toLowerCase().includes(term.toLowerCase()),
              );
              if (filtered.length > 0) {
                productsData = { data: filtered };
                break;
              }
            }
          }
        } catch (err) {
          console.log("Endpoint failed:", endpoint, err.message);
          continue;
        }
      }

      // For categories, try to get from products or use fallback
      let categoriesData = { data: [] };

      // Extract unique categories from products
      if (productsData.data && productsData.data.length > 0) {
        const categories = [
          ...new Set(productsData.data.map((p) => p.category).filter(Boolean)),
        ];
        categoriesData = {
          data: categories.map((cat, index) => {
            // Format category name to be more readable
            let categoryName = cat || `Category ${index + 1}`;

            // If it looks like an ID or slug, convert to readable format
            if (
              categoryName.includes("_") ||
              categoryName.includes("-") ||
              /^[a-z0-9]+$/.test(categoryName)
            ) {
              categoryName = categoryName
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
                .trim();
            } else {
              // Just capitalize first letter if it's a normal string
              categoryName =
                categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            }

            return {
              id: cat || `cat-${index}`,
              name: categoryName,
            };
          }),
        };
      }

      console.log("Final results:", {
        products: productsData.data,
        categories: categoriesData.data,
      });

      // Combine and categorize results
      const results = {
        products: productsData.data?.slice(0, 5) || [],
        categories: categoriesData.data?.slice(0, 3) || [],
      };

      setSearchResults(results);
      setSearchDropdownOpen(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ products: [], categories: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Log auth state changes only
  useEffect(() => {
    console.log("🧭 Navigation - Auth state changed:", {
      isAuthenticated,
      user,
    });
  }, [isAuthenticated, user]);

  // Fetch clearance sale data
  useEffect(() => {
    const fetchClearanceData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_PRODUCT_API_URL || "https://admin-api.apnadecoration.com/api"}/clearance-sale/public`,
        );
        const data = await response.json();
        setClearanceData(data.data);
      } catch (error) {
        console.error("Failed to fetch clearance data:", error);
      }
    };

    fetchClearanceData();
  }, []);

  /* Close user menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isClearanceActive = isClearanceSaleDataActive(clearanceData);

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/products", label: "Products", icon: Grid3x3 },
    { path: "/services", label: "Services", icon: Star },
    ...(isClearanceActive
      ? [{ path: "/clearance-sale", label: "Clearance Sale", icon: Zap }]
      : []),
    { path: "/faq", label: "FAQ", icon: HelpCircle },
    { path: "/about", label: "About", icon: Phone },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header
      className={`sticky top-0 z-[9998] transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-4 group focus:outline-none"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                window.location.reload();
              }
            }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <img
                src="/logo.png"
                alt="Apna Decoration Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Apna Decoration
              </h1>
              <p className="text-xs text-gray-500">Celebration Made Perfect</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div
            className="hidden lg:flex items-center flex-1 max-w-md mx-8"
            ref={searchRef}
          >
            <div className="relative w-full z-[9999]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  setSearchDropdownOpen(true);
                }}
                className="w-full pl-10 pr-4 py-2 border bg-white text-gray-900 placeholder-gray-500 border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                style={{ color: "#111827" }}
              />

              {/* Search Results Dropdown */}
              {searchDropdownOpen && (
                <div
                  className="fixed right-30 mx-auto mt-2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[99999]"
                  style={{ top: "70px" }}
                >
                  {searchLoading ? (
                    <div className="p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-solid border-blue-600 border-t-transparent"></div>
                      <p className="text-sm text-gray-500 mt-2">Searching...</p>
                    </div>
                  ) : searchTerm.trim().length === 0 ? (
                    <div className="max-h-80 no-scrollbar fade-bottom">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Popular Searches
                        </p>
                      </div>
                      {popularSearches.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchTerm(suggestion);
                            // Don't close dropdown immediately, let the search trigger
                            setTimeout(() => {
                              setSearchDropdownOpen(false);
                            }, 100);
                          }}
                          className="flex items-center gap-3 w-full p-3 transition-colors duration-150 text-left"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Search className="text-blue-600" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {suggestion}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchResults.products?.length > 0 ||
                    searchResults.categories?.length > 0 ? (
                    <div className="max-h-80 no-scrollbar fade-bottom">
                      {/* Categories Section */}
                      {searchResults.categories?.filter(
                        (cat) =>
                          cat.name &&
                          cat.name !== "Category" &&
                          !/^[a-f0-9]{24,}$/i.test(cat.name),
                      ).length > 0 && (
                        <div>
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Categories
                            </p>
                          </div>
                          {searchResults.categories
                            .filter(
                              (cat) =>
                                cat.name &&
                                cat.name !== "Category" &&
                                !/^[a-f0-9]{24,}$/i.test(cat.name),
                            )
                            .map((category) => (
                              <Link
                                key={category.id}
                                to={`/products?category=${encodeURIComponent(category.name || category.id)}`}
                                onClick={() => {
                                  setSearchDropdownOpen(false);
                                  setSearchTerm("");
                                }}
                                className="flex items-center gap-3 p-3 transition-colors duration-150"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Grid3x3
                                    className="text-blue-600"
                                    size={20}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {category.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    Browse category
                                  </p>
                                </div>
                              </Link>
                            ))}
                        </div>
                      )}

                      {/* Products Section */}
                      {searchResults.products?.length > 0 && (
                        <div
                          className={
                            searchResults.categories?.length > 0
                              ? "border-t border-gray-100"
                              : ""
                          }
                        >
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Products
                            </p>
                          </div>
                          {searchResults.products.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              onClick={() => {
                                setSearchDropdownOpen(false);
                                setSearchTerm("");
                              }}
                              className="flex items-center gap-3 p-3 transition-colors duration-150"
                            >
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0">
                                {product.thumbnail || product.image ? (
                                  <img
                                    src={product.thumbnail || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <ShoppingBag
                                      className="text-gray-400"
                                      size={20}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {product.price
                                    ? `₹ ${product.price}`
                                    : "Price not available"}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* View All Results */}
                      <div className="p-3 border-t border-gray-100 bg-white">
                        <Link
                          to={`/products?q=${encodeURIComponent(searchTerm)}`}
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            setSearchTerm("");
                          }}
                          className="block text-center text-sm text-blue-600 font-medium"
                        >
                          View all results for "{searchTerm}"
                        </Link>
                      </div>
                    </div>
                  ) : searchTerm.trim().length > 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">
                        No products or categories found
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 top-1 rounded-full ">
              <Heart className="h-4 w-4 text-gray-600  " />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center  shadow-md ">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 top-1 rounded-full ">
              <ShoppingBag className="h-5 w-5 text-gray-600 " />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md ">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu Dropdown */}
            <div className="relative z-[9999]" ref={userMenuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(
                    "Profile icon clicked! Current state:",
                    userMenuOpen,
                  );
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full relative text-gray-600  border border-gray-200 bg-white"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                style={{
                  pointerEvents: "auto",
                  position: "relative",
                  zIndex: 40,
                }}
              >
                <User size={20} className="stroke-current" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 opacity-0  pointer-events-none"></div>
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-transparent"
                    style={{
                      position: "fixed",
                      zIndex: 9998,
                      pointerEvents: "auto",
                    }}
                    onClick={() => setUserMenuOpen(false)}
                  />

                  {/* Dropdown */}
                  <div
                    className="absolute mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl"
                    style={{
                      animation: "slideDown 0.2s ease-out",
                      pointerEvents: "auto",
                      position: "fixed",
                      zIndex: 9999,
                      top: "auto",
                      right: "16px",
                      marginTop: "8px",
                    }}
                  >
                    {isAuthenticated ? (
                      <>
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                          <p className="font-semibold text-gray-900 text-sm">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile?tab=personal"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-200"
                          >
                            <User size={16} className="text-gray-400" />
                            <span>Personal Info</span>
                          </Link>

                          <Link
                            to="/profile?tab=addresses"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-200"
                          >
                            <MapPin size={16} className="text-gray-400" />
                            <span>Addresses</span>
                          </Link>

                          <Link
                            to="/profile?tab=orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-200"
                          >
                            <Package size={16} className="text-gray-400" />
                            <span>Orders</span>
                          </Link>

                          <Link
                            to="/profile?tab=notifications"
                            onClick={(e) => {
                              console.log("Notifications link clicked!");
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-200 relative"
                          >
                            <div className="relative">
                              <Bell size={16} className="text-gray-400" />
                              {notifications.filter((n) => !n.read).length >
                                0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                  {notifications.filter((n) => !n.read).length}
                                </span>
                              )}
                            </div>
                            <span>Notifications</span>
                          </Link>

                          <Link
                            to="/profile?tab=security"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-200"
                          >
                            <Shield size={16} className="text-gray-400" />
                            <span>Security</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => {
                              handleLogout();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 transition-all duration-200"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 transition-all duration-200"
                        >
                          Login / Register
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-gray-600 transition-all duration-300 relative z-10 shadow-sm transform"
            >
              {mobileMenuOpen ? (
                <X
                  size={22}
                  className="stroke-current fill-current transition-transform duration-300"
                />
              ) : (
                <Menu
                  size={22}
                  className="stroke-current fill-current transition-transform duration-300"
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                >
                  <link.icon size={18} className="text-gray-600" />
                  <span className="font-medium text-gray-800">
                    {link.label}
                  </span>
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
              >
                <Heart size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Wishlist</span>
              </Link>
              <Link
                to="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
              >
                <MessageCircle size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">
                  Support Center
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
