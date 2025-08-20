const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { validatePagination, validateUUID } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/error-handler');
const { createSupabaseClient } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/videos
 * @desc    Get user's videos with pagination
 * @access  Private
 */
router.get('/',
  authMiddleware,
  validatePagination,
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    logger.debug('Fetching user videos', { userId, page, limit, offset });

    try {
      const supabase = createSupabaseClient();

      // Get total count
      const { count, error: countError } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        logger.error('Error counting user videos', { userId, error: countError });
        return res.status(500).json({
          success: false,
          error: {
            code: 'COUNT_FAILED',
            message: 'Failed to count videos'
          }
        });
      }

      // Get videos with pagination
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (videosError) {
        logger.error('Error fetching user videos', { userId, error: videosError });
        return res.status(500).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch videos'
          }
        });
      }

      const totalPages = Math.ceil(count / limit);

      logger.info('Successfully fetched user videos', { 
        userId, 
        count, 
        page, 
        totalPages,
        videoCount: videos.length 
      });

      res.json({
        success: true,
        data: {
          videos: videos || [],
          pagination: {
            page,
            limit,
            total: count,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      logger.error('Error in get videos endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'VIDEOS_FETCH_ERROR',
          message: 'Failed to fetch videos'
        }
      });
    }
  })
);

/**
 * @route   GET /api/videos/:id
 * @desc    Get specific video details
 * @access  Private
 */
router.get('/:id',
  authMiddleware,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.debug('Fetching video details', { userId, videoId: id });

    try {
      const supabase = createSupabaseClient();

      const { data: video, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only access their own videos
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return res.status(404).json({
            success: false,
            error: {
              code: 'VIDEO_NOT_FOUND',
              message: 'Video not found'
            }
          });
        }

        logger.error('Error fetching video details', { userId, videoId: id, error });
        return res.status(500).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch video details'
          }
        });
      }

      logger.info('Successfully fetched video details', { userId, videoId: id });

      res.json({
        success: true,
        data: {
          video
        }
      });

    } catch (error) {
      logger.error('Error in get video endpoint', { userId, videoId: id, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'VIDEO_FETCH_ERROR',
          message: 'Failed to fetch video details'
        }
      });
    }
  })
);

/**
 * @route   DELETE /api/videos/:id
 * @desc    Delete a video
 * @access  Private
 */
router.delete('/:id',
  authMiddleware,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    logger.info('Video deletion requested', { userId, videoId: id });

    try {
      const supabase = createSupabaseClient();

      // First, check if video exists and belongs to user
      const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('id, download_url, thumbnail_url')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') { // No rows found
          return res.status(404).json({
            success: false,
            error: {
              code: 'VIDEO_NOT_FOUND',
              message: 'Video not found'
            }
          });
        }

        logger.error('Error checking video for deletion', { userId, videoId: id, error: fetchError });
        return res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_CHECK_FAILED',
            message: 'Failed to verify video for deletion'
          }
        });
      }

      // Delete video record from database
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) {
        logger.error('Error deleting video from database', { userId, videoId: id, error: deleteError });
        return res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete video'
          }
        });
      }

      // TODO: In a production environment, you might also want to:
      // 1. Delete video files from R2 storage
      // 2. Update user statistics
      // 3. Add audit log entry
      
      logger.info('Video deleted successfully', { userId, videoId: id });

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });

    } catch (error) {
      logger.error('Error in delete video endpoint', { userId, videoId: id, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'VIDEO_DELETE_ERROR',
          message: 'Failed to delete video'
        }
      });
    }
  })
);

/**
 * @route   PUT /api/videos/:id/favorite
 * @desc    Toggle video favorite status
 * @access  Private
 */
router.put('/:id/favorite',
  authMiddleware,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { favorite } = req.body;

    logger.debug('Toggling video favorite status', { userId, videoId: id, favorite });

    try {
      const supabase = createSupabaseClient();

      // Update favorite status
      const { data: video, error } = await supabase
        .from('videos')
        .update({ is_favorite: Boolean(favorite) })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return res.status(404).json({
            success: false,
            error: {
              code: 'VIDEO_NOT_FOUND',
              message: 'Video not found'
            }
          });
        }

        logger.error('Error updating video favorite status', { userId, videoId: id, error });
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update video favorite status'
          }
        });
      }

      logger.info('Video favorite status updated', { 
        userId, 
        videoId: id, 
        favorite: video.is_favorite 
      });

      res.json({
        success: true,
        data: {
          video
        },
        message: `Video ${video.is_favorite ? 'added to' : 'removed from'} favorites`
      });

    } catch (error) {
      logger.error('Error in toggle favorite endpoint', { userId, videoId: id, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'FAVORITE_TOGGLE_ERROR',
          message: 'Failed to toggle video favorite status'
        }
      });
    }
  })
);

/**
 * @route   GET /api/videos/stats
 * @desc    Get user's video statistics
 * @access  Private
 */
router.get('/stats',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.debug('Fetching user video statistics', { userId });

    try {
      const supabase = createSupabaseClient();

      // Get video statistics
      const { data: stats, error } = await supabase
        .from('videos')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        logger.error('Error fetching video statistics', { userId, error });
        return res.status(500).json({
          success: false,
          error: {
            code: 'STATS_FETCH_FAILED',
            message: 'Failed to fetch video statistics'
          }
        });
      }

      // Calculate statistics
      const total = stats.length;
      const completed = stats.filter(v => v.status === 'ready').length;
      const processing = stats.filter(v => v.status === 'processing').length;
      const failed = stats.filter(v => v.status === 'failed').length;

      logger.info('Successfully fetched video statistics', { 
        userId, 
        total, 
        completed, 
        processing, 
        failed 
      });

      res.json({
        success: true,
        data: {
          statistics: {
            total,
            completed,
            processing,
            failed,
            successRate: total > 0 ? Math.round((completed / total) * 100) : 0
          }
        }
      });

    } catch (error) {
      logger.error('Error in video statistics endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to fetch video statistics'
        }
      });
    }
  })
);

module.exports = router;