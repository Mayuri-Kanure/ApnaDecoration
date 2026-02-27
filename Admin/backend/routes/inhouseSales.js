const express = require('express');
const router = express.Router();
const inhouseSalesController = require('../controllers/inhouseSalesController');
const { auth } = require('../middleware/auth');

// Get inhouse sales data
router.get('/', auth, inhouseSalesController.getInhouseSales);

// Get inhouse categories
router.get('/categories', auth, inhouseSalesController.getInhouseCategories);

module.exports = router;
