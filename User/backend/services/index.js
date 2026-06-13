// Shared Services Index
// Central export point for all business logic services

const { AuthService, AUTH_ERROR_CODES, AuthError } = require('./authService');
const ProductService = require('./productService');
const OrderService = require('./orderService');
const CartService = require('./cartService');
const NotificationHelper = require('./notificationHelper');

module.exports = {
  AuthService,
  AUTH_ERROR_CODES,
  AuthError,
  ProductService,
  OrderService,
  CartService,
  NotificationHelper
};
