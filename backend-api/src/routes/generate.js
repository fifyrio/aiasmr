const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { validateVideoGeneration } = require('../middleware/validation');
const { videoGenerationLimit } = require('../middleware/rate-limit');
const { asyncHandler } = require('../middleware/error-handler');
const { createKieVeo3Client } = require('../services/kie-client');
const { checkUserCredits, deductCredits } = require('../services/credits-manager');
const { createPendingVideo, getVideoByTaskId } = require('../services/video-processor');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/generate
 * @desc    Generate video using KIE API
 * @access  Private
 */
router.post('/',
  authMiddleware,
  videoGenerationLimit,
  validateVideoGeneration,
  asyncHandler(async (req, res) => {
    const { prompt, triggers, duration, quality, aspectRatio, imageUrl } = req.body;
    const userId = req.user.id;

    logger.info('Video generation request received', { 
      userId, 
      duration, 
      quality, 
      promptLength: prompt.length 
    });

    // Check if user has sufficient credits
    const creditCheck = await checkUserCredits(userId, duration, quality);
    
    if (!creditCheck.success) {
      logger.warn('Insufficient credits for video generation', { 
        userId, 
        required: creditCheck.cost, 
        available: creditCheck.availableCredits 
      });
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: creditCheck.error,
          details: {
            required: creditCheck.cost,
            available: creditCheck.availableCredits
          }
        }
      });
    }

    // Enhance prompt with trigger descriptions
    let enhancedPrompt = `ASMR video: ${prompt}`;
    
    if (triggers && triggers.length > 0) {
      const triggerDescriptions = {
        soap: 'soap cutting and squishing sounds',
        sponge: 'sponge squeezing and soft textures',
        ice: 'ice cracking and melting sounds',
        water: 'gentle water flowing and dripping',
        honey: 'viscous honey pouring and dripping',
        cubes: 'satisfying cube cutting and arrangements',
        petals: 'soft flower petals and gentle touches',
        pages: 'paper rustling and page turning sounds'
      };
      
      const triggerEnhancements = triggers
        .map(trigger => triggerDescriptions[trigger])
        .filter(Boolean)
        .join(', ');
      
      if (triggerEnhancements) {
        enhancedPrompt += `, featuring ${triggerEnhancements}`;
      }
    }
    
    enhancedPrompt += '. High quality, smooth camera movement, relaxing atmosphere, 4K resolution, soft lighting, calming ambiance.';

    try {
      // Initialize KIE client
      const kieClient = createKieVeo3Client();
      const callbackUrl = `${process.env.BASE_URL}/api/kie-callback`;
      
      // Create pending video record first
      const pendingVideoMetadata = {
        taskId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporary ID
        userId,
        originalPrompt: enhancedPrompt,
        triggers,
        duration: duration.toString(),
        quality,
        aspectRatio
      };

      // Generate video via KIE API
      const result = await kieClient.generateVideo({
        prompt: enhancedPrompt,
        duration,
        quality,
        aspectRatio,
        imageUrl,
        waterMark: '',
        callBackUrl: callbackUrl
      });

      if (!result || !result.taskId) {
        logger.error('KIE API returned invalid response', { userId, result });
        return res.status(500).json({
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: 'Video generation service returned invalid response'
          }
        });
      }

      // Update metadata with real task ID
      pendingVideoMetadata.taskId = result.taskId;
      
      // Create pending video record in database
      try {
        await createPendingVideo(pendingVideoMetadata);
        logger.info('Pending video record created', { 
          taskId: result.taskId, 
          userId 
        });
      } catch (videoError) {
        logger.warn('Failed to create pending video record', { 
          taskId: result.taskId, 
          userId, 
          error: videoError.message 
        });
        // Continue processing even if pending record creation fails
      }

      // Deduct credits from user account
      const creditResult = await deductCredits(
        userId, 
        creditCheck.cost, 
        'Video generation',
        result.taskId
      );

      if (!creditResult.success) {
        logger.error('Failed to deduct credits after successful KIE API call', { 
          userId, 
          taskId: result.taskId, 
          error: creditResult.error 
        });
        
        // Note: In production, you might want to implement compensation logic here
        // to handle cases where KIE API succeeds but credit deduction fails
        
        return res.status(500).json({
          success: false,
          error: {
            code: 'CREDIT_DEDUCTION_FAILED',
            message: creditResult.error
          }
        });
      }

      logger.info('Video generation started successfully', { 
        userId, 
        taskId: result.taskId, 
        creditsDeducted: creditCheck.cost,
        remainingCredits: creditResult.remainingCredits 
      });

      res.json({
        success: true,
        data: {
          taskId: result.taskId,
          status: result.status || 'pending',
          creditsDeducted: creditCheck.cost,
          remainingCredits: creditResult.remainingCredits,
          estimatedTime: 120, // seconds
          prompt: enhancedPrompt,
          parameters: {
            duration,
            quality,
            aspectRatio,
            triggers
          }
        },
        message: 'Video generation started successfully'
      });

    } catch (error) {
      logger.error('Video generation failed', { 
        userId, 
        error: error.message,
        stack: error.stack 
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error.message || 'Video generation failed'
        }
      });
    }
  })
);

