const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mime = require('mime-types');
const logger = require('../utils/logger');

/**
 * Cloudflare R2 Storage Service
 * Handles file uploads, downloads, and management with R2 storage
 */

/**
 * Initialize R2 client
 */
const createR2Client = () => {
  const requiredEnvVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID', 
    'R2_SECRET_ACCESS_KEY'
  ];

  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required R2 environment variables: ${missing.join(', ')}`);
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
  });
};

// Initialize client
let r2Client;
try {
  r2Client = createR2Client();
  logger.info('R2 client initialized successfully');
} catch (error) {
  logger.error('Failed to initialize R2 client', { error: error.message });
  throw error;
}

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @param {string} [prefix] - Optional prefix
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return `${prefix ? prefix + '-' : ''}${name}-${timestamp}-${random}${ext}`;
};

/**
 * Get file content type
 * @param {string} filePath - File path
 * @returns {string} Content type
 */
const getContentType = (filePath) => {
  const mimeType = mime.lookup(filePath);
  return mimeType || 'application/octet-stream';
};

/**
 * Upload file to R2 storage
 * @param {string} filePath - Local file path
 * @param {string} key - R2 object key (path in bucket)
 * @param {string} [contentType] - Content type (auto-detected if not provided)
 * @param {Object} [metadata] - Additional metadata
 * @returns {Promise<string>} Public URL of uploaded file
 */
const uploadToR2 = async (filePath, key, contentType = null, metadata = {}) => {
  try {
    // Validate inputs
    if (!filePath || !key) {
      throw new Error('File path and key are required');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Auto-detect content type if not provided
    const finalContentType = contentType || getContentType(filePath);
    
    logger.info('Starting R2 upload', { 
      filePath, 
      key, 
      contentType: finalContentType, 
      fileSize 
    });

    // Prepare upload parameters
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: finalContentType,
      ContentLength: fileSize,
      Metadata: {
        'original-name': path.basename(filePath),
        'upload-timestamp': new Date().toISOString(),
        ...metadata
      }
    };

    // Use multipart upload for large files (>5MB)
    if (fileSize > 5 * 1024 * 1024) {
      logger.debug('Using multipart upload for large file', { fileSize });
      
      const upload = new Upload({
        client: r2Client,
        params: uploadParams,
        partSize: 5 * 1024 * 1024, // 5MB parts
        queueSize: 3, // Max 3 concurrent uploads
      });

      upload.on('httpUploadProgress', (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        if (percent % 20 === 0) { // Log every 20%
          logger.debug('Upload progress', { key, percent, loaded: progress.loaded, total: progress.total });
        }
      });

      await upload.done();
    } else {
      // Simple upload for smaller files
      const command = new PutObjectCommand(uploadParams);
      await r2Client.send(command);
    }
    
    // Generate public URL
    const publicUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${key}`
      : `${process.env.R2_ENDPOINT}/${key}`;
    
    logger.info('R2 upload completed successfully', { 
      key, 
      fileSize, 
      publicUrl 
    });
    
    return publicUrl;
    
  } catch (error) {
    logger.error('Error uploading to R2', { 
      filePath, 
      key, 
      error: error.message, 
      stack: error.stack 
    });
    throw error;
  }
};

/**
 * Upload buffer to R2 storage
 * @param {Buffer} buffer - File buffer
 * @param {string} key - R2 object key
 * @param {string} contentType - Content type
 * @param {Object} [metadata] - Additional metadata
 * @returns {Promise<string>} Public URL of uploaded file
 */
const uploadBufferToR2 = async (buffer, key, contentType, metadata = {}) => {
  try {
    if (!buffer || !key || !contentType) {
      throw new Error('Buffer, key, and content type are required');
    }

    logger.info('Starting R2 buffer upload', { 
      key, 
      contentType, 
      bufferSize: buffer.length 
    });

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
      Metadata: {
        'upload-timestamp': new Date().toISOString(),
        ...metadata
      }
    });

    await r2Client.send(command);
    
    const publicUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${key}`
      : `${process.env.R2_ENDPOINT}/${key}`;
    
    logger.info('R2 buffer upload completed successfully', { 
      key, 
      bufferSize: buffer.length, 
      publicUrl 
    });
    
    return publicUrl;
    
  } catch (error) {
    logger.error('Error uploading buffer to R2', { 
      key, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Delete file from R2 storage
 * @param {string} key - R2 object key
 * @returns {Promise<boolean>} Success status
 */
const deleteFromR2 = async (key) => {
  try {
    if (!key) {
      throw new Error('Key is required');
    }

    logger.info('Deleting from R2', { key });

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    });

    await r2Client.send(command);
    
    logger.info('R2 deletion completed successfully', { key });
    return true;
    
  } catch (error) {
    logger.error('Error deleting from R2', { 
      key, 
      error: error.message 
    });
    return false;
  }
};

/**
 * Check if file exists in R2 storage
 * @param {string} key - R2 object key
 * @returns {Promise<boolean>} True if file exists
 */
const fileExistsInR2 = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    });

    await r2Client.send(command);
    return true;
    
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    
    logger.error('Error checking file existence in R2', { 
      key, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Upload video with automatic path generation
 * @param {string} filePath - Local video file path
 * @param {string} taskId - Task ID for organization
 * @param {Object} [metadata] - Additional metadata
 * @returns {Promise<Object>} Upload result with URL and key
 */
const uploadVideo = async (filePath, taskId, metadata = {}) => {
  try {
    const fileName = generateUniqueFilename(path.basename(filePath), 'video');
    const key = `videos/${fileName}`;
    
    const videoUrl = await uploadToR2(filePath, key, 'video/mp4', {
      'task-id': taskId,
      'file-type': 'video',
      ...metadata
    });
    
    return {
      url: videoUrl,
      key,
      fileName
    };
    
  } catch (error) {
    logger.error('Error uploading video', { 
      filePath, 
      taskId, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Upload thumbnail with automatic path generation
 * @param {string} filePath - Local thumbnail file path
 * @param {string} taskId - Task ID for organization
 * @param {Object} [metadata] - Additional metadata
 * @returns {Promise<Object>} Upload result with URL and key
 */
const uploadThumbnail = async (filePath, taskId, metadata = {}) => {
  try {
    const fileName = generateUniqueFilename(path.basename(filePath), 'thumb');
    const key = `thumbnails/${fileName}`;
    
    const contentType = getContentType(filePath);
    
    const thumbnailUrl = await uploadToR2(filePath, key, contentType, {
      'task-id': taskId,
      'file-type': 'thumbnail',
      ...metadata
    });
    
    return {
      url: thumbnailUrl,
      key,
      fileName
    };
    
  } catch (error) {
    logger.error('Error uploading thumbnail', { 
      filePath, 
      taskId, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Upload multiple files concurrently
 * @param {Object[]} uploads - Array of upload objects {filePath, key, contentType, metadata}
 * @returns {Promise<Object[]>} Array of upload results
 */
const uploadMultipleFiles = async (uploads) => {
  try {
    logger.info('Starting multiple file uploads', { count: uploads.length });
    
    const uploadPromises = uploads.map(async (upload, index) => {
      try {
        const url = await uploadToR2(
          upload.filePath, 
          upload.key, 
          upload.contentType, 
          upload.metadata
        );
        
        return {
          index,
          success: true,
          url,
          key: upload.key,
          filePath: upload.filePath
        };
      } catch (error) {
        logger.error('Individual upload failed', { 
          index, 
          filePath: upload.filePath, 
          error: error.message 
        });
        
        return {
          index,
          success: false,
          error: error.message,
          key: upload.key,
          filePath: upload.filePath
        };
      }
    });
    
    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    logger.info('Multiple file uploads completed', { 
      total: uploads.length,
      successful: successful.length,
      failed: failed.length
    });
    
    return results;
    
  } catch (error) {
    logger.error('Error in multiple file uploads', { error: error.message });
    throw error;
  }
};

/**
 * Get storage statistics
 * @returns {Promise<Object>} Storage statistics
 */
const getStorageStats = async () => {
  try {
    // Note: R2 doesn't provide direct bucket statistics through S3 API
    // This would require additional tracking or the R2 Analytics API
    // For now, return a placeholder
    
    return {
      totalFiles: 'N/A - Requires R2 Analytics API',
      totalSize: 'N/A - Requires R2 Analytics API',
      bucketName: process.env.R2_BUCKET_NAME,
      endpoint: process.env.R2_ENDPOINT
    };
    
  } catch (error) {
    logger.error('Error getting storage stats', { error: error.message });
    throw error;
  }
};

/**
 * Test R2 connection
 * @returns {Promise<boolean>} Connection success status
 */
const testR2Connection = async () => {
  try {
    logger.info('Testing R2 connection');
    
    // Create a small test file
    const testKey = `test/connection-test-${Date.now()}.txt`;
    const testBuffer = Buffer.from('R2 connection test', 'utf-8');
    
    // Upload test file
    await uploadBufferToR2(testBuffer, testKey, 'text/plain');
    
    // Check if file exists
    const exists = await fileExistsInR2(testKey);
    
    // Clean up test file
    await deleteFromR2(testKey);
    
    if (exists) {
      logger.info('R2 connection test successful');
      return true;
    } else {
      logger.error('R2 connection test failed - file not found after upload');
      return false;
    }
    
  } catch (error) {
    logger.error('R2 connection test failed', { error: error.message });
    return false;
  }
};

module.exports = {
  uploadToR2,
  uploadBufferToR2,
  deleteFromR2,
  fileExistsInR2,
  uploadVideo,
  uploadThumbnail,
  uploadMultipleFiles,
  getStorageStats,
  testR2Connection,
  generateUniqueFilename,
  getContentType
};