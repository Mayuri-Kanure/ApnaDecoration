import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useDebounce } from "../hooks/useDebounce";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  MapPin,
  Package,
  LogOut,
  Home,
  Grid3x3,
  Phone,
  Mail,
  Star,
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
  const [notifications, setNotifications] = useState([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setNotifications([]);
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/notifications`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data || data.notifications || []);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const popularSearches = [
    "Birthday Decoration",
    "Wedding Flowers",
    "Anniversary Gifts",
    "Party Lights",
    "Festive Decor",
  ];

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      performSearch(searchTerm);
    } else if (searchTerm.trim().length === 0) {
      setSearchResults({ products: [], categories: [] });
    }
  }, [searchTerm]);

  const performSearch = async (term) => {
    try {
      setSearchLoading(true);
      const productEndpoints = [
        `${process.env.REACT_APP_PRODUCT_API_URL || "https://admin-api.apnadecoration.com/api"}/products/search?q=${encodeURIComponent(term)}`,
        `${process.env.REACT_APP_PRODUCT_API_URL || "https://admin-api.apnadecoration.com/api"}/products?search=${encodeURIComponent(term)}`,
        `${process.env.REACT_APP_PRODUCT_API_URL || "https://admin-api.apnadecoration.com/api"}/products`,
      ];

      let productsData = { data: [] };

      for (const endpoint of productEndpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              productsData = data;
              break;
            }

            if (data.data && Array.isArray(data.data)) {
              const searchLower = term.toLowerCase();
              const filtered = data.data
                .map((product) => {
                  const name = product.name?.toLowerCase() || "";
                  const description = product.description?.toLowerCase() || "";
                  const category = product.category?.name?.toLowerCase() || "";

                  let score = 0;
                  if (name === searchLower) score += 100;
                  else if (name.startsWith(searchLower)) score += 80;
                  else if (name.includes(searchLower)) score += 60;

                  if (category === searchLower) score += 40;
                  else if (category.startsWith(searchLower)) score += 30;
                  else if (category.includes(searchLower)) score += 20;

                  if (description.includes(searchLower)) score += 10;

                  return { product, score };
                })
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((item) => item.product);

              if (filtered.length > 0) {
                productsData = { data: filtered };
                break;
              }
            }
          }
        } catch (err) {
          continue;
        }
      }

      let categoriesData = { data: [] };
      if (productsData.data && productsData.data.length > 0) {
        // Extract category IDs from products
        const categoryIds = [
          ...new Set(productsData.data.map((p) => {
            if (typeof p.category === 'object' && p.category?._id) {
              return p.category._id;
            }
            return p.category;
          }).filter(Boolean)),
        ];
        
        // Try to fetch real category names from API
        let categoryMap = {};
        try {
          const categoryEndpoints = [
            `${process.env.REACT_APP_API_URL || "https://admin-api.apnadecoration.com/api"}/categories`,
            `${process.env.REACT_APP_API_URL || "https://admin-api.apnadecoration.com/api"}/service-categories`,
          ];
          
          for (const endpoint of categoryEndpoints) {
            try {
              const response = await fetch(endpoint);
              if (response.ok) {
                const data = await response.json();
                const catArray = data.categories || data.data || [];
                if (Array.isArray(catArray) && catArray.length > 0) {
                  catArray.forEach(cat => {
                    if (cat._id || cat.id) {
                      categoryMap[cat._id || cat.id] = cat.name;
                    }
                  });
                  break;
                }
              }
            } catch (err) {
              continue;
            }
          }
        } catch (err) {
          console.log('Could not fetch category names from API');
        }
        
        categoriesData = {
          data: categoryIds.slice(0, 3).map((catId, index) => {
            // Check if we have a real name from API
            const realName = categoryMap[catId];
            
            // If we have a real name, use it
            if (realName) {
              return { id: catId, name: realName };
            }
            
            // Otherwise, check if it looks like a MongoDB ObjectId
            const isObjectId = /^[a-f0-9]{24}$/i.test(catId);
            if (isObjectId) {
              // If it's an ObjectId and we don't have a name, skip it
              return null;
            }
            
            // Try to format non-ObjectId categories
            let categoryName = catId || `Category ${index + 1}`;
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
              categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            }
            return { id: catId, name: categoryName };
          }).filter(Boolean), // Remove nulls for ObjectIds without names
        };
      }

      setSearchResults({
        products: productsData.data?.slice(0, 5) || [],
        categories: categoriesData.data?.slice(0, 3) || [],
      });
      setSearchDropdownOpen(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ products: [], categories: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/products", label: "Products", icon: Grid3x3 },
    { path: "/services", label: "Services", icon: Star },
    { path: "/faq", label: "FAQ", icon: HelpCircle },
    { path: "/about", label: "About", icon: Phone },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header
      className={`sticky top-0 z-[9998] transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-100" : "bg-white border-b border-gray-200"}`}
    >
      {/* CHANGED: Swapped max-w-7xl for max-w-full with high horizontal padding to expand the layout edge-to-edge */}
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* CHANGED: Added flex items-center justify-between to keep structural items beautifully separated */}
        <div className="flex items-center justify-between h-20 gap-4">
          {/* LEFT SIDE: Brand Identity / Logo */}
          <div className="flex items-center space-x-6 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-3 group focus:outline-none"
              onClick={(e) => {
                if (location.pathname === "/") {
                  e.preventDefault();
                  window.location.reload();
                }
              }}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <img
                  src="/logo.png"
                  alt="Apna Decoration Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Apna Decoration
                </h1>
                <p className="text-[11px] font-medium text-gray-400 tracking-wide">
                  Celebration Made Perfect
                </p>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION LINKS — Pulled left next to the logo with clear spacing */}
            <nav className="hidden xl:flex items-center space-x-1 pl-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === link.path ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CENTER SIDE: WIDE LIVE SEARCH INPUT ENG — Expands to fill screen canvas perfectly */}
          <div
            className="hidden lg:flex items-center flex-1 max-w-2xl mx-8"
            ref={searchRef}
          >
            <div className="relative w-full z-[9999]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search premium decorations (e.g., Birthday, Wedding, Flowers)..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (value.trim().length >= 2) setSearchDropdownOpen(true);
                  else if (value.trim().length === 0)
                    setSearchDropdownOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim().length > 0) {
                    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                    setSearchDropdownOpen(false);
                    setSearchTerm("");
                  }
                }}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2)
                    setSearchDropdownOpen(true);
                }}
                className="w-full pl-11 pr-4 py-2.5 border bg-gray-50/50 text-gray-900 placeholder-gray-400 border-gray-200 rounded-full text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-inner"
              />

              {searchDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-[99999]">
                  {searchLoading ? (
                    <div className="p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-solid border-blue-600 border-t-transparent" />
                      <p className="text-sm text-gray-400 mt-2">
                        Scanning records...
                      </p>
                    </div>
                  ) : searchTerm.trim().length === 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Popular Decor Searches
                        </p>
                      </div>
                      {popularSearches.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchTerm(suggestion);
                            setTimeout(() => setSearchDropdownOpen(false), 100);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Search className="text-blue-600" size={14} />
                          </div>
                          <p className="text-sm text-gray-700 font-semibold">
                            {suggestion}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.categories?.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Categories
                            </p>
                          </div>
                          {searchResults.categories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${encodeURIComponent(category.name)}`}
                              onClick={() => {
                                setSearchDropdownOpen(false);
                                setSearchTerm("");
                              }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Grid3x3
                                  className="text-purple-600"
                                  size={16}
                                />
                              </div>
                              <h4 className="text-sm font-semibold text-gray-800">
                                {category.name}
                              </h4>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.products?.length > 0 && (
                        <div className="border-t border-gray-100">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Decoration Packages
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
                              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/40 border-b border-gray-50 last:border-0"
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
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
                                      size={16}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate">
                                  {product.name}
                                </h4>
                                <p className="text-xs font-bold text-blue-600 mt-0.5">
                                  ₹{product.price || "N/A"}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {(searchResults.products?.length > 0 || searchResults.categories?.length > 0) && (
                        <div className="border-t border-gray-100 p-2">
                          <button
                            onClick={() => {
                              navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                              setSearchDropdownOpen(false);
                              setSearchTerm("");
                            }}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Search size={14} />
                            View All Results
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: UTILITY PROFILE ACTIONS PANEL — Plushed comfortably right */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Standard backup buttons remain highly responsive */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link badge */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-gray-50 text-gray-600 transition-colors flex items-center justify-center"
            >
              <Heart className="h-5 w-5 stroke-[2]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-gray-50 text-gray-600 transition-colors flex items-center justify-center"
            >
              <ShoppingBag className="h-5 w-5 stroke-[2]" />
              {getTotalItems() > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Profile dropdown menu layout wrapper */}
            <div className="hidden lg:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2.5 rounded-full hover:bg-gray-50 text-gray-600 transition-colors flex items-center justify-center"
              >
                <User className="h-5 w-5 stroke-[2]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-1">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile?tab=personal"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-semibold"
                        >
                          <User size={15} /> Account Details
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-semibold"
                        >
                          <Package size={15} /> Booked Orders
                        </Link>
                        <Link
                          to="/profile?tab=addresses"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-semibold"
                        >
                          <MapPin size={15} /> Saved Venues
                        </Link>
                        <div className="border-t border-gray-100" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold text-left"
                        >
                          <LogOut size={15} /> Secure Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold"
                      >
                        <User size={15} /> Access Portal
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger view button handles mobile toggle layout maps */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay Node */}
        {mobileSearchOpen && (
          <div className="lg:hidden fixed inset-0 bg-white z-[10000] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">
                Search Products
              </h2>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 rounded-full bg-gray-50 text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search product catalogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim().length > 0) {
                    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                    setMobileSearchOpen(false);
                    setSearchTerm("");
                  }
                }}
                className="w-full pl-11 pr-4 py-3 border bg-gray-50 border-gray-200 rounded-xl text-sm"
              />
            </div>
            {searchTerm.trim().length > 0 && (
              <button
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                  setMobileSearchOpen(false);
                  setSearchTerm("");
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Search
              </button>
            )}
          </div>
        )}

        {/* Dynamic Mobile Menu Slide-Out Context Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white py-2 shadow-inner space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-lg text-sm font-semibold text-gray-700 ${location.pathname === link.path ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
              >
                <link.icon size={16} /> {link.label}
              </Link>
            ))}
            <Link
              to={isAuthenticated ? "/profile?tab=personal" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-3 mx-2 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50"
            >
              <User size={16} />{" "}
              {isAuthenticated ? "Profile Account" : "Login Portal"}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
