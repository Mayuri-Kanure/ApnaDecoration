// Shared Services Index
// Central export point for all business logic services

const AuthService = require('./authService');
const ProductService = require('./productService');
const OrderService = require('./orderService');
const CartService = require('./cartService');

module.exports = {
  AuthService,
  ProductService,
  OrderService,
  CartService
};
