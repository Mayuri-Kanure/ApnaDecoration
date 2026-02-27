const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// PUBLIC (USER)
router.get('/', productController.getProducts);
router.get('/public', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

module.exports = router;