const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');
const { auth } = require('../middleware/auth');

// GET all social media links
router.get('/', socialMediaController.getAllSocialMedia);

// GET social media by ID
router.get('/:id', socialMediaController.getSocialMediaById);

// CREATE new social media link
router.post('/', socialMediaController.createSocialMedia);

// UPDATE social media link
router.put('/:id', socialMediaController.updateSocialMedia);

// DELETE social media link
router.delete('/:id', socialMediaController.deleteSocialMedia);

// UPDATE social media status
router.patch('/:id/status', socialMediaController.updateSocialMediaStatus);

// UPDATE social media order
router.put('/order/update', socialMediaController.updateSocialMediaOrder);

module.exports = router;
