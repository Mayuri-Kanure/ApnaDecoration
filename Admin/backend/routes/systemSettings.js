const express = require('express');
const multer = require('multer');
const {
  getSystemSettings,
  updateSystemSettings,
  getVersionControl,
  updateVersionControl,
  uploadSoftware,
  getLanguages,
  updateLanguages,
  getCookieSettings,
  updateCookieSettings,
  getCleanupStats,
  cleanDatabase
} = require('../controllers/systemSettingsController.js');
const { auth } = require('../middleware/auth.js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// System settings routes
router.get('/', getSystemSettings);
router.post('/', updateSystemSettings);

// Version control routes
router.get('/version-control', getVersionControl);
router.post('/version-control', updateVersionControl);

// Software upload route
router.post('/software-upload', upload.single('file'), uploadSoftware);

// Language management routes
router.get('/languages', getLanguages);
router.post('/languages', updateLanguages);

// Cookie settings routes
router.get('/cookies', getCookieSettings);
router.post('/cookies', updateCookieSettings);

// Database cleanup routes
router.get('/cleanup-stats', getCleanupStats);
router.post('/cleanup-database', cleanDatabase);

module.exports = router;
