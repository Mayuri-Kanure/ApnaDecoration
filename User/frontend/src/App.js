import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";

import { CartProvider } from "./contexts/CartContext";

import { ProductProvider } from "./contexts/ProductContext";

import { ReviewsProvider } from "./contexts/ReviewsContext";

import { ToastProvider } from "./contexts/ToastContext";

import { NotificationProvider } from "./contexts/NotificationContext";

import { ThemeProvider } from "./contexts/ThemeContext";

import { SecurityProvider } from "./components/SecurityProvider";

import ScrollToTop from "./components/ScrollToTop";

import ErrorBoundary from "./components/ErrorBoundary";

import AsyncErrorBoundary from "./components/AsyncErrorBoundary";

import ProtectedRoute from "./components/ProtectedRoute";

import errorLogger from "./utils/errorLogger";

import Hero from "./pages/Hero";

import Products from "./pages/Products";

import ProductDetail from "./pages/ProductDetail";

import ServiceDetail from "./pages/ServiceDetail";

import Cart from "./pages/Cart";

import Checkout from "./pages/Checkout";

import OrderConfirmation from "./pages/OrderConfirmation";

import Profile from "./pages/Profile";

import Login from "./pages/Login";

import SearchPage from "./pages/Search";

import Wishlist from "./pages/Wishlist";

import HelpSupport from "./pages/HelpSupport";

import About from "./pages/About";

import FAQ from "./pages/FAQ";

import Contact from "./pages/Contact";

import Services from "./pages/Services";

import ServiceCategories from "./pages/ServiceCategories";

import Categories from "./pages/Categories";

import FeaturedProducts from "./pages/FeaturedProducts";

import Privacy from "./pages/Privacy";

import Terms from "./pages/Terms";

import Refund from "./pages/Refund";

import Shipping from "./pages/Shipping";

import OrderSuccess from "./pages/OrderSuccess";

import Orders from "./pages/Orders";

import OrderDetails from "./pages/OrderDetails";

import OrderTracking from "./pages/OrderTracking";

import AddressManagement from "./pages/AddressManagement";

import ClearanceSale from "./pages/ClearanceSale";

import SupportCenter from "./pages/SupportCenter";

import { ToastManager } from "./components/ToastNotification";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";

import "./App.css";

const App = () => {
  // Initialize error logging
  errorLogger.log(new Error("Application started"), "info", {
    component: "App",
    timestamp: new Date().toISOString(),
  });

  return (
    <ErrorBoundary componentName="App">
      <ThemeProvider>
        <ProductProvider>
          {/* <SecurityProvider> */}
          <AuthProvider>
            <CartProvider>
              <ReviewsProvider>
                <ToastProvider>
                  <NotificationProvider>
                    <Router>
                      <ScrollToTop />
                      <ToastManager />
                      <Routes>
                        <Route path="/" element={<Hero />} />

                        <Route
                          path="/products"
                          element={
                            <ProtectedRoute>
                              <Products />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="/categories" element={<Categories />} />

                        <Route
                          path="/featured-products"
                          element={<FeaturedProducts />}
                        />

                        <Route
                          path="/product/:id"
                          element={
                            <ProtectedRoute>
                              <ProductDetail />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/cart"
                          element={
                            <ProtectedRoute>
                              <Cart />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/order-confirmation"
                          element={
                            <ProtectedRoute>
                              <OrderConfirmation />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="/login" element={<Login />} />

                        <Route
                          path="/search"
                          element={
                            <ProtectedRoute>
                              <SearchPage />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/wishlist"
                          element={
                            <ProtectedRoute>
                              <Wishlist />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="/about" element={<About />} />

                        <Route path="/faq" element={<FAQ />} />

                        <Route path="/contact" element={<Contact />} />

                        <Route
                          path="/services"
                          element={
                            <ProtectedRoute>
                              <Services />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/service/:id"
                          element={
                            <ProtectedRoute>
                              <ServiceDetail />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/service-categories"
                          element={<ServiceCategories />}
                        />

                        <Route path="/privacy" element={<Privacy />} />

                        <Route path="/terms" element={<Terms />} />

                        <Route path="/refund" element={<Refund />} />

                        <Route path="/shipping" element={<Shipping />} />

                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <Orders />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/order-details/:orderId"
                          element={
                            <ProtectedRoute>
                              <OrderDetails />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/track/:orderNumber"
                          element={<OrderTracking />}
                        />

                        <Route
                          path="/order-tracking/:orderId"
                          element={
                            <ProtectedRoute>
                              <OrderTracking />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/address-management"
                          element={
                            <ProtectedRoute>
                              <AddressManagement />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/support"
                          element={
                            <ProtectedRoute>
                              <SupportCenter />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/help-support"
                          element={
                            <ProtectedRoute>
                              <HelpSupport />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/order-success"
                          element={
                            <ProtectedRoute>
                              <OrderSuccess />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/clearance-sale"
                          element={
                            <ProtectedRoute>
                              <ClearanceSale />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin Routes */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedRoute>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="*" element={<Hero />} />
                      </Routes>
                    </Router>
                  </NotificationProvider>
                </ToastProvider>
              </ReviewsProvider>
            </CartProvider>
          </AuthProvider>
          {/* </SecurityProvider> */}
        </ProductProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
