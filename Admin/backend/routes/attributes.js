const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');

// GET all attributes
router.get('/', attributeController.getAttributes);

// GET active attributes only
router.get('/active', attributeController.getActiveAttributes);

// GET attributes by category
router.get('/category/:category', attributeController.getAttributesByCategory);

// GET attribute by ID
router.get('/:id', attributeController.getAttributeById);

// POST create new attribute
router.post('/', attributeController.createAttribute);

// PUT update attribute
router.put('/:id', attributeController.updateAttribute);

// DELETE attribute
router.delete('/:id', attributeController.deleteAttribute);

module.exports = router;
