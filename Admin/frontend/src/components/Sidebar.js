import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import './Sidebar.css';
import {
  Dashboard as DashboardIcon,
  PointOfSale as POSIcon,
  Inventory as OrdersIcon,
  AttachMoney as RefundIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubCategoryIcon,
  Settings as AttributesIcon,
  Store as InHouseIcon,
  ShoppingBasket as VendorIcon,
  People as CustomersIcon,
  Business as VendorsIcon,
  LocalShipping as DeliveryIcon,
  Person as EmployeesIcon,
  Brush as BannerIcon,
  CardGiftcard as OffersIcon,
  RoomService as ServiceIcon,
  Notifications as NotificationsIcon,
  TrendingUp as SalesIcon,
  Description as ProductReportIcon,
  Receipt as OrderReportIcon,
  ExpandMore as ExpandMoreIcon,
  BrandingWatermark as BrandsIcon,
  Group as WholesalersIcon,
  Mail as InboxIcon,
  Support as SupportTicketIcon,
  BusinessCenter as BusinessSetupIcon,
  Settings as SettingsIcon,
  Api as ThirdPartyIcon,
  Web as PagesIcon,
  PhotoAlbum as MediaIcon,
  PersonAdd as SubscribersIcon,
  Circle as CircleIcon,
  RadioButtonUnchecked as DotIcon,
  Menu as MenuIcon,
  HomeRepairService as ServicesIcon
} from '@mui/icons-material';

