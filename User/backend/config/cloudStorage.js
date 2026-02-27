// Cloud Storage Configuration
// Choose one of the following options:

// ================================
// OPTION 1: AWS S3 (Recommended)
// ================================
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3Storage = {
  upload: async (file, folder) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location; // Returns public URL
  },

  delete: async (fileUrl) => {
    const key = fileUrl.split('/').pop();
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    }).promise();
  }
};

// ================================
// OPTION 2: Google Cloud Storage
// ================================
const { Storage } = require('@google-cloud/storage');

const gcs = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEY_FILE
});

const gcsStorage = {
  upload: async (file, folder) => {
    const bucket = gcs.bucket(process.env.GCS_BUCKET_NAME);
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      public: true
    });

    return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
  },

  delete: async (fileUrl) => {
    const fileName = fileUrl.split('/').pop();
    await gcs.bucket(process.env.GCS_BUCKET_NAME).file(fileName).delete();
  }
};

// ================================
// OPTION 3: Cloudinary (Easiest)
// ================================
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryStorage = {
  upload: async (file, folder) => {
    const result = await cloudinary.uploader.upload(file.buffer, {
      folder: folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  },

  delete: async (fileUrl) => {
    const publicId = fileUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }
};

// ================================
// EXPORT BASED ON ENVIRONMENT
// ================================
const getStorageProvider = () => {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  
  switch (provider) {
    case 's3':
      return s3Storage;
    case 'gcs':
      return gcsStorage;
    case 'cloudinary':
      return cloudinaryStorage;
    case 'local':
    default:
      return {
        upload: async (file, folder) => {
          // Local storage logic (current setup)
          const path = require('path');
          const fs = require('fs');
          
          const uploadDir = path.join(__dirname, '..', 'uploads', folder);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          const fileName = `${Date.now()}-${file.originalname}`;
          const filePath = path.join(uploadDir, fileName);
          
          fs.writeFileSync(filePath, file.buffer);
          return `/uploads/${folder}/${fileName}`;
        },
        
        delete: async (fileUrl) => {
          const path = require('path');
          const fs = require('fs');
          
          const fileName = fileUrl.split('/').pop();
          const filePath = path.join(__dirname, '..', 'uploads', fileName);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      };
  }
};

module.exports = getStorageProvider();
