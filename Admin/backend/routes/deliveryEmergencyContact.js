const express = require('express');
const router = express.Router();
const deliveryEmergencyContactController = require('../controllers/deliveryEmergencyContactController');
const { auth, authorize } = require('../middleware/auth');

// Get all emergency contacts
router.get('/', auth, deliveryEmergencyContactController.getEmergencyContacts);

// Get emergency contacts by delivery ID
router.get('/delivery/:deliveryId', auth, deliveryEmergencyContactController.getContactsByDeliveryId);

// Get emergency contact by ID
router.get('/:id', auth, deliveryEmergencyContactController.getEmergencyContactById);

// Create emergency contact
router.post('/', auth, authorize('admin', 'manager'), deliveryEmergencyContactController.createEmergencyContact);

// Update emergency contact
router.put('/:id', auth, authorize('admin', 'manager'), deliveryEmergencyContactController.updateEmergencyContact);

// Delete emergency contact
router.delete('/:id', auth, authorize('admin', 'manager'), deliveryEmergencyContactController.deleteEmergencyContact);

// Set primary contact
router.patch('/:id/set-primary', auth, authorize('admin', 'manager'), deliveryEmergencyContactController.setPrimaryContact);

module.exports = router;
