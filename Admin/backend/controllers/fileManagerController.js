const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads', req.body.folder || 'general');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and ZIP files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// GET all folders in public storage
exports.getFolders = async (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '../public/uploads');
    const folders = await fs.readdir(uploadsPath);
    
    const folderData = [];
    for (const folder of folders) {
      const folderPath = path.join(uploadsPath, folder);
      const stats = await fs.stat(folderPath);
      
      if (stats.isDirectory()) {
        const files = await fs.readdir(folderPath);
        folderData.push({
          name: folder,
          count: files.length,
          path: folderPath
        });
      }
    }
    
    res.json(folderData);
  } catch (error) {
    console.error('Error reading folders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET files in a specific folder
exports.getFiles = async (req, res) => {
  try {
    const { folder } = req.params;
    const folderPath = path.join(__dirname, '../public/uploads', folder);
    
    // Check if folder exists
    try {
      await fs.access(folderPath);
    } catch {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    const files = await fs.readdir(folderPath);
    const fileData = files.map(file => ({
      name: file,
      path: `/uploads/${folder}/${file}`,
      size: null, // Would need to get stats for each file
      type: path.extname(file).toLowerCase()
    }));
    
    res.json(fileData);
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPLOAD files
exports.uploadFiles = async (req, res) => {
  try {
    const { folder } = req.body;
    const folderPath = path.join(__dirname, '../public/uploads', folder || 'general');
    
    // Create folder if it doesn't exist
    await fs.mkdir(folderPath, { recursive: true });
    
    upload.array('files')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      // Handle ZIP file extraction if needed
      const uploadedFiles = [];
      for (const file of req.files) {
        if (file.mimetype === 'application/zip') {
          // Extract ZIP file
          const extractPath = path.join(file.destination, file.originalname.replace('.zip', ''));
          await fs.mkdir(extractPath, { recursive: true });
          
          // Here you would implement ZIP extraction logic
          // For now, just keep the ZIP file
          uploadedFiles.push({
            filename: file.filename,
            originalname: file.originalname,
            path: `/uploads/${folder || 'general'}/${file.filename}`
          });
        } else {
          uploadedFiles.push({
            filename: file.filename,
            originalname: file.originalname,
            path: `/uploads/${folder || 'general'}/${file.filename}`
          });
        }
      }
      
      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE new folder
exports.createFolder = async (req, res) => {
  try {
    const { folderName } = req.body;
    const folderPath = path.join(__dirname, '../public/uploads', folderName);
    
    // Check if folder already exists
    try {
      await fs.access(folderPath);
      return res.status(400).json({ message: 'Folder already exists' });
    } catch {
      // Folder doesn't exist, create it
      await fs.mkdir(folderPath, { recursive: true });
      res.json({
        message: 'Folder created successfully',
        folder: {
          name: folderName,
          count: 0,
          path: folderPath
        }
      });
    }
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE file
exports.deleteFile = async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '../public/uploads', folder, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: 'File not found' });
    }
    
    await fs.unlink(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE folder
exports.deleteFolder = async (req, res) => {
  try {
    const { folder } = req.params;
    const folderPath = path.join(__dirname, '../public/uploads', folder);
    
    // Check if folder exists
    try {
      await fs.access(folderPath);
    } catch {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Remove folder and all its contents
    await fs.rmdir(folderPath, { recursive: true });
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export upload middleware for use in routes
exports.upload = upload;
