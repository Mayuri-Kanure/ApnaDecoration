//const multer = require('multer');
//const path = require('path');
//const fs = require('fs');
//const crypto = require('crypto');

// Allowed file types and their MIME types
//const ALLOWED_FILE_TYPES = {
//  'image/jpeg': 'jpg',
//  'image/jpg': 'jpg',
//  'image/png': 'png',
//  'image/gif': 'gif',
//  'image/webp': 'webp'
//};

// Maximum file size (10MB)
//const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Create uploads directory if it doesn't exist
//const ensureUploadsDir = (dir) => {
 // if (!fs.existsSync(dir)) {
 //    fs.mkdirSync(dir, { recursive: true });
 //  }
//};

// Generate secure filename
//const generateSecureFilename = (originalname) => {
 // const ext = path.extname(originalname).toLowerCase();
 // const timestamp = Date.now();
 // const randomBytes = crypto.randomBytes(16).toString('hex');
 // return `${timestamp}-${randomBytes}${ext}`;
//};

// Validate file content (not just extension)
//const validateFileContent = (filePath) => {
 // return new Promise((resolve, reject) => {
  // const fileBuffer = fs.readFileSync(filePath);
    
    // Check file signature (magic numbers)
//    const signatures = {
//      'image/jpeg': [0xFF, 0xD8, 0xFF],
//      'image/png': [0x89, 0x50, 0x4E, 0x47],
//      'image/gif': [0x47, 0x49, 0x46],
//      'image/webp': [0x52, 0x49, 0x46, 0x46]
//    };

   // let isValid = false;
   // let detectedType = null;

//for (const [mimeType, signature] of Object.entries(signatures)) {
//      if (fileBuffer.length >= signature.length) {
//        const fileSignature = Array.from(fileBuffer.slice(0, signature.length));
//        if (JSON.stringify(fileSignature) === JSON.stringify(signature)) {
//          isValid = true;
//          detectedType = mimeType;
//          break;
//        }
//      }
//    }

//    if (!isValid) {
      // If signature doesn't match, delete the file
 //     fs.unlinkSync(filePath);
 //     reject(new Error('Invalid file type detected'));
  //  } else {
  //    resolve(detectedType);
  //  }
  //});
//};

// Enhanced storage configuration
//const storage = multer.diskStorage({
 // destination: (req, file, cb) => {
 //   const uploadDir = path.join(__dirname, '../uploads');
 //   ensureUploadsDir(uploadDir);
 //   cb(null, uploadDir);
 // },
 // filename: (req, file, cb) => {
 //   const secureFilename = generateSecureFilename(file.originalname);
 //   cb(null, secureFilename);
 // }
//});

// Enhanced file filter
//const fileFilter = async (req, file, cb) => {
 // try {
    // Check MIME type
 //   if (!ALLOWED_FILE_TYPES[file.mimetype]) {
 //     return cb(new Error(`File type ${file.mimetype} is not allowed`), false);
 //   }

    // Check file extension
  //  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  //  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES);
    
  //  if (!allowedExtensions.includes(ext)) {
  //    return cb(new Error(`File extension .${ext} is not allowed`), false);
  //  }

    // Check file size
  //  if (file.size > MAX_FILE_SIZE) {
  //    return cb(new Error('File size exceeds the maximum limit of 10MB'), false);
  //  }

    // Additional checks for suspicious content in filename
  //  const suspiciousPatterns = [
  //    /\.\./,  // Directory traversal
  //    /[<>:"|?*]/,  // Invalid characters
  //    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Reserved names
  //    /\.(exe|bat|cmd|scr|pif|jar)$/i  // Executable files
  //  ];

//if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
//      return cb(new Error('Filename contains suspicious characters or patterns'), false);
//    }

//    cb(null, true);
//  } catch (error) {
//    cb(error, false);
//  }
//};

// Enhanced multer configuration
//const upload = multer({
//  storage: storage,
//  limits: {
//    fileSize: MAX_FILE_SIZE,
//    files: 5, // Maximum 5 files at once
//    fields: 20, // Maximum 20 fields
//    fieldSize: 2 * 1024 * 1024 // 2MB max field size
//  },
//  fileFilter: fileFilter
//});

// Middleware to validate uploaded files after upload
//const validateUploadedFiles = async (req, res, next) => {
//  try {
//    if (req.files && Object.keys(req.files).length > 0) {
//      const validationPromises = [];

      // Handle single file
//      if (req.file) {
//        validationPromises.push(validateFileContent(req.file.path));
//      }

      // Handle multiple files
//      if (req.files) {
  //      for (const fieldName of Object.keys(req.files)) {
   //       const files = req.files[fieldName];
   //       if (Array.isArray(files)) {
   //         files.forEach(file => {
   //           validationPromises.push(validateFileContent(file.path));
   //         });
   //       } else {
   //        validationPromises.push(validateFileContent(files.path));
   //      }
   //    }
   //  }

   //  await Promise.all(validationPromises);
   // }

   // next();
  //} catch (error) {
    // Clean up uploaded files on validation error
   // if (req.file) {
   //    try { fs.unlinkSync(req.file.path); } catch (e) {}
   // }
   // if (req.files) {
   //   for (const fieldName of Object.keys(req.files)) {
   //     const files = req.files[fieldName];
    //    if (Array.isArray(files)) {
    //      files.forEach(file => {
    //        try { fs.unlinkSync(file.path); } catch (e) {}
    //      });
    //    } else {
    //      try { fs.unlinkSync(files.path); } catch (e) {}
    //    }
    //  }
    //}

    //return res.status(400).json({
    //  message: 'File validation failed',
    //  error: error.message
    //});
  //}
//};

// Middleware to sanitize file paths in responses
//const sanitizeFilePaths = (req, res, next) => {
//  const originalJson = res.json;
  
//  res.json = function(data) {
//    if (data && typeof data === 'object') {
//      sanitizeObjectPaths(data);
//    }
//    return originalJson.call(this, data);
//  };

//  next();
//};

//function sanitizeObjectPaths(obj, visited = new WeakSet()) {
//  for (const key in obj) {
//    if (typeof obj[key] === 'string') {
//      // Remove absolute paths and only keep relative paths
//      obj[key] = obj[key].replace(/.*[\/\\]/, '');
//    } else if (typeof obj[key] === 'object' && obj[key] !== null && !visited.has(obj[key])) {
//      visited.add(obj[key]);
//      sanitizeObjectPaths(obj[key], visited);
//    }
//  }
//}
//
//module.exports = {
//  upload,
//  validateUploadedFiles,
//  sanitizeFilePaths,
//  ALLOWED_FILE_TYPES,
//  MAX_FILE_SIZE
//};