function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle, onSidebarCollapse }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [refundDropdownOpen, setRefundDropdownOpen] = useState(false);
  const [inHouseDropdownOpen, setInHouseDropdownOpen] = useState(false);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [offersDropdownOpen, setOffersDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [customersDropdownOpen, setCustomersDropdownOpen] = useState(false);
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);
  const [thirdPartyDropdownOpen, setThirdPartyDropdownOpen] = useState(false);
  const [pagesMediaDropdownOpen, setPagesMediaDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 2) {
      console.log('Searching for:', value);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Navigate to search results:', searchQuery);
    }
  };

  const toggleOrdersDropdown = () => {
    setOrdersDropdownOpen(!ordersDropdownOpen);
  };

  const toggleCategoriesDropdown = () => {
    setCategoriesDropdownOpen(!categoriesDropdownOpen);
  };

  const toggleRefundDropdown = () => {
    setRefundDropdownOpen(!refundDropdownOpen);
  };

  const toggleInHouseDropdown = () => {
    setInHouseDropdownOpen(!inHouseDropdownOpen);
  };

  const toggleVendorDropdown = () => {
    setVendorDropdownOpen(!vendorDropdownOpen);
  };

  const toggleOffersDropdown = () => {
    setOffersDropdownOpen(!offersDropdownOpen);
  };

  const toggleNotificationsDropdown = () => {
    setNotificationsDropdownOpen(!notificationsDropdownOpen);
  };

  const toggleReportsDropdown = () => {
    setReportsDropdownOpen(!reportsDropdownOpen);
  };

  const toggleCustomersDropdown = () => {
    setCustomersDropdownOpen(!customersDropdownOpen);
  };

  const toggleDeliveryDropdown = () => {
    setDeliveryDropdownOpen(!deliveryDropdownOpen);
  };

  const toggleBusinessDropdown = () => {
    setBusinessDropdownOpen(!businessDropdownOpen);
  };

  const toggleSystemDropdown = () => {
    setSystemDropdownOpen(!systemDropdownOpen);
  };

  const toggleThirdPartyDropdown = () => {
    setThirdPartyDropdownOpen(!thirdPartyDropdownOpen);
  };

  const togglePagesMediaDropdown = () => {
    setPagesMediaDropdownOpen(!pagesMediaDropdownOpen);
  };

  const toggleServicesDropdown = () => {
    setServicesDropdownOpen(!servicesDropdownOpen);
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onSidebarCollapse) {
      onSidebarCollapse(newCollapsedState);
    }
  };

  const drawerContent = (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <MenuIcon className="toggle-icon" />
        </button>
        {!isCollapsed && (
          <div className="logo-container">
            <img 
              src={`${process.env.PUBLIC_URL}/LOGO.png`} 
              alt="APNA DECORATION" 
              className="company-logo"
              onError={(e) => {
                console.error('Logo failed to load:', e.target.src);
                e.target.src = `${process.env.PUBLIC_URL}/LOGO.png`;
                e.target.onerror = function() {
                  console.error('Second logo also failed:', this.src);
                  this.style.display = 'none';
                  if (!this.parentNode.querySelector('.fallback-text')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-text';
                    fallback.textContent = 'APNA DECORATION';
                    fallback.style.cssText = 'color: white; font-weight: bold; font-size: 1.2rem;';
                    fallback.style.textAlign = 'center';
                    this.parentNode.appendChild(fallback);
                  }
                };
              }}
              onLoad={() => console.log('Logo loaded successfully')}
            />
          </div>
        )}
      </div>
      <nav className="sidebar-nav">
        <div className="search-bar">
          {!isCollapsed && (
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
              value={searchQuery}
              onChange={handleSearch}
              onKeyPress={handleSearchKeyPress}
              autoComplete="off"
            />
          )}
        </div>
        <div className="nav-section">
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} title={isCollapsed ? "Dashboard" : ""}>
            <DashboardIcon className="nav-icon-mui" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link to="/dashboard/pos" className={`nav-item ${location.pathname === '/dashboard/pos' ? 'active' : ''}`} title={isCollapsed ? "POS" : ""}>
            <POSIcon className="nav-icon-mui" />
            {!isCollapsed && <span>POS</span>}
          </Link>
        </div>

        <div className="nav-section">
          {!isCollapsed && <h3>ORDER MANAGEMENT</h3>}
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${ordersDropdownOpen ? 'open' : ''}`}
              onClick={toggleOrdersDropdown}
              onMouseEnter={isCollapsed ? () => setOrdersDropdownOpen(true) : undefined}
              onMouseLeave={isCollapsed ? () => setOrdersDropdownOpen(false) : undefined}
              title={isCollapsed ? "Orders" : ""}
            >
              <OrdersIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Orders</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${ordersDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${ordersDropdownOpen ? 'open' : ''}`} onMouseLeave={isCollapsed ? () => setOrdersDropdownOpen(false) : undefined}>
                <Link to="/dashboard/orders" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>All</span>}</Link>
                <Link to="/dashboard/orders/pending" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Pending</span>}</Link>
                <Link to="/dashboard/orders/confirmed" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Confirmed</span>}</Link>
                <Link to="/dashboard/orders/processing" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Processing</span>}</Link>
                <Link to="/dashboard/orders/out-for-delivery" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Out for Delivery</span>}</Link>
                <Link to="/dashboard/orders/delivered" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Delivered</span>}</Link>
                <Link to="/dashboard/orders/canceled" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Canceled</span>}</Link>
                <Link to="/dashboard/orders/returned" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Returned</span>}</Link>
                <Link to="/dashboard/orders/failed" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Failed to Deliver</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${refundDropdownOpen ? 'open' : ''}`}
              onClick={toggleRefundDropdown}
              title={isCollapsed ? "Refund Requests" : ""}
            >
              <RefundIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Refund Requests</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${refundDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${refundDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/refund-requests" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Pending</span>}</Link>
                <Link to="/dashboard/refund-requests/approved" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Approved</span>}</Link>
                <Link to="/dashboard/refund-requests/rejected" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Rejected</span>}</Link>
                <Link to="/dashboard/refund-requests/processing" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Processing</span>}</Link>
              </div>
            )}
          </div>
        </div>

        <div className="nav-section">
          {!isCollapsed && <h3>PRODUCT MANAGEMENT</h3>}
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${categoriesDropdownOpen ? 'open' : ''}`}
              onClick={toggleCategoriesDropdown}
              title={isCollapsed ? "Category Setup" : ""}
            >
              <CategoryIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Category Setup</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${categoriesDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${categoriesDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/category-setup" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Categories</span>}</Link>
              </div>
            )}
          </div>
          <Link to="/dashboard/product-attributes" className={`nav-item ${location.pathname === '/dashboard/product-attributes' ? 'active' : ''}`} title={isCollapsed ? "Product Attributes" : ""}>
            <AttributesIcon className="nav-icon-mui" />
            {!isCollapsed && <span>Product Attributes</span>}
          </Link>
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${inHouseDropdownOpen ? 'open' : ''}`}
              onClick={toggleInHouseDropdown}
              title={isCollapsed ? "In-house Products" : ""}
            >
              <InHouseIcon className="nav-icon-mui" />
              {!isCollapsed && <span>In-house Products</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${inHouseDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${inHouseDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/product-list" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Product List</span>}</Link>
                <Link to="/dashboard/add-new-product" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Add New Product</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${vendorDropdownOpen ? 'open' : ''}`}
              onClick={toggleVendorDropdown}
              title={isCollapsed ? "Vendor Products" : ""}
            >
              <VendorIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Vendor Products</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${vendorDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${vendorDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/vendor-products/new-requests" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>New Products Requests</span>}</Link>
                <Link to="/dashboard/vendor-products/approved" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Approved Products</span>}</Link>
                <Link to="/dashboard/vendor-products/denied" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Denied Products</span>}</Link>
              </div>
            )}
          </div>
        </div>

        <div className="nav-section">
          {!isCollapsed && <h3>SERVICES MANAGEMENT</h3>}
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${servicesDropdownOpen ? 'open' : ''}`}
              onClick={toggleServicesDropdown}
              title={isCollapsed ? "Services" : ""}
            >
              <ServiceIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Services</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${servicesDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${servicesDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/service-categories" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Service Category</span>}</Link>
                <Link to="/dashboard/services" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Service List</span>}</Link>
                <Link to="/dashboard/add-service" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Add New Service</span>}</Link>
                <Link to="/dashboard/bookings" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Bookings</span>}</Link>
              </div>
            )}
          </div>
        </div>

        <div className="nav-section">
          {!isCollapsed && <h3>PROMOTION MANAGEMENT</h3>}
          <Link to="/dashboard/banner-setup" className="nav-item" title={isCollapsed ? "Banner Setup" : ""}>
            <BannerIcon className="nav-icon-mui" />
            {!isCollapsed && <span>Banner Setup</span>}
          </Link>
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${offersDropdownOpen ? 'open' : ''}`}
              onClick={toggleOffersDropdown}
              title={isCollapsed ? "Offers & Deals" : ""}
            >
              <OffersIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Offers & Deals</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${offersDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${offersDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/offers/coupon" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Coupon</span>}</Link>
                <Link to="/dashboard/offers/clearance-sale" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Clearance Sale</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${notificationsDropdownOpen ? 'open' : ''}`}
              onClick={toggleNotificationsDropdown}
              title={isCollapsed ? "Notifications" : ""}
            >
              <NotificationsIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Notifications</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${notificationsDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${notificationsDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/notifications/send" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Send Notification</span>}</Link>
                <Link to="/dashboard/notifications/push-setup" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Push Notifications Setup</span>}</Link>
              </div>
            )}
          </div>
        </div>

        <div className="nav-section">
          {!isCollapsed && <h3>HELP & SUPPORT</h3>}
          <Link to="/dashboard/contact-messages" className="nav-item" title={isCollapsed ? "Contact Messages" : ""}>
            <InboxIcon className="nav-icon-mui" />
            {!isCollapsed && <span>Contact Messages</span>}
          </Link>
          <Link to="/dashboard/support-ticket" className="nav-item" title={isCollapsed ? "Support Ticket" : ""}>
            <SupportTicketIcon className="nav-icon-mui" />
            {!isCollapsed && <span>Support Ticket</span>}
          </Link>
        </div>

        <div className="nav-section">
          {!isCollapsed && <h3>REPORTS & ANALYSIS</h3>}
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${reportsDropdownOpen ? 'open' : ''}`}
              onClick={toggleReportsDropdown}
              title={isCollapsed ? "Sales & Transaction Report" : ""}
            >
              <SalesIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Sales & Transaction Report</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${reportsDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${reportsDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/reports/earning-reports" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Earning Reports</span>}</Link>
                <Link to="/dashboard/reports/inhouse-sales" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Inhouse Sales</span>}</Link>
                <Link to="/dashboard/reports/vendor-sales" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Vendor Sales</span>}</Link>
                <Link to="/dashboard/reports/transaction-report" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Transaction Report</span>}</Link>
              </div>
            )}
          </div>
          <Link to="/dashboard/product-report" className="nav-item" title={isCollapsed ? "Product Report" : ""}>
            <ProductReportIcon className="nav-icon-mui" />
            {!isCollapsed && <span>Product Report</span>}
          </Link>
          <Link to="/dashboard/reports/order-report" className="nav-item" title={isCollapsed ? "Order Report" : ""}>
            <OrderReportIcon className="nav-icon-mui" />
            {!isCollapsed && <span>Order Report</span>}
          </Link>
        </div>

        <div className="nav-section">
          {!isCollapsed && <h3>USER MANAGEMENT</h3>}
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${customersDropdownOpen ? 'open' : ''}`}
              onClick={toggleCustomersDropdown}
              title={isCollapsed ? "Customers" : ""}
            >
              <CustomersIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Customers</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${customersDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${customersDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/customers" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Customer List</span>}</Link>
                <Link to="/dashboard/customer-reviews" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Customer Reviews</span>}</Link>
                <Link to="/dashboard/wallet" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Wallet</span>}</Link>
                <Link to="/dashboard/wallet-bonus-setup" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Wallet Bonus Setup</span>}</Link>
                <Link to="/dashboard/customer-loyalty-point-report" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Loyalty Points</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${vendorDropdownOpen ? 'open' : ''}`}
              onClick={toggleVendorDropdown}
              title={isCollapsed ? "Vendors" : ""}
            >
              <VendorsIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Vendors</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${vendorDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${vendorDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/add-new-vendor" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Add New Vendor</span>}</Link>
                <Link to="/dashboard/vendor-list" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Vendor List</span>}</Link>
                <Link to="/dashboard/withdraws" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Withdraws</span>}</Link>
                <Link to="/dashboard/withdrawal-methods" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Withdrawal Methods</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${deliveryDropdownOpen ? 'open' : ''}`}
              onClick={toggleDeliveryDropdown}
              title={isCollapsed ? "Delivery Men" : ""}
            >
              <DeliveryIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Delivery Men</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${deliveryDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${deliveryDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/add-new-delivery" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Add New</span>}</Link>
                <Link to="/dashboard/delivery-list" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>List</span>}</Link>
                <Link to="/dashboard/delivery-withdraw" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Withdraw</span>}</Link>
                <Link to="/dashboard/delivery-emergency-contact" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Emergency Contact</span>}</Link>
              </div>
            )}
          </div>
        </div>
        <div className="nav-section">
          {!isCollapsed && <h3>REPORTS</h3>}
          <div className="nav-dropdown">
            <button 
              className={`nav-item dropdown-toggle ${businessDropdownOpen ? 'open' : ''}`}
              onClick={toggleBusinessDropdown}
              title={isCollapsed ? "Business Setup" : ""}
            >
              <BusinessSetupIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Business Setup</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${businessDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${businessDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/business-settings" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Business Settings</span>}</Link>
                <Link to="/dashboard/inhouse-shop" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>In-house Shop</span>}</Link>
                <Link to="/dashboard/seo-settings" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>SEO Settings</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-group">
            <button 
              className={`nav-item dropdown-toggle ${systemDropdownOpen ? 'open' : ''}`}
              onClick={toggleSystemDropdown}
              title={isCollapsed ? "System Setup" : ""}
            >
              <SettingsIcon className="nav-icon-mui" />
              {!isCollapsed && <span>System Setup</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${systemDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${systemDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/system-settings" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>System Settings</span>}</Link>
                <Link to="/dashboard/login-settings" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Login Settings</span>}</Link>
                <Link to="/dashboard/themes-addons" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Themes & Addons</span>}</Link>
                <Link to="/dashboard/email-template" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Email Template</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-group">
            <button 
              className={`nav-item dropdown-toggle ${thirdPartyDropdownOpen ? 'open' : ''}`}
              onClick={toggleThirdPartyDropdown}
              title={isCollapsed ? "3rd Party" : ""}
            >
              <ThirdPartyIcon className="nav-icon-mui" />
              {!isCollapsed && <span>3rd Party</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${thirdPartyDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${thirdPartyDropdownOpen ? 'open' : ''}`}>
                <Link to="/payment-methods" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Payment Methods</span>}</Link>
                <Link to="/dashboard/marketing-tools" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Marketing Tools</span>}</Link>
                <Link to="/dashboard/third-party-config" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Other Configuration</span>}</Link>
              </div>
            )}
          </div>
          <div className="nav-group">
            <button 
              className={`nav-item dropdown-toggle ${pagesMediaDropdownOpen ? 'open' : ''}`}
              onClick={togglePagesMediaDropdown}
              title={isCollapsed ? "Pages & Media" : ""}
            >
              <PagesIcon className="nav-icon-mui" />
              {!isCollapsed && <span>Pages & Media</span>}
              {!isCollapsed && <ExpandMoreIcon className={`dropdown-arrow-mui ${pagesMediaDropdownOpen ? 'open' : ''}`} />}
            </button>
            {!isCollapsed && (
              <div className={`dropdown-menu ${pagesMediaDropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard/business-pages" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Business Pages</span>}</Link>
                <Link to="/dashboard/social-media-links" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Social Media Links</span>}</Link>
                <Link to="/dashboard/gallery" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Gallery</span>}</Link>
                <Link to="/dashboard/vendor-registration" className="nav-item sub-item"><DotIcon className="nav-icon-mui" />{!isCollapsed && <span>Vendor Registration</span>}</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <Box>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isCollapsed ? 70 : drawerWidth,
              transition: 'width 0.3s ease'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}

export default Sidebar;
