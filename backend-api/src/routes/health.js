const express = require('express');
const { asyncHandler } = require('../middleware/error-handler');
const { checkServicesHealth, cleanupOrphanedResources } = require('../services/error-recovery');
const { adminAuthMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check endpoint
 * @access  Public
 */
router.get('/',
  asyncHandler(async (req, res) => {
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };

    res.json(healthStatus);
  })
);

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with service dependencies
 * @access  Public
 */
router.get('/detailed',
  asyncHandler(async (req, res) => {
    logger.info('Detailed health check requested');
    
    try {
      const serviceHealth = await checkServicesHealth();
      
      const detailedHealth = {
        ...serviceHealth,
        application: {
          status: 'healthy',
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          uptime: Math.floor(process.uptime()),
          startTime: new Date(Date.now() - process.uptime() * 1000).toISOString()
        },
        system: {
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024),
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
          },
          cpu: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version
          },
          process: {
            pid: process.pid,
            ppid: process.ppid || 'N/A'
          }
        }
      };

      // Set appropriate HTTP status code
      const httpStatus = serviceHealth.overall === 'healthy' ? 200 : 
                        serviceHealth.overall === 'degraded' ? 207 : 503;

      res.status(httpStatus).json(detailedHealth);

    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      
      res.status(503).json({
        overall: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error.message
      });
    }
  })
);

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe for container orchestration
 * @access  Public
 */
router.get('/ready',
  asyncHandler(async (req, res) => {
    try {
      // Quick readiness check - just verify core services are responsive
      const { createSupabaseClient } = require('../config/database');
      const supabase = createSupabaseClient();
      
      // Simple database connectivity check
      await supabase.from('user_profiles').select('id').limit(1);
      
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Readiness check failed', { error: error.message });
      
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  })
);

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe for container orchestration
 * @access  Public
 */
router.get('/live',
  asyncHandler(async (req, res) => {
    // Basic liveness check - just verify the process is running
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  })
);

/**
 * @route   POST /api/health/cleanup
 * @desc    Trigger cleanup of orphaned resources (admin only)
 * @access  Private (Admin)
 */
router.post('/cleanup',
  adminAuthMiddleware,
  asyncHandler(async (req, res) => {
    logger.info('Manual cleanup requested by admin', { 
      userId: req.user?.id,
      userEmail: req.user?.email 
    });

    try {
      const cleanupResult = await cleanupOrphanedResources();
      
      logger.info('Manual cleanup completed', {
        userId: req.user?.id,
        actions: cleanupResult.actions.length,
        errors: cleanupResult.errors.length
      });

      res.json({
        success: true,
        message: 'Cleanup completed',
        result: cleanupResult
      });

    } catch (error) {
      logger.error('Manual cleanup failed', { 
        userId: req.user?.id,
        error: error.message 
      });

      res.status(500).json({
        success: false,
        error: 'Cleanup operation failed',
        details: error.message
      });
    }
  })
);

/**
 * @route   GET /api/health/metrics
 * @desc    Application metrics for monitoring (admin only)
 * @access  Private (Admin)
 */
router.get('/metrics',
  adminAuthMiddleware,
  asyncHandler(async (req, res) => {
    try {
      const { createSupabaseClient } = require('../config/database');
      const supabase = createSupabaseClient();

      // Gather application metrics
      const metrics = {
        timestamp: new Date().toISOString(),
        application: {
          uptime: Math.floor(process.uptime()),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        },
        system: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          platform: process.platform,
          nodeVersion: process.version
        },
        database: {},
        videos: {},
        users: {}
      };

      // Database metrics
      try {
        // Total users
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });
        metrics.users.total = totalUsers || 0;

        // Active users (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: activeUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .gte('updated_at', yesterday);
        metrics.users.active_24h = activeUsers || 0;

        // Video metrics
        const { count: totalVideos } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true });
        metrics.videos.total = totalVideos || 0;

        const { count: completedVideos } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ready');
        metrics.videos.completed = completedVideos || 0;

        const { count: processingVideos } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'processing');
        metrics.videos.processing = processingVideos || 0;

        const { count: failedVideos } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'failed');
        metrics.videos.failed = failedVideos || 0;

        // Success rate
        if (totalVideos > 0) {
          metrics.videos.success_rate = Math.round((completedVideos / totalVideos) * 100);
        } else {
          metrics.videos.success_rate = 0;
        }

        // Credit metrics
        const { data: creditStats } = await supabase
          .from('credit_transactions')
          .select('transaction_type, amount')
          .gte('created_at', yesterday);

        if (creditStats) {
          const totalSpent = creditStats
            .filter(t => t.transaction_type === 'usage')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          
          const totalPurchased = creditStats
            .filter(t => t.transaction_type === 'purchase')
            .reduce((sum, t) => sum + t.amount, 0);

          metrics.credits = {
            spent_24h: totalSpent,
            purchased_24h: totalPurchased,
            transactions_24h: creditStats.length
          };
        }

      } catch (dbError) {
        metrics.database.error = dbError.message;
        logger.error('Error gathering database metrics', { error: dbError.message });
      }

      res.json({
        success: true,
        metrics
      });

    } catch (error) {
      logger.error('Error gathering metrics', { error: error.message });
      
      res.status(500).json({
        success: false,
        error: 'Failed to gather metrics',
        details: error.message
      });
    }
  })
);

module.exports = router;