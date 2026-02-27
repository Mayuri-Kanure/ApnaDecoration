const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const sharp = require('sharp');

class PerformanceOptimizer {
  constructor() {
    this.compressionEnabled = process.env.IMAGE_COMPRESSION !== 'false';
    this.compressionQuality = parseInt(process.env.IMAGE_COMPRESSION_QUALITY) || 80;
    this.cacheEnabled = process.env.CACHE_ENABLED !== 'false';
    this.cacheMaxAge = parseInt(process.env.CACHE_MAX_AGE) || 86400; // 24 hours
    this.compressionFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
    this.cacheStats = {
      hits: 0,
      misses: 0,
      total: 0
    };
    this.imageCache = new Map();
  }

  // Image compression middleware
  compressImage = async (req, res, next) => {
    if (!this.compressionEnabled) {
      return next();
    }

    // Only compress image files
    if (!req.url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg|bmp)$/i)) {
      return next();
    }

    const originalSize = parseInt(req.headers['content-length'] || 0);
    
    // Don't compress very small files
    if (originalSize < 1024) {
      return next();
    }

    const originalRes = res; // Store original res object
    const originalWrite = res.write;
    const chunks = [];

    res.write = (chunk) => {
      chunks.push(chunk);
      return originalWrite.call(res, chunk);
    };

    res.on('finish', () => {
      if (chunks.length > 0) {
        const originalBuffer = Buffer.concat(chunks);
        this.compressBuffer(originalBuffer, req, res)
          .then(compressedBuffer => {
          res.setHeader('Content-Length', compressedBuffer.length);
          res.setHeader('Content-Encoding', 'gzip');
          res.end(compressedBuffer);
        })
          .catch(error => {
          console.error('Compression failed:', error);
          // Fallback to original response
          res.setHeader('Content-Length', originalBuffer.length);
          res.end(originalBuffer);
        });
      }
    });
  };

  // Image optimization middleware
  optimizeImage = async (req, res, next) => {
    if (!req.url.match(/\.(jpg|jpeg|png|webp|avif|gif|bmp)$/i)) {
      return next();
    }

    const filePath = this.getFilePath(req);
    
    // Check if optimized version exists
    const optimizedPath = this.getOptimizedPath(filePath);
    
    try {
      if (await this.fileExists(optimizedPath)) {
        // Serve optimized version
        const stats = await fs.promises.stat(optimizedPath);
        const modifiedTime = stats.mtime.getTime();
        
        // Check if optimized version is newer than original
        const originalStats = await fs.promises.stat(filePath);
        const originalModified = originalStats.mtime.getTime();
        
        if (modifiedTime > originalModified) {
          return this.serveOptimizedImage(optimizedPath, req, res);
        }
        
        return this.serveOptimizedImage(optimizedPath, req, res);
      } else {
        // Create optimized version
        return this.createOptimizedImage(filePath, req, res);
      }
    } catch (error) {
      console.error('Image optimization failed:', error);
      return next();
    }
  };

  // Cache middleware
  cache = (req, res, next) => {
    if (!this.cacheEnabled) {
      return next();
    }

    const url = req.url;
    const cacheKey = this.getCacheKey(req);
    
    // Check cache
    const cached = this.imageCache.get(cacheKey);
    if (cached) {
      this.cacheStats.hits++;
      this.cacheStats.total++;
      this.cacheStats.misses = this.cacheStats.total - this.cacheStats.hits;
      
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Hits', this.cacheStats.hits);
      res.setHeader('Cache-Control', `public, max-age=${this.cacheMaxAge}`);
      
      return res.end(cached.data);
    } else {
      this.cacheStats.misses++;
      this.cacheStats.total++;
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Misses', this.cacheStats.misses);
      res.setHeader('Cache-Control', `public, max-age=${this.cacheMaxAge}`);
      
      next();
    }
  };

  // Create optimized image
  createOptimizedImage = async (filePath, req, res) => {
    try {
      const imageBuffer = await fs.promises.readFile(filePath);
      const optimizedBuffer = await this.compressBuffer(imageBuffer, req, res);
      const optimizedPath = this.getOptimizedPath(filePath);
      
      // Save optimized version
      await fs.promises.writeFile(optimizedPath, optimizedBuffer);
      
      return this.serveOptimizedImage(optimizedPath, req, res);
    } catch (error) {
      console.error('Image optimization failed:', error);
      return next();
    }
  };

  // Serve optimized image
  serveOptimizedImage = async (optimizedPath, req, res) => {
    try {
      const optimizedBuffer = await fs.promises.readFile(optimizedPath);
      const stats = await fs.promises.stat(optimizedPath);
      const lastModified = stats.mtime.toISOString();
      
      res.setHeader('Content-Type', this.getContentType(optimizedPath));
      res.setHeader('Content-Length', optimizedBuffer.length);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Last-Modified', lastModified);
      res.setHeader('ETag', stats.size ? `"${stats.size}"` : '"0"');
      res.setHeader('Cache-Control', `public, max-age=${this.cacheMaxAge}`);
      
      res.end(optimizedBuffer);
    } catch (error) {
      console.error('Failed to serve optimized image:', error);
      res.status(500).end('Internal Server Error');
    }
  };

  // Compress buffer
  compressBuffer = async (buffer, req, res) => {
    try {
      const contentType = this.getContentType(req);
      const isImage = this.isImageType(contentType);
      
      if (!isImage) {
        return buffer;
      }

      const quality = this.getCompressionQuality(contentType);
      
      return new Promise((resolve, reject) => {
        sharp(buffer, { quality })
          .toFormat('jpeg', { quality })
          .toBuffer()
          .then(compressedBuffer => resolve(compressedBuffer))
          .catch(reject);
      });
    } catch (error) {
      console.error('Image compression failed:', error);
      return buffer;
    }
  };

  // Get content type
  getContentType = (req) => {
    const ext = path.extname(req.url).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  };

  // Check if file is image type
  isImageType = (contentType) => {
    return contentType.startsWith('image/');
  };

  // Get file path from request
  getFilePath = (req) => {
    return path.join(process.cwd(), 'uploads', req.url);
  };

  // Get optimized file path
  getOptimizedPath = (filePath) => {
    const parsedPath = path.parse(filePath);
    const optimizedDir = path.join(parsedPath.dir, 'optimized');
    const optimizedName = `${parsedPath.name}.webp`;
    return path.join(optimizedDir, optimizedName);
  };

  // Get compression quality based on content type
  getCompressionQuality = (contentType) => {
    const type = contentType.split('/')[1];
    
    const qualityMap = {
      'image/jpeg': this.compressionQuality,
      'image/png': this.compressionQuality,
      'image/webp': this.compressionQuality,
      'image/avif': this.compressionQuality,
      'image/gif': this.compressionQuality,
      'image/bmp': this.compressionQuality
    };
    
    return qualityMap[type] || this.compressionQuality;
  };

  // Check if file exists
  fileExists = async (filePath) => {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Get cache key
  getCacheKey = (req) => {
    return `${req.method}:${req.url}`;
  };

  // Get cache statistics
  getCacheStats = () => {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.total > 0 ? (this.cacheStats.hits / this.cacheStats.total) * 100 : 0
    };
  };

  // Clear cache
  clearCache = () => {
    this.imageCache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      total: 0
    };
  };

  // Preload common images
  preloadImages = async (imagePaths) => {
    for (const imagePath of imagePaths) {
      try {
        const optimizedPath = this.getOptimizedPath(imagePath);
        if (!(await this.fileExists(optimizedPath))) {
          await this.createOptimizedImage(imagePath);
        }
      } catch (error) {
        console.error(`Failed to preload image: ${imagePath}`, error);
      }
    }
  };
}

module.exports = new PerformanceOptimizer();
