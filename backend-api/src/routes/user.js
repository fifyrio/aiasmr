const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { validateProfileUpdate, validatePasswordChange } = require('../middleware/validation');
const { strictLimit } = require('../middleware/rate-limit');
const { asyncHandler } = require('../middleware/error-handler');
const { 
  getUserById, 
  updateUserProfile, 
  changePassword 
} = require('../services/auth-service');
const { getUserCredits } = require('../services/credits-manager');
const { createSupabaseClient } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.debug('Fetching user profile', { userId });

    try {
      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found'
          }
        });
      }

      logger.info('Successfully fetched user profile', { userId, email: user.email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            credits: user.credits,
            plan_type: user.plan_type,
            total_credits_spent: user.total_credits_spent,
            total_videos_created: user.total_videos_created,
            created_at: user.created_at
          }
        }
      });

    } catch (error) {
      logger.error('Error in get profile endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_FETCH_ERROR',
          message: 'Failed to fetch user profile'
        }
      });
    }
  })
);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/profile',
  authMiddleware,
  validateProfileUpdate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    logger.info('Updating user profile', { userId, updates: Object.keys(updates) });

    try {
      const result = await updateUserProfile(userId, updates);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PROFILE_UPDATE_FAILED',
            message: result.error
          }
        });
      }

      logger.info('User profile updated successfully', { userId });

      res.json({
        success: true,
        data: {
          user: result.user
        },
        message: 'Profile updated successfully'
      });

    } catch (error) {
      logger.error('Error in update profile endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_UPDATE_ERROR',
          message: 'Failed to update user profile'
        }
      });
    }
  })
);

/**
 * @route   PUT /api/user/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password',
  authMiddleware,
  strictLimit,
  validatePasswordChange,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    logger.info('Password change requested', { userId });

    try {
      const result = await changePassword(userId, currentPassword, newPassword);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORD_CHANGE_FAILED',
            message: result.error
          }
        });
      }

      logger.info('Password changed successfully', { userId });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Error in change password endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_ERROR',
          message: 'Failed to change password'
        }
      });
    }
  })
);

/**
 * @route   GET /api/user/statistics
 * @desc    Get user statistics and usage data
 * @access  Private
 */
router.get('/statistics',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.debug('Fetching user statistics', { userId });

    try {
      const supabase = createSupabaseClient();

      // Get video statistics
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('status, created_at, credit_cost')
        .eq('user_id', userId);

      if (videosError) {
        logger.error('Error fetching video statistics', { userId, error: videosError });
        return res.status(500).json({
          success: false,
          error: {
            code: 'STATS_FETCH_FAILED',
            message: 'Failed to fetch video statistics'
          }
        });
      }

      // Get credit transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('credit_transactions')
        .select('transaction_type, amount, created_at')
        .eq('user_id', userId);

      if (transactionsError) {
        logger.error('Error fetching transaction statistics', { userId, error: transactionsError });
        return res.status(500).json({
          success: false,
          error: {
            code: 'TRANSACTION_STATS_FAILED',
            message: 'Failed to fetch transaction statistics'
          }
        });
      }

      // Calculate video statistics
      const videoStats = {
        total: videos.length,
        completed: videos.filter(v => v.status === 'ready').length,
        processing: videos.filter(v => v.status === 'processing').length,
        failed: videos.filter(v => v.status === 'failed').length,
        successRate: videos.length > 0 ? 
          Math.round((videos.filter(v => v.status === 'ready').length / videos.length) * 100) : 0
      };

      // Calculate credit statistics
      const creditStats = {
        totalSpent: transactions
          .filter(t => t.transaction_type === 'usage')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        totalPurchased: transactions
          .filter(t => t.transaction_type === 'purchase')
          .reduce((sum, t) => sum + t.amount, 0),
        totalRefunded: transactions
          .filter(t => t.transaction_type === 'refund')
          .reduce((sum, t) => sum + t.amount, 0)
      };

      // Get current user info
      const user = await getUserById(userId);
      const creditBalance = await getUserCredits(userId);

      // Calculate usage over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentVideos = videos.filter(v => 
        new Date(v.created_at) >= thirtyDaysAgo
      );

      const recentTransactions = transactions.filter(t => 
        new Date(t.created_at) >= thirtyDaysAgo && t.transaction_type === 'usage'
      );

      const usageStats = {
        videosLast30Days: recentVideos.length,
        creditsSpentLast30Days: recentTransactions
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        averageCreditsPerVideo: videoStats.total > 0 ? 
          Math.round(creditStats.totalSpent / videoStats.total) : 0,
        memberSince: user?.created_at
      };

      logger.info('Successfully fetched user statistics', { 
        userId, 
        totalVideos: videoStats.total,
        totalCreditsSpent: creditStats.totalSpent,
        currentBalance: creditBalance.credits
      });

      res.json({
        success: true,
        data: {
          statistics: {
            videos: videoStats,
            credits: {
              ...creditStats,
              currentBalance: creditBalance.credits
            },
            usage: usageStats,
            account: {
              plan_type: user?.plan_type,
              member_since: user?.created_at
            }
          }
        }
      });

    } catch (error) {
      logger.error('Error in user statistics endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: 'Failed to fetch user statistics'
        }
      });
    }
  })
);

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/account',
  authMiddleware,
  strictLimit,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { confirmDeletion } = req.body;

    if (!confirmDeletion) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONFIRMATION_REQUIRED',
          message: 'Account deletion confirmation required'
        }
      });
    }

    logger.warn('Account deletion requested', { userId });

    try {
      const supabase = createSupabaseClient();

      // In a production environment, you might want to:
      // 1. Soft delete by setting a deleted_at timestamp
      // 2. Anonymize user data
      // 3. Keep transaction records for compliance
      // 4. Delete associated files from storage
      
      // For now, we'll implement a basic soft delete
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          deleted_at: new Date().toISOString(),
          email: `deleted_${userId}@deleted.local` // Anonymize email
        })
        .eq('id', userId);

      if (updateError) {
        logger.error('Error soft-deleting user account', { userId, error: updateError });
        return res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete account'
          }
        });
      }

      logger.warn('User account soft-deleted', { userId });

      res.json({
        success: true,
        message: 'Account deleted successfully. We\'re sorry to see you go!'
      });

    } catch (error) {
      logger.error('Error in delete account endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'ACCOUNT_DELETE_ERROR',
          message: 'Failed to delete account'
        }
      });
    }
  })
);

/**
 * @route   GET /api/user/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.debug('Fetching user preferences', { userId });

    try {
      // Default preferences - in production, these might be stored in database
      const defaultPreferences = {
        notifications: {
          email: true,
          push: true,
          videoCompletion: true,
          creditLow: true,
          marketing: false
        },
        video: {
          defaultQuality: '720p',
          defaultAspectRatio: '16:9',
          defaultDuration: 5,
          autoDownload: false
        },
        privacy: {
          profilePublic: false,
          showInLeaderboard: false
        }
      };

      res.json({
        success: true,
        data: {
          preferences: defaultPreferences
        }
      });

    } catch (error) {
      logger.error('Error in get preferences endpoint', { userId, error: error.message });
      res.status(500).json({
        success: false,
        error: {
          code: 'PREFERENCES_ERROR',
          message: 'Failed to fetch user preferences'
        }
      });
    }
  })
);

module.exports = router;