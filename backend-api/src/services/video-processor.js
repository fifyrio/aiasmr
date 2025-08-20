const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { uploadToR2 } = require('./storage');
const { createSupabaseClient } = require('../config/database');
const { recordVideoCompletion } = require('./credits-manager');
const logger = require('../utils/logger');

/**
 * Video Processing Service
 * Handles video download, processing, and storage operations
 */

/**
 * Download video from URL to local temporary file
 * @param {string} url - Video URL to download
 * @param {string} fileName - Local filename to save as
 * @returns {Promise<Object>} File path and size information
 */
const downloadVideo = (url, fileName) => {
  return new Promise((resolve, reject) => {
    // Create temp directory if it doesn't exist
    // Use /tmp in production environments or process.cwd()/temp in development
    const tempDir = process.env.NODE_ENV === 'production' 
      ? '/tmp'
      : path.join(process.cwd(), 'temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, fileName);
    const file = fs.createWriteStream(filePath);
    
    // Choose http or https based on URL
    const client = url.startsWith('https') ? https : http;
    
    logger.info('Downloading video', { url, filePath });
    
    const request = client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        logger.info('Following redirect', { from: url, to: redirectUrl });
        file.close();
        fs.unlinkSync(filePath);
        return downloadVideo(redirectUrl, fileName)
          .then(resolve)
          .catch(reject);
      }
      
      // Check if response is successful
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filePath);
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let downloadedBytes = 0;
      const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
      
      response.pipe(file);
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0) {
          const progress = Math.round((downloadedBytes / totalBytes) * 100);
          if (progress % 10 === 0) { // Log every 10%
            logger.debug('Download progress', { 
              fileName, 
              progress: `${progress}%`, 
              downloaded: downloadedBytes, 
              total: totalBytes 
            });
          }
        }
      });
      
      file.on('finish', () => {
        file.close();
        logger.info('Download completed', { 
          fileName, 
          filePath, 
          size: downloadedBytes 
        });
        resolve({
          filePath,
          fileSize: downloadedBytes
        });
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file async
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file async
      reject(err);
    });
    
    // Set timeout for download (5 minutes)
    request.setTimeout(300000, () => {
      request.destroy();
      reject(new Error('Download timeout after 5 minutes'));
    });
  });
};

/**
 * Process video and thumbnail from KIE API: download both files, upload to R2
 * @param {string} kieVideoUrl - KIE video URL
 * @param {string} kieThumbnailUrl - KIE thumbnail URL
 * @param {Object} metadata - Video metadata
 * @returns {Promise<Object>} Processing result with URLs and file info
 */
const processKieVideoAndThumbnail = async (kieVideoUrl, kieThumbnailUrl, metadata) => {
  let localVideoPath = null;
  let localThumbnailPath = null;
  
  try {
    logger.info('Processing KIE video and thumbnail', { 
      taskId: metadata.taskId,
      videoUrl: kieVideoUrl,
      thumbnailUrl: kieThumbnailUrl 
    });
    
    // Generate unique filenames
    const timestamp = Date.now();
    const videoFileName = `kie-video-${metadata.taskId}-${timestamp}.mp4`;
    const thumbnailFileName = `kie-thumbnail-${metadata.taskId}-${timestamp}.jpg`;
    
    // Download both video and thumbnail in parallel
    logger.debug('Starting parallel downloads');
    const [videoDownload, thumbnailDownload] = await Promise.all([
      downloadVideo(kieVideoUrl, videoFileName),
      downloadVideo(kieThumbnailUrl, thumbnailFileName)
    ]);
    
    localVideoPath = videoDownload.filePath;
    localThumbnailPath = thumbnailDownload.filePath;
    
    logger.info('Files downloaded successfully', {
      taskId: metadata.taskId,
      videoPath: localVideoPath,
      videoSize: videoDownload.fileSize,
      thumbnailPath: localThumbnailPath,
      thumbnailSize: thumbnailDownload.fileSize
    });
    
    // Upload both to R2
    logger.debug('Starting R2 uploads');
    const [videoUrl, thumbnailUrl] = await Promise.all([
      uploadToR2(
        localVideoPath, 
        `videos/video-${timestamp}-${metadata.taskId.slice(0, 8)}.mp4`, 
        'video/mp4'
      ),
      uploadToR2(
        localThumbnailPath, 
        `thumbnails/thumb-${timestamp}-${metadata.taskId.slice(0, 8)}.jpg`, 
        'image/jpeg'
      )
    ]);
    
    logger.info('Upload to R2 completed', { 
      taskId: metadata.taskId,
      videoUrl, 
      thumbnailUrl 
    });
    
    return {
      videoUrl,
      thumbnailUrl,
      videoFileSize: videoDownload.fileSize,
      thumbnailFileSize: thumbnailDownload.fileSize,
      localVideoPath,
      localThumbnailPath
    };
    
  } catch (error) {
    logger.error('Error processing video', { 
      taskId: metadata.taskId, 
      error: error.message, 
      stack: error.stack 
    });
    
    // Cleanup on error
    if (localVideoPath && fs.existsSync(localVideoPath)) {
      try {
        fs.unlinkSync(localVideoPath);
        logger.debug('Cleaned up video file on error', { filePath: localVideoPath });
      } catch (cleanupError) {
        logger.warn('Failed to cleanup video file', { 
          filePath: localVideoPath, 
          error: cleanupError.message 
        });
      }
    }
    
    if (localThumbnailPath && fs.existsSync(localThumbnailPath)) {
      try {
        fs.unlinkSync(localThumbnailPath);
        logger.debug('Cleaned up thumbnail file on error', { filePath: localThumbnailPath });
      } catch (cleanupError) {
        logger.warn('Failed to cleanup thumbnail file', { 
          filePath: localThumbnailPath, 
          error: cleanupError.message 
        });
      }
    }
    
    throw error;
  }
};

