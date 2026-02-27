const express = require('express');
const router = express.Router();
const storeHighlightController = require('../controllers/storeHighlightController');
const { auth } = require('../middleware/auth');

// GET all store highlights
router.get('/', storeHighlightController.getAllStoreHighlights);

// UPDATE store highlight (title and status)
router.put('/:id', storeHighlightController.updateStoreHighlight);

// UPDATE store highlight icon
router.put('/:id/icon', storeHighlightController.uploadIcon, storeHighlightController.updateStoreHighlightIcon);

// DELETE store highlight icon
router.delete('/:id/icon', storeHighlightController.deleteStoreHighlightIcon);

module.exports = router;
