const express = require('express');
const router = express.Router();
const fileManagerController = require('../controllers/fileManagerController');

// GET all folders
router.get('/folders', fileManagerController.getFolders);

// GET files in a specific folder
router.get('/folders/:folder/files', fileManagerController.getFiles);

// UPLOAD files
router.post('/upload', fileManagerController.uploadFiles);

// CREATE new folder
router.post('/folders', fileManagerController.createFolder);

// DELETE file
router.delete('/folders/:folder/files/:filename', fileManagerController.deleteFile);

// DELETE folder
router.delete('/folders/:folder', fileManagerController.deleteFolder);

module.exports = router;
