import React from 'react';

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';

import './styles/global.css';

import Dashboard from './pages/Dashboard';

import Orders from './pages/Orders';

import POS from './pages/POS';

import Login from './components/Login';

import Register from './pages/Register';

import Layout from './components/Layout';

import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import { ProfileProvider } from './contexts/ProfileContext';

import OrdersPending from './pages/OrdersPending';

import OrdersConfirmed from './pages/OrdersConfirmed';

import OrdersProcessing from './pages/OrdersProcessing';

import OrdersDelivered from './pages/OrdersDelivered';

import OrdersFailed from './pages/OrdersFailed';

import OrdersReturned from './pages/OrdersReturned';

import OrdersOutForDelivery from './pages/OrdersOutForDelivery';

import OrderDetails from './pages/OrderDetails';

import ThirdPartyConfig from './pages/ThirdPartyConfig';

import RefundRequests from './pages/RefundRequests';

import RefundApproved from './pages/RefundApproved';

import RefundPending from './pages/RefundPending';

import RefundProcessing from './pages/RefundProcessing';

import RefundRejected from './pages/RefundRejected';

import CategorySetup from './pages/CategorySetup';

import ProductAttributes from './pages/ProductAttributes';

import ProductList from './pages/ProductList';

import AddProduct from './pages/add-product';

import ProductDetails from './pages/ProductDetails';

import GenerateBarcode from './pages/GenerateBarcode';

import BulkImport from './pages/bulk-import';

import RequestRestockList from './pages/request-restock-list';

import NewProducts from './pages/new-products';

import BannerSetup from './pages/BannerSetup';

import CouponSetup from './pages/CouponSetup';

import ClearanceSale from './pages/ClearanceSale';

import SendNotification from './pages/SendNotification';

import PushNotificationSetup from './pages/PushNotificationSetup';

import SupportTicket from './pages/SupportTicket';

import ContactMessages from './pages/ContactMessages';

import CustomerList from './pages/CustomerList';

import CustomerReviews from './pages/CustomerReviews';

import Analytics from './pages/Analytics';

import AddService from './pages/AddService';

import ServiceCategories from './pages/ServiceCategories';

import ServiceList from './pages/ServiceList';

import Bookings from './pages/Bookings';

import Wallet from './pages/Wallet';

import WalletBonusSetup from './pages/WalletBonusSetup';

import CustomerLoyaltyPointReport from './pages/CustomerLoyaltyPointReport';

import TransactionReport from './pages/reports/TransactionReport';

import ProductReport from './pages/ProductReport';

import OrderReport from './pages/OrderReport';

import EarningReports from './pages/reports/EarningReports';

import InhouseSales from './pages/reports/InhouseSales';

import VendorSales from './pages/reports/VendorSales';

import BusinessSettings from './pages/BusinessSettings';

import InhouseShop from './pages/inhouse-shop';

import SeoSettings from './pages/SeoSettings';

import SystemSettings from './pages/SystemSettings';

import LoginSettings from './pages/LoginSettings';

import CustomAdminLogin from './pages/CustomAdminLogin';

import CustomEmployeeLogin from './pages/CustomEmployeeLogin';

import ThemeAddons from './pages/ThemeAddons';

import EmailTemplate from './pages/EmailTemplate';

import PaymentMethods from './pages/PaymentMethods';

import MarketingTools from './pages/MarketingTools';

import BusinessPages from './pages/BusinessPages';

import SocialMediaLinks from './pages/SocialMediaLinks';

import Gallery from './pages/Gallery';

import VendorRegistration from './pages/VendorRegistration';

import AddVendor from './pages/add-new-vendor';

import Profile from './pages/Profile';

import VendorMailTemplate from './pages/VendorMailTemplate';

import CustomerMailTemplate from './pages/customer-mail-template';

import DeliveryManMailTemplate from './pages/delivery-man-mail-template';

import DeliveryEmergencyContact from './pages/DeliveryEmergencyContact';

import EmployeeRoleSetup from './pages/EmployeeRoleSetup';

import NewProductsRequests from './pages/vendor-products/new-requests';

import ApprovedProducts from './pages/vendor-products/approved';

import DeniedProducts from './pages/vendor-products/denied';

import DeliveryList from './pages/DeliveryList';

import AddDelivery from './pages/AddDelivery';

import CurrencyManagement from './components/CurrencyManagement';

import DeliveryWithdraw from './pages/DeliveryWithdraw';

import VendorList from './pages/VendorList';

import Withdraws from './pages/Withdraws';

import WithdrawMethod from './pages/WithdrawMethod';



