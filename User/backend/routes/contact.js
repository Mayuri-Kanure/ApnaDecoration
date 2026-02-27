const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authMiddleware, authorize } = require('../middleware/auth');

// Public route - submit contact form
router.post('/', contactController.submitContact);

// Admin routes
router.get('/', authMiddleware, authorize('admin'), contactController.getAllContacts);
router.put('/:id', authMiddleware, authorize('admin'), contactController.updateContactStatus);
router.delete('/:id', authMiddleware, authorize('admin'), contactController.deleteContact);

module.exports = router;
