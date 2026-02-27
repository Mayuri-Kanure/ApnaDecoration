const express = require('express');
const router = express.Router();
const reasonController = require('../controllers/reasonController');

// GET all reasons
router.get('/', reasonController.getReasons);

// GET single reason
router.get('/:id', reasonController.getReason);

// CREATE reason
router.post('/', reasonController.createReason);

// UPDATE reason
router.put('/:id', reasonController.updateReason);

// DELETE reason
router.delete('/:id', reasonController.deleteReason);

// TOGGLE reason status
router.patch('/:id/toggle-status', reasonController.toggleReasonStatus);

module.exports = router;