const theme = createTheme({

  palette: {

    primary: {

      main: '#1e3a5f',

    },

    secondary: {

      main: '#2d5a8c',

    },

  },

  typography: {

    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',

    fontSize: 14,

    h1: {

      fontSize: '2.2rem',

      fontWeight: 500,

    },

    h2: {

      fontSize: '1.8rem',

      fontWeight: 500,

    },

    h3: {

      fontSize: '1.5rem',

      fontWeight: 500,

    },

    h4: {

      fontSize: '1.3rem',

      fontWeight: 500,

    },

    h5: {

      fontSize: '1.1rem',

      fontWeight: 500,

    },

    h6: {

      fontSize: '1rem',

      fontWeight: 500,

    },

    body1: {

      fontSize: '0.95rem',

    },

    body2: {

      fontSize: '0.875rem',

    },

    button: {

      fontSize: '0.875rem',

      textTransform: 'none',

    },

    caption: {

      fontSize: '0.75rem',

    },

  },

});



function App() {

  return (

    <ThemeProvider theme={theme}>

      <CssBaseline />

      <AuthProvider>

        <ProfileProvider>

          <Router>

            <Routes>

              <Route path="/login" element={<LoginWrapper />} />

              <Route path="/admin" element={<CustomAdminLogin />} />

              <Route path="/admin-dashboard" element={<CustomAdminLogin />} />

              <Route path="/employee" element={<CustomEmployeeLogin />} />

              <Route path="/staff-login" element={<CustomEmployeeLogin />} />

              <Route path="/register" element={<Register />} />

              <Route path="/generate-barcode" element={<GenerateBarcode />} />

              <Route path="/" element={<LoginWrapper />} />

              <Route path="/profile" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<Profile />} />

              </Route>

              <Route path="/payment-methods" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<PaymentMethods />} />

              </Route>

              <Route path="/third-party-config" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<ThirdPartyConfig />} />

              </Route>

              <Route path="/business-pages" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<BusinessPages />} />

              </Route>

              <Route path="/social-media-links" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<SocialMediaLinks />} />

              </Route>

              <Route path="/gallery" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<Gallery />} />

              </Route>

              <Route path="/vendor-registration" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<VendorRegistration />} />

                <Route path="add-new-vendor" element={<AddVendor />} />

              </Route>

              <Route path="/vendor-mail-template" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<VendorMailTemplate />} />

              </Route>

              <Route path="/customer-mail-template" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<CustomerMailTemplate />} />

              </Route>

              <Route path="/delivery-man-mail-template" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<DeliveryManMailTemplate />} />

              </Route>

              <Route path="/orders" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route path=":id" element={<OrderDetails />} />

                <Route path=":status" element={<Orders />} />

                <Route index element={<Orders />} />

                <Route path="pending" element={<OrdersPending />} />

                <Route path="confirmed" element={<OrdersConfirmed />} />

                <Route path="processing" element={<OrdersProcessing />} />

                <Route path="delivered" element={<OrdersDelivered />} />

                <Route path="failed" element={<OrdersFailed />} />

                <Route path="returned" element={<OrdersReturned />} />

                <Route path="out-for-delivery" element={<OrdersOutForDelivery />} />

                <Route path="canceled" element={<OrdersFailed />} />

              </Route>

              <Route path="/dashboard" element={

                <ProtectedRoute>

                  <Layout />

                </ProtectedRoute>

              }>

                <Route index element={<Dashboard />} />

                <Route path="pos" element={<POS />} />

                <Route path="orders/:id" element={<OrderDetails />} />

                <Route path="orders/:status" element={<Orders />} />

                <Route path="orders" element={<Orders />} />

                <Route path="orders/pending" element={<OrdersPending />} />

                <Route path="orders/confirmed" element={<OrdersConfirmed />} />

                <Route path="orders/processing" element={<OrdersProcessing />} />

                <Route path="orders/delivered" element={<OrdersDelivered />} />

                <Route path="orders/failed" element={<OrdersFailed />} />

                <Route path="orders/returned" element={<OrdersReturned />} />

                <Route path="orders/out-for-delivery" element={<OrdersOutForDelivery />} />

                <Route path="orders/canceled" element={<OrdersFailed />} />

                <Route path="third-party-config" element={<ThirdPartyConfig />} />

                <Route path="refund-requests" element={<RefundRequests />} />

                <Route path="refund-requests/approved" element={<RefundApproved />} />

                <Route path="refund-requests/pending" element={<RefundPending />} />

                <Route path="refund-requests/processing" element={<RefundProcessing />} />

                <Route path="refund-requests/rejected" element={<RefundRejected />} />

                <Route path="category-setup" element={<CategorySetup />} />

                <Route path="product-attributes" element={<ProductAttributes />} />

                <Route path="product-list" element={<ProductList />} />

                <Route path="add-new-product" element={<AddProduct />} />

                <Route path="edit-product" element={<AddProduct />} />

                <Route path="products/:id" element={<ProductDetails />} />

                <Route path="generate-barcode" element={<GenerateBarcode />} />

                <Route path="bulk-import" element={<BulkImport />} />

                <Route path="request-restock-list" element={<RequestRestockList />} />

                <Route path="new-products" element={<NewProducts />} />

                <Route path="vendor-products/new-requests" element={<NewProductsRequests />} />

                <Route path="vendor-products/approved" element={<ApprovedProducts />} />

                <Route path="vendor-products/denied" element={<DeniedProducts />} />

                <Route path="services" element={<ServiceList />} />

                <Route path="add-service" element={<AddService />} />

                <Route path="edit-service/:id" element={<AddService />} />

                <Route path="service-categories" element={<ServiceCategories />} />

                <Route path="bookings" element={<Bookings />} />

                <Route path="banner-setup" element={<BannerSetup />} />

                <Route path="offers/coupon" element={<CouponSetup />} />

                <Route path="offers/clearance-sale" element={<ClearanceSale />} />

                <Route path="notifications/send" element={<SendNotification />} />

                <Route path="notifications/push-setup" element={<PushNotificationSetup />} />

                <Route path="support-ticket" element={<SupportTicket />} />

                <Route path="contact-messages" element={<ContactMessages />} />

                <Route path="customers" element={<CustomerList />} />

                <Route path="customer-reviews" element={<CustomerReviews />} />

                <Route path="analytics" element={<Analytics />} />

                <Route path="wallet" element={<Wallet />} />

                <Route path="wallet-bonus-setup" element={<WalletBonusSetup />} />

                <Route path="customer-loyalty-point-report" element={<CustomerLoyaltyPointReport />} />

                <Route path="reports/earning-reports" element={<EarningReports />} />

                <Route path="reports/inhouse-sales" element={<InhouseSales />} />

                <Route path="reports/vendor-sales" element={<VendorSales />} />

                <Route path="reports/transaction-report" element={<TransactionReport />} />

                <Route path="reports/order-report" element={<OrderReport />} />

                <Route path="product-report" element={<ProductReport />} />

                <Route path="delivery-list" element={<DeliveryList />} />

                <Route path="add-new-delivery" element={<AddDelivery />} />

                <Route path="employee-role-setup" element={<EmployeeRoleSetup />} />

                <Route path="business-settings" element={<BusinessSettings />} />

                <Route path="inhouse-shop" element={<InhouseShop />} />

                <Route path="currency-management" element={<CurrencyManagement />} />

                <Route path="gallery" element={<Gallery />} />

                <Route path="vendor-registration" element={<VendorRegistration />} />

                <Route path="business-pages" element={<BusinessPages />} />

                <Route path="social-media-links" element={<SocialMediaLinks />} />

                <Route path="add-vendor" element={<AddVendor />} />

                <Route path="delivery-emergency-contact" element={<DeliveryEmergencyContact />} />

                <Route path="delivery-withdraw" element={<DeliveryWithdraw />} />

                <Route path="vendor-list" element={<VendorList />} />

                <Route path="withdraws" element={<Withdraws />} />

                <Route path="withdrawal-methods" element={<WithdrawMethod />} />

                <Route path="seo-settings" element={<SeoSettings />} />

                <Route path="login-settings" element={<LoginSettings />} />

                <Route path="marketing-tools" element={<MarketingTools />} />

                <Route path="add-new-vendor" element={<AddVendor />} />

                <Route path="profile" element={<Profile />} />

                <Route path="system-settings" element={<SystemSettings />} />

                <Route path="themes-addons" element={<ThemeAddons />} />

                <Route path="email-template" element={<EmailTemplate />} />

              </Route>

            </Routes>

          </Router>

        </ProfileProvider>

      </AuthProvider>

    </ThemeProvider>

  );

}



function LoginWrapper() {

  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();



  // Redirect to dashboard if already authenticated

  React.useEffect(() => {

    if (isAuthenticated) {

      navigate('/dashboard');

    }

  }, [isAuthenticated, navigate]);



  if (isAuthenticated) {

    return <div>Loading...</div>;

  }



  return <Login onLogin={login} />;

}



export default App;

