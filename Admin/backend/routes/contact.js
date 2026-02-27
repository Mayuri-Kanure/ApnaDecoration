const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { auth, authorize } = require('../middleware/auth');

// Public route - submit contact form
router.post('/', contactController.submitContact);

// Admin routes
router.get('/', auth, authorize('admin'), contactController.getAllContacts);
router.put('/:id', auth, authorize('admin'), contactController.updateContactStatus);
router.delete('/:id', auth, authorize('admin'), contactController.deleteContact);

module.exports = router;
