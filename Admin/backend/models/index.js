const mongoose = require('mongoose');

// Import shared models
const Product = require('./Product');
const Category = require('./Category');
const Order = require('./Order');
const User = require('./User');
const Cart = require('./Cart');
const Banner = require('./Banner');
const Service = require('./Service');
const ServiceCategory = require('./ServiceCategory');
const Address = require('./Address');
const Notification = require('./Notification');
const PaymentMethod = require('./PaymentMethod');
const BusinessSettings = require('./BusinessSettings');

// Admin-specific models
const AdminSettings = require('./AdminSettings');
const AdminUser = require('./AdminUser');
const Customer = require('./Customer');
const CustomerReview = require('./CustomerReview');
const Delivery = require('./Delivery');
const DeliveryBoy = require('./DeliveryBoy');
const DeliveryEmergencyContact = require('./DeliveryEmergencyContact');
const DeliveryWithdraw = require('./DeliveryWithdraw');
const FAQ = require('./FAQ');
const FileManager = require('./FileManager');
const LoyaltyPoint = require('./LoyaltyPoint');
const PolicyContent = require('./PolicyContent');
const Reason = require('./Reason');
const Refund = require('./Refund');
const RestockRequest = require('./RestockRequest');
const SocialMedia = require('./SocialMedia');
const StoreHighlight = require('./StoreHighlight');
const Vendor = require('./Vendor');
const VendorProduct = require('./VendorProduct');
const VendorRegistration = require('./VendorRegistration');
const Wallet = require('./Wallet');
const WalletBonus = require('./WalletBonus');
const WalletTransaction = require('./WalletTransaction');
const Wishlist = require('./Wishlist');
const Withdraw = require('./Withdraw');
const WithdrawMethod = require('./WithdrawMethod');

module.exports = {
  // Shared models
  Product,
  Category,
  Order,
  User,
  Cart,
  Banner,
  Service,
  ServiceCategory,
  Address,
  Notification,
  PaymentMethod,
  BusinessSettings,
  
  // Admin-specific models
  AdminSettings,
  AdminUser,
  Customer,
  CustomerReview,
  Delivery,
  DeliveryBoy,
  DeliveryEmergencyContact,
  DeliveryWithdraw,
  FAQ,
  FileManager,
  LoyaltyPoint,
  PolicyContent,
  Reason,
  Refund,
  RestockRequest,
  SocialMedia,
  StoreHighlight,
  Vendor,
  VendorProduct,
  VendorRegistration,
  Wallet,
  WalletBonus,
  WalletTransaction,
  Wishlist,
  Withdraw,
  WithdrawMethod
};