/**
 * Save processed video to database
 * @param {Object} processingResult - Video processing results
 * @param {Object} metadata - Video metadata
 * @returns {Promise<Object>} Saved video information
 */
const saveVideoToDatabase = async (processingResult, metadata) => {
  try {
    logger.info('Saving video to database', { taskId: metadata.taskId });
    
    const supabase = createSupabaseClient();
    
    // Prepare video data
    const videoData = {
      user_id: metadata.userId || null,
      task_id: metadata.taskId, // Store the KIE task ID for tracking
      title: `ASMR Video ${new Date().toISOString().slice(0, 10)}`,
      description: 'AI-generated ASMR video via KIE API',
      prompt: metadata.originalPrompt || 'Generated via KIE API',
      triggers: metadata.triggers || [],
      category: 'Object', // Default category
      status: 'ready',
      credit_cost: 20, // Runway costs 20 credits
      duration: metadata.duration || '5s',
      resolution: metadata.quality || '720p',
      quality: metadata.quality || '720p',
      aspect_ratio: metadata.aspectRatio || '16:9',
      preview_url: processingResult.videoUrl,
      download_url: processingResult.videoUrl,
      thumbnail_url: processingResult.thumbnailUrl,
      file_size: processingResult.videoFileSize,
      provider: 'kie-runway',
      generation_completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('videos')
      .insert(videoData)
      .select('id')
      .single();
    
    if (error) {
      logger.error('Database error saving video', { 
        taskId: metadata.taskId, 
        error: error.message 
      });
      throw new Error(`Failed to save video to database: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Failed to save video to database: No data returned');
    }
    
    logger.info('Video saved to database successfully', { 
      taskId: metadata.taskId, 
      videoId: data.id 
    });
    
    return { videoId: data.id };
    
  } catch (error) {
    logger.error('Error saving video to database', { 
      taskId: metadata.taskId, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Cleanup temporary files
 * @param {string[]} filePaths - Array of file paths to cleanup
 */
const cleanupTempFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    if (!filePath) return;
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug('Cleaned up temporary file', { filePath });
      }
    } catch (error) {
      logger.warn('Failed to cleanup temporary file', { 
        filePath, 
        error: error.message 
      });
    }
  });
};

/**
 * Update video status in database
 * @param {string} taskId - KIE task ID
 * @param {string} status - New status ('processing', 'ready', 'failed')
 * @param {string} [error] - Error message if status is 'failed'
 * @returns {Promise<boolean>} Success status
 */
const updateVideoStatus = async (taskId, status, error = null) => {
  try {
    const supabase = createSupabaseClient();
    
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (error) {
      updateData.error_message = error;
    }
    
    if (status === 'ready') {
      updateData.generation_completed_at = new Date().toISOString();
    }
    
    const { error: updateError } = await supabase
      .from('videos')
      .update(updateData)
      .eq('task_id', taskId);
    
    if (updateError) {
      logger.error('Error updating video status in database', { 
        taskId, 
        status, 
        error: updateError.message 
      });
      return false;
    }
    
    logger.info('Video status updated in database', { taskId, status });
    return true;
    
  } catch (error) {
    logger.error('Error in updateVideoStatus', { 
      taskId, 
      status, 
      error: error.message 
    });
    return false;
  }
};

/**
 * Get video by task ID
 * @param {string} taskId - KIE task ID
 * @returns {Promise<Object|null>} Video data or null if not found
 */
const getVideoByTaskId = async (taskId) => {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('task_id', taskId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      logger.error('Error getting video by task ID', { 
        taskId, 
        error: error.message 
      });
      return null;
    }
    
    return data;
    
  } catch (error) {
    logger.error('Error in getVideoByTaskId', { 
      taskId, 
      error: error.message 
    });
    return null;
  }
};

/**
 * Create pending video record when generation starts
 * @param {Object} metadata - Video metadata
 * @returns {Promise<Object>} Created video record
 */
const createPendingVideo = async (metadata) => {
  try {
    logger.info('Creating pending video record', { taskId: metadata.taskId });
    
    const supabase = createSupabaseClient();
    
    const videoData = {
      user_id: metadata.userId || null,
      task_id: metadata.taskId,
      title: `ASMR Video ${new Date().toISOString().slice(0, 10)}`,
      description: 'AI-generated ASMR video via KIE API',
      prompt: metadata.originalPrompt || 'Generated via KIE API',
      triggers: metadata.triggers || [],
      category: 'Object',
      status: 'processing', // Start as processing
      credit_cost: 20,
      duration: metadata.duration || '5s',
      resolution: metadata.quality || '720p',
      quality: metadata.quality || '720p',
      aspect_ratio: metadata.aspectRatio || '16:9',
      provider: 'kie-runway',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('videos')
      .insert(videoData)
      .select()
      .single();
    
    if (error) {
      logger.error('Error creating pending video record', { 
        taskId: metadata.taskId, 
        error: error.message 
      });
      throw new Error(`Failed to create pending video record: ${error.message}`);
    }
    
    logger.info('Pending video record created', { 
      taskId: metadata.taskId, 
      videoId: data.id 
    });
    
    return data;
    
  } catch (error) {
    logger.error('Error in createPendingVideo', { 
      taskId: metadata.taskId, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Complete video processing workflow with KIE-provided thumbnail
 * @param {string} kieVideoUrl - KIE video URL
 * @param {string} kieThumbnailUrl - KIE thumbnail URL
 * @param {Object} metadata - Video metadata
 * @returns {Promise<Object>} Complete processing result
 */
const completeVideoProcessing = async (kieVideoUrl, kieThumbnailUrl, metadata) => {
  let processingResult = null;
  
  try {
    logger.info('Starting complete video processing workflow', { 
      taskId: metadata.taskId 
    });
    
    // Process the video and thumbnail (download both, upload to R2)
    processingResult = await processKieVideoAndThumbnail(
      kieVideoUrl, 
      kieThumbnailUrl, 
      metadata
    );
    
    // Save to database
    const { videoId } = await saveVideoToDatabase(processingResult, metadata);
    
    // Record video completion in credit transactions
    if (metadata.userId) {
      const completionResult = await recordVideoCompletion(
        metadata.userId,
        metadata.taskId,
        videoId
      );
      
      if (!completionResult.success) {
        logger.warn('Failed to record video completion', { 
          taskId: metadata.taskId,
          userId: metadata.userId,
          error: completionResult.error 
        });
      }
    }
    
    // Cleanup temp files
    cleanupTempFiles([
      processingResult.localVideoPath, 
      processingResult.localThumbnailPath
    ]);
    
    logger.info('Video processing workflow completed successfully', { 
      taskId: metadata.taskId,
      videoId,
      videoUrl: processingResult.videoUrl,
      thumbnailUrl: processingResult.thumbnailUrl
    });
    
    return {
      videoId,
      videoUrl: processingResult.videoUrl,
      thumbnailUrl: processingResult.thumbnailUrl
    };
    
  } catch (error) {
    logger.error('Error in video processing workflow', { 
      taskId: metadata.taskId, 
      error: error.message, 
      stack: error.stack 
    });
    
    // Update video status to failed
    await updateVideoStatus(metadata.taskId, 'failed', error.message);
    
    // Cleanup temp files on error
    if (processingResult) {
      cleanupTempFiles([
        processingResult.localVideoPath,
        processingResult.localThumbnailPath
      ].filter(Boolean));
    }
    
    throw error;
  }
};

/**
 * Handle video generation failure
 * @param {string} taskId - KIE task ID
 * @param {string} userId - User ID
 * @param {string} errorMessage - Error message
 * @returns {Promise<boolean>} Success status
 */
const handleVideoFailure = async (taskId, userId, errorMessage) => {
  try {
    logger.info('Handling video generation failure', { 
      taskId, 
      userId, 
      error: errorMessage 
    });
    
    // Update video status to failed
    await updateVideoStatus(taskId, 'failed', errorMessage);
    
    // Refund credits if user provided
    if (userId) {
      const { refundCredits } = require('./credits-manager');
      const refundResult = await refundCredits(
        userId, 
        20, // Standard video cost
        'Video generation failed - automatic refund',
        taskId
      );
      
      if (refundResult.success) {
        logger.info('Credits refunded for failed video generation', { 
          taskId, 
          userId, 
          refundedCredits: 20,
          newBalance: refundResult.newCredits 
        });
      } else {
        logger.error('Failed to refund credits for failed video', { 
          taskId, 
          userId, 
          error: refundResult.error 
        });
      }
    }
    
    return true;
    
  } catch (error) {
    logger.error('Error handling video failure', { 
      taskId, 
      userId, 
      error: error.message 
    });
    return false;
  }
};

module.exports = {
  downloadVideo,
  processKieVideoAndThumbnail,
  saveVideoToDatabase,
  cleanupTempFiles,
  updateVideoStatus,
  getVideoByTaskId,
  createPendingVideo,
  completeVideoProcessing,
  handleVideoFailure
};