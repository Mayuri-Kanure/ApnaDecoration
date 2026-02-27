const express = require('express');
const router = express.Router();
const homePageServiceCategoryController = require('../controllers/homePageServiceCategoryController');

// Get service categories for home page (public endpoint - no auth required)
router.get('/', homePageServiceCategoryController.getHomePageServiceCategories);

module.exports = router;