/**
 * @route   GET /api/generate/status/:taskId
 * @desc    Get video generation status with enhanced database integration
 * @access  Private
 */
router.get('/status/:taskId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;

    logger.debug('Video generation status check', { userId, taskId });

    try {
      // First check database for completed videos
      const videoRecord = await getVideoByTaskId(taskId);
      
      if (videoRecord) {
        // Ensure user can only access their own videos
        if (videoRecord.user_id !== userId) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'ACCESS_DENIED',
              message: 'You do not have access to this video'
            }
          });
        }

        // If video is ready, return database info
        if (videoRecord.status === 'ready') {
          logger.debug('Video status from database - completed', { 
            userId, 
            taskId, 
            videoId: videoRecord.id 
          });

          return res.json({
            success: true,
            data: {
              taskId,
              status: 'completed',
              progress: 100,
              result: {
                videoUrl: videoRecord.download_url,
                thumbnailUrl: videoRecord.thumbnail_url,
                duration: videoRecord.duration
              },
              video: {
                id: videoRecord.id,
                title: videoRecord.title,
                createdAt: videoRecord.created_at,
                fileSize: videoRecord.file_size,
                quality: videoRecord.quality,
                aspectRatio: videoRecord.aspect_ratio
              },
              estimatedTimeRemaining: 0
            }
          });
        }

        // If video failed, return failure status
        if (videoRecord.status === 'failed') {
          logger.debug('Video status from database - failed', { 
            userId, 
            taskId, 
            videoId: videoRecord.id 
          });

          return res.json({
            success: true,
            data: {
              taskId,
              status: 'failed',
              progress: 0,
              error: videoRecord.error_message || 'Video generation failed',
              estimatedTimeRemaining: 0
            }
          });
        }
      }

      // For processing videos, check KIE API status
      const kieClient = createKieVeo3Client();
      const kieStatus = await kieClient.getTaskStatus(taskId);

      logger.debug('KIE API status response', { 
        userId, 
        taskId, 
        status: kieStatus.status,
        progress: kieStatus.progress 
      });

      // Map KIE status to our response format
      let responseStatus = kieStatus.status;
      let progress = kieStatus.progress || 0;
      let estimatedTime = 0;

      switch (kieStatus.status) {
        case 'pending':
        case 'queue':
        case 'waiting':
          progress = 10;
          estimatedTime = 120;
          responseStatus = 'pending';
          break;
          
        case 'processing':
        case 'running':
          progress = Math.max(progress, 50);
          estimatedTime = 60;
          responseStatus = 'processing';
          break;
          
        case 'completed':
        case 'success':
          progress = 100;
          estimatedTime = 0;
          responseStatus = 'completed';
          break;
          
        case 'failed':
        case 'error':
          progress = 0;
          estimatedTime = 0;
          responseStatus = 'failed';
          break;
      }

      // Enhanced response with database info if available
      const responseData = {
        taskId,
        status: responseStatus,
        progress,
        result: kieStatus.result,
        error: kieStatus.error,
        estimatedTimeRemaining: estimatedTime
      };

      // Add database info if video record exists
      if (videoRecord) {
        responseData.video = {
          id: videoRecord.id,
          title: videoRecord.title,
          prompt: videoRecord.prompt,
          triggers: videoRecord.triggers,
          createdAt: videoRecord.created_at,
          updatedAt: videoRecord.updated_at
        };
      }

      res.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      logger.error('Failed to get video generation status', { 
        userId, 
        taskId, 
        error: error.message 
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'STATUS_CHECK_FAILED',
          message: error.message || 'Failed to check generation status'
        }
      });
    }
  })
);

/**
 * @route   POST /api/generate/cancel/:taskId
 * @desc    Cancel video generation (if possible)
 * @access  Private
 */
router.post('/cancel/:taskId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;

    logger.info('Video generation cancellation requested', { userId, taskId });

    // Note: KIE API might not support cancellation
    // This endpoint is prepared for future functionality
    
    try {
      // Check current status first
      const kieClient = createKieVeo3Client();
      const status = await kieClient.getTaskStatus(taskId);

      if (status.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_CANCEL_COMPLETED',
            message: 'Cannot cancel completed video generation'
          }
        });
      }

      if (status.status === 'failed') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_FAILED',
            message: 'Video generation has already failed'
          }
        });
      }

      // For now, we'll just return a message indicating cancellation is not supported
      // In the future, this could implement actual cancellation logic
      
      res.json({
        success: false,
        error: {
          code: 'CANCELLATION_NOT_SUPPORTED',
          message: 'Video generation cancellation is not currently supported by the provider'
        }
      });

    } catch (error) {
      logger.error('Failed to cancel video generation', { 
        userId, 
        taskId, 
        error: error.message 
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'CANCELLATION_FAILED',
          message: error.message || 'Failed to cancel video generation'
        }
      });
    }
  })
);

module.exports = router;