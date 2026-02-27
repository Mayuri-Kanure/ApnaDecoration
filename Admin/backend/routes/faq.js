const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { auth } = require('../middleware/auth');

// GET all FAQs with pagination and search
router.get('/', auth, faqController.getAllFAQs);

// GET single FAQ by ID
router.get('/:id', auth, faqController.getFAQById);

// CREATE new FAQ
router.post('/', auth, faqController.createFAQ);

// UPDATE FAQ
router.put('/:id', auth, faqController.updateFAQ);

// DELETE FAQ
router.delete('/:id', auth, faqController.deleteFAQ);

// UPDATE FAQ status
router.patch('/:id/status', auth, faqController.updateFAQStatus);

module.exports = router;
