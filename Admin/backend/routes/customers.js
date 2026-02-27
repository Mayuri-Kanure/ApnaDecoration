const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController-new');
const { auth, authorize } = require('../middleware/auth');
const { validateCustomer } = require('../middleware/validation');

// Get all customers
router.get('/', auth, customerController.getCustomers);

// Get customer statistics
router.get('/stats', auth, authorize('admin', 'manager'), customerController.getCustomerStats);

// Get customer by ID
router.get('/:id', auth, customerController.getCustomer);

// Create new customer
router.post('/', auth, validateCustomer, customerController.createCustomer);

// Update customer
router.put('/:id', auth, customerController.updateCustomer);

// Delete customer
router.delete('/:id', auth, authorize('admin'), customerController.deleteCustomer);

module.exports = router;
