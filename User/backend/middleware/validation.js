const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).required().messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'any.required': 'Phone number is required'
  })
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Order creation validation
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).max(10).required()
    })
  ).min(1).required().messages({
    'array.min': 'At least one item is required'
  }),
  eventInfo: Joi.object({
    eventType: Joi.string().valid('birthday', 'anniversary', 'proposal', 'wedding', 'baby-shower', 'corporate', 'festival', 'other').required(),
    eventDate: Joi.date().iso().min('now').required().messages({
      'date.min': 'Event date must be in the future'
    }),
    eventTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Please provide a valid time in HH:MM format'
    }),
    venueType: Joi.string().valid('home', 'banquet', 'outdoor', 'office').required(),
    venueAddress: Joi.string().trim().min(10).max(500).required(),
    guestCount: Joi.number().integer().min(1).max(1000).required(),
    setupRequired: Joi.boolean().default(false),
    setupTimeSlot: Joi.string().valid('6am-8am', '8am-10am', '10am-12pm', '2pm-4pm', '4pm-6pm', '6pm-8pm').optional(),
    specialInstructions: Joi.string().trim().max(1000).optional().allow('')
  }).required(),
  shippingInfo: Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).required(),
    address: Joi.string().trim().min(10).max(500).required(),
    city: Joi.string().trim().min(2).max(50).required(),
    state: Joi.string().trim().min(2).max(50).required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'Please provide a valid 6-digit pincode'
    }),
    country: Joi.string().trim().max(50).default('India')
  }).required(),
  paymentMethod: Joi.string().valid('card', 'cod', 'upi').required(),
  addressId: Joi.number().integer().positive().optional()
});

// Support ticket creation validation
const createTicketSchema = Joi.object({
  subject: Joi.string().trim().min(5).max(200).required().messages({
    'string.min': 'Subject must be at least 5 characters',
    'string.max': 'Subject must not exceed 200 characters'
  }),
  category: Joi.string().valid('order', 'billing', 'technical', 'general', 'cancellation', 'refund').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  orderId: Joi.string().optional().allow(''),
  description: Joi.string().trim().min(10).max(2000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description must not exceed 2000 characters'
  })
});

// Address creation validation
const createAddressSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).required(),
  addressLine1: Joi.string().trim().min(10).max(200).required(),
  addressLine2: Joi.string().trim().max(200).optional().allow(''),
  landmark: Joi.string().trim().max(100).optional().allow(''),
  city: Joi.string().trim().min(2).max(50).required(),
  state: Joi.string().trim().min(2).max(50).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 6-digit pincode'
  }),
  country: Joi.string().trim().max(50).default('India'),
  addressType: Joi.string().valid('home', 'work', 'other').required(),
  isDefault: Joi.boolean().default(false),
  tag: Joi.string().trim().max(50).optional().allow(''),
  instructions: Joi.string().trim().max(500).optional().allow('')
});

// Address update validation
const updateAddressSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
  addressLine1: Joi.string().trim().min(10).max(200).optional(),
  addressLine2: Joi.string().trim().max(200).optional().allow(''),
  landmark: Joi.string().trim().max(100).optional().allow(''),
  city: Joi.string().trim().min(2).max(50).optional(),
  state: Joi.string().trim().min(2).max(50).optional(),
  pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  country: Joi.string().trim().max(50).optional(),
  addressType: Joi.string().valid('home', 'work', 'other').optional(),
  isDefault: Joi.boolean().optional(),
  tag: Joi.string().trim().max(50).optional().allow(''),
  instructions: Joi.string().trim().max(500).optional().allow('')
}).min(1);

// Profile update validation
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
  dateOfBirth: Joi.date().iso().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional()
}).min(1);

// Change password validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required'
  })
});

// Ticket reply validation
const replyTicketSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Message cannot be empty',
    'string.max': 'Message must not exceed 2000 characters'
  }),
  attachments: Joi.array().items(Joi.string().uri()).optional().default([])
});

// Product search validation
const searchProductsSchema = Joi.object({
  q: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Search query must be at least 2 characters',
    'any.required': 'Search query is required'
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  category: Joi.string().valid('birthday', 'anniversary', 'proposal', 'wedding', 'baby-shower', 'corporate', 'festival', 'general').optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  sortBy: Joi.string().valid('price', 'rating', 'createdAt', 'soldCount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC'),
  featured: Joi.boolean().optional(),
  trending: Joi.boolean().optional()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

// Query validation middleware factory
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  registerSchema,
  loginSchema,
  createOrderSchema,
  createTicketSchema,
  createAddressSchema,
  updateAddressSchema,
  updateProfileSchema,
  changePasswordSchema,
  replyTicketSchema,
  searchProductsSchema
};
