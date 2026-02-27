const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateRegister = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'vendor'])
    .withMessage('Role must be admin or vendor'),
  handleValidationErrors
];

const validateCustomer = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .notEmpty()
    .withMessage('Street address cannot be empty if provided'),
  body('address.city')
    .optional()
    .notEmpty()
    .withMessage('City cannot be empty if provided'),
  body('address.zipCode')
    .optional()
    .matches(/^[0-9]{5}(-[0-9]{4})?$/)
    .withMessage('Please provide a valid ZIP code'),
  handleValidationErrors
];

const validateProduct = [
  body('product_name_en')
    .optional()
    .notEmpty()
    .withMessage('Product name cannot be empty if provided')
    .isLength({ min: 3 })
    .withMessage('Product name must be at least 3 characters long'),
  body('description_en')
    .optional()
    .notEmpty()
    .withMessage('Product description cannot be empty if provided')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('sku')
    .optional()
    .notEmpty()
    .withMessage('SKU cannot be empty if provided')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('SKU can only contain letters, numbers, and hyphens'),
  body('category_id')
    .optional()
    .notEmpty()
    .withMessage('Category ID cannot be empty if provided'),
  body('unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('stock_qty')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  body('tax_percent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax percent must be a positive number'),
  body('shipping_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost must be a positive number'),
  handleValidationErrors
];

const validateOrder = [
  body('customer')
    .notEmpty()
    .withMessage('Customer ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('pricing.subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  body('pricing.total')
    .isFloat({ min: 0 })
    .withMessage('Total must be a positive number'),
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Shipping street address is required'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('Shipping city is required'),
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('Shipping ZIP code is required'),
  handleValidationErrors
];

const validateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2 })
    .withMessage('Category name must be at least 2 characters long')
    .matches(/^[a-zA-Z0-9\s&-]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, ampersands, and hyphens'),
  body('priority')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Priority must be a positive integer'),
  body('homeCategory')
    .optional()
    .isBoolean()
    .withMessage('Home category must be a boolean value'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateCustomer,
  validateProduct,
  validateOrder,
  validateCategory,
  handleValidationErrors
};
