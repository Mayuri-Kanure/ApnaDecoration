const express = require('express');
const {
  getCurrencies,
  addCurrency,
  updateCurrency,
  deleteCurrency,
  setDefaultCurrency
} = require('../controllers/currencyController.js');
const { auth } = require('../middleware/auth.js');

const router = express.Router();

// Get all currencies
router.get('/', getCurrencies);

// Add new currency
router.post('/', addCurrency);

// Update currency
router.put('/:id', updateCurrency);

// Delete currency
router.delete('/:id', deleteCurrency);

// Set default currency
router.put('/:id/default', setDefaultCurrency);

module.exports = router;
