const express = require('express');
const router = express.Router();
const policyContentController = require('../controllers/policyContentController');
const { auth } = require('../middleware/auth');

// GET all policy content
router.get('/', auth, policyContentController.getAllPolicyContent);

// POST/UPDATE refund policy status
router.post('/refund-status', policyContentController.updateRefundPolicyStatus);

// POST/UPDATE return policy status
router.post('/return-status', policyContentController.updateReturnPolicyStatus);

// POST/UPDATE cancellation policy status
router.post('/cancellation-status', policyContentController.updateCancellationPolicyStatus);

// POST/UPDATE shipping policy status
router.post('/shipping-status', policyContentController.updateShippingPolicyStatus);

// GET specific policy content by page type
router.get('/:pageType', policyContentController.getPolicyContent);

// POST/UPDATE policy content by page type
router.post('/:pageType', auth, policyContentController.updatePolicyContent);

module.exports = router;
