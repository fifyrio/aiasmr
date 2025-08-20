const express = require('express');
const { asyncHandler } = require('../middleware/error-handler');
const { 
  completeVideoProcessing, 
  handleVideoFailure,
  getVideoByTaskId
} = require('../services/video-processor');
const { refundCredits } = require('../services/credits-manager');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/kie-callback
 * @desc    Handle KIE API callback for video generation completion
 * @access  Public (called by KIE API)
 */
router.post('/',
  asyncHandler(async (req, res) => {
    const { taskId, status, result, error } = req.body;
    
    logger.info('KIE callback received', { 
      taskId, 
      status, 
      hasResult: !!result,
      hasError: !!error 
    });

    // Validate required fields
    if (!taskId || !status) {
      logger.warn('Invalid KIE callback - missing required fields', { 
        taskId, 
        status, 
        body: req.body 
      });
      
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: taskId, status'
      });
    }

    try {
      // Get video record from database
      const videoRecord = await getVideoByTaskId(taskId);
      
      if (!videoRecord) {
        logger.warn('KIE callback for unknown task', { taskId });
        return res.status(404).json({
          success: false,
          error: 'Video record not found for task ID'
        });
      }

      const userId = videoRecord.user_id;
      
      logger.info('Processing KIE callback', { 
        taskId, 
        status, 
        userId, 
        videoId: videoRecord.id 
      });

      // Handle different status types
      switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
        case 'finished':
          await handleSuccessfulGeneration(taskId, userId, result);
          break;
          
        case 'failed':
        case 'error':
        case 'cancelled':
          await handleFailedGeneration(taskId, userId, error || 'Generation failed');
          break;
          
        case 'processing':
        case 'running':
        case 'pending':
          await handleProcessingStatus(taskId, status);
          break;
          
        default:
          logger.warn('Unknown KIE callback status', { taskId, status });
          await handleUnknownStatus(taskId, status);
          break;
      }

      // Always respond with success to acknowledge receipt
      res.json({
        success: true,
        message: 'Callback processed successfully',
        taskId
      });

    } catch (error) {
      logger.error('Error processing KIE callback', { 
        taskId, 
        error: error.message, 
        stack: error.stack 
      });

      // Still respond with success to prevent retries
      res.json({
        success: true,
        message: 'Callback received but processing failed',
        taskId,
        error: error.message
      });
    }
  })
);

/**
 * Handle successful video generation
 * @param {string} taskId - KIE task ID
 * @param {string} userId - User ID
 * @param {Object} result - KIE result object
 */
const handleSuccessfulGeneration = async (taskId, userId, result) => {
  try {
    logger.info('Handling successful video generation', { taskId, userId });

    // Validate result data
    if (!result || !result.videoUrl) {
      throw new Error('Missing video URL in result');
    }

    // Prepare metadata for video processing
    const metadata = {
      taskId,
      userId,
      originalPrompt: result.prompt || 'AI-generated ASMR video',
      duration: result.duration || '5s',
      quality: result.quality || '720p',
      aspectRatio: result.aspectRatio || '16:9'
    };

    // Use provided thumbnail URL or video URL as fallback
    const thumbnailUrl = result.thumbnailUrl || result.imageUrl || result.videoUrl;

    // Process the complete video workflow
    const processingResult = await completeVideoProcessing(
      result.videoUrl,
      thumbnailUrl,
      metadata
    );

    logger.info('Video generation completed successfully', { 
      taskId, 
      userId, 
      videoId: processingResult.videoId,
      videoUrl: processingResult.videoUrl 
    });

  } catch (error) {
    logger.error('Error handling successful generation', { 
      taskId, 
      userId, 
      error: error.message 
    });
    
    // Fallback to failure handling
    await handleFailedGeneration(taskId, userId, `Processing failed: ${error.message}`);
  }
};

/**
 * Handle failed video generation
 * @param {string} taskId - KIE task ID  
 * @param {string} userId - User ID
 * @param {string} errorMessage - Error message
 */
const handleFailedGeneration = async (taskId, userId, errorMessage) => {
  try {
    logger.info('Handling failed video generation', { 
      taskId, 
      userId, 
      error: errorMessage 
    });

    // Use video processor's failure handler
    const success = await handleVideoFailure(taskId, userId, errorMessage);

    if (success) {
      logger.info('Video failure handled successfully', { taskId, userId });
    } else {
      logger.error('Failed to handle video failure', { taskId, userId });
    }

  } catch (error) {
    logger.error('Error handling video generation failure', { 
      taskId, 
      userId, 
      error: error.message 
    });
  }
};

/**
 * Handle processing status updates
 * @param {string} taskId - KIE task ID
 * @param {string} status - Current status
 */
const handleProcessingStatus = async (taskId, status) => {
  try {
    logger.info('Updating video processing status', { taskId, status });

    const { updateVideoStatus } = require('../services/video-processor');
    await updateVideoStatus(taskId, 'processing');

    logger.debug('Video status updated', { taskId, status: 'processing' });

  } catch (error) {
    logger.error('Error updating processing status', { 
      taskId, 
      error: error.message 
    });
  }
};

/**
 * Handle unknown status
 * @param {string} taskId - KIE task ID
 * @param {string} status - Unknown status
 */
const handleUnknownStatus = async (taskId, status) => {
  try {
    logger.warn('Received unknown status from KIE', { taskId, status });
    
    // For unknown statuses, we'll assume it's still processing
    const { updateVideoStatus } = require('../services/video-processor');
    await updateVideoStatus(taskId, 'processing');

  } catch (error) {
    logger.error('Error handling unknown status', { 
      taskId, 
      status, 
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/kie-callback/health
 * @desc    Health check endpoint for KIE callback service
 * @access  Public
 */
router.get('/health',
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'KIE callback service is healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  })
);

/**
 * @route   POST /api/kie-callback/test
 * @desc    Test endpoint for KIE callback functionality (development only)
 * @access  Public
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test',
    asyncHandler(async (req, res) => {
      const { taskId, status = 'completed', mockResult } = req.body;
      
      if (!taskId) {
        return res.status(400).json({
          success: false,
          error: 'taskId is required for testing'
        });
      }

      logger.info('Processing test KIE callback', { taskId, status });

      // Mock result for testing
      const testResult = mockResult || {
        videoUrl: 'https://example.com/test-video.mp4',
        thumbnailUrl: 'https://example.com/test-thumbnail.jpg',
        duration: '5s',
        quality: '720p',
        aspectRatio: '16:9'
      };

      // Process the test callback
      const callbackBody = {
        taskId,
        status,
        result: status === 'completed' ? testResult : null,
        error: status === 'failed' ? 'Test failure' : null
      };

      // Simulate the callback processing
      req.body = callbackBody;
      const callbackResult = await router.handle(req, res);

      res.json({
        success: true,
        message: 'Test callback processed',
        taskId,
        status,
        testResult
      });
    })
  );
}

module.exports = router;