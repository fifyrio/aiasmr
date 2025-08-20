const logger = require('../utils/logger');
const { refundCredits } = require('./credits-manager');
const { updateVideoStatus } = require('./video-processor');
const { createSupabaseClient } = require('../config/database');

/**
 * Error Recovery Service
 * Handles error recovery, retry logic, and cleanup operations
 */

/**
 * Retry operation with exponential backoff
 * @param {Function} operation - Async operation to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.baseDelay - Base delay in milliseconds
 * @param {number} options.maxDelay - Maximum delay in milliseconds
 * @param {Function} options.shouldRetry - Function to determine if error is retryable
 * @returns {Promise} Operation result
 */
const retryWithBackoff = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true
  } = options;

  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        break;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
      const actualDelay = delay + jitter;
      
      logger.warn('Operation failed, retrying', {
        attempt,
        maxRetries,
        delay: actualDelay,
        error: error.message
      });
      
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
  
  throw lastError;
};

/**
 * Determine if error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is retryable
 */
const isRetryableError = (error) => {
  // Network errors are generally retryable
  if (error.code === 'ECONNREFUSED' || 
      error.code === 'ENOTFOUND' || 
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNRESET') {
    return true;
  }
  
  // HTTP 5xx errors are retryable
  if (error.response && error.response.status >= 500) {
    return true;
  }
  
  // Rate limit errors should be retried with backoff
  if (error.response && error.response.status === 429) {
    return true;
  }
  
  // Database connection errors
  if (error.message && error.message.includes('connection')) {
    return true;
  }
  
  return false;
};

/**
 * Handle video generation failure with comprehensive recovery
 * @param {string} taskId - Task ID
 * @param {string} userId - User ID
 * @param {Error} error - Original error
 * @param {Object} options - Recovery options
 * @returns {Promise<Object>} Recovery result
 */
const handleVideoGenerationFailure = async (taskId, userId, error, options = {}) => {
  const { refundCredits: shouldRefund = true, creditAmount = 20 } = options;
  
  logger.info('Handling video generation failure', {
    taskId,
    userId,
    error: error.message,
    shouldRefund
  });

  const recoveryResult = {
    taskId,
    userId,
    error: error.message,
    actions: [],
    success: false
  };

  try {
    // Update video status to failed
    const statusUpdated = await updateVideoStatus(taskId, 'failed', error.message);
    if (statusUpdated) {
      recoveryResult.actions.push('video_status_updated');
      logger.debug('Video status updated to failed', { taskId });
    }

    // Refund credits if requested
    if (shouldRefund && userId) {
      try {
        const refundResult = await refundCredits(
          userId,
          creditAmount,
          `Automatic refund for failed video generation - ${error.message}`,
          taskId
        );

        if (refundResult.success) {
          recoveryResult.actions.push('credits_refunded');
          recoveryResult.refundedCredits = creditAmount;
          recoveryResult.newCreditBalance = refundResult.newCredits;
          logger.info('Credits refunded successfully', {
            taskId,
            userId,
            refundedCredits: creditAmount,
            newBalance: refundResult.newCredits
          });
        } else {
          recoveryResult.actions.push('credit_refund_failed');
          recoveryResult.refundError = refundResult.error;
          logger.error('Failed to refund credits', {
            taskId,
            userId,
            error: refundResult.error
          });
        }
      } catch (refundError) {
        recoveryResult.actions.push('credit_refund_error');
        recoveryResult.refundError = refundError.message;
        logger.error('Error during credit refund', {
          taskId,
          userId,
          error: refundError.message
        });
      }
    }

    // Log failure for analytics
    await logFailureEvent(taskId, userId, error, recoveryResult.actions);
    recoveryResult.actions.push('failure_logged');

    recoveryResult.success = true;
    logger.info('Video generation failure handled successfully', {
      taskId,
      userId,
      actions: recoveryResult.actions
    });

  } catch (recoveryError) {
    logger.error('Error during failure recovery', {
      taskId,
      userId,
      originalError: error.message,
      recoveryError: recoveryError.message
    });
    
    recoveryResult.recoveryError = recoveryError.message;
  }

  return recoveryResult;
};

/**
 * Log failure event for analytics and monitoring
 * @param {string} taskId - Task ID
 * @param {string} userId - User ID
 * @param {Error} error - Original error
 * @param {string[]} actions - Recovery actions taken
 */
const logFailureEvent = async (taskId, userId, error, actions) => {
  try {
    const supabase = createSupabaseClient();
    
    // Log to a failure events table (if it exists)
    // This is optional and depends on your monitoring setup
    const failureLog = {
      task_id: taskId,
      user_id: userId,
      error_type: error.name || 'Unknown',
      error_message: error.message,
      error_stack: error.stack,
      recovery_actions: actions,
      created_at: new Date().toISOString()
    };

    // You could create a 'failure_events' table for this
    // For now, we'll just log to the application logger
    logger.info('Failure event logged', {
      taskId,
      userId,
      errorType: failureLog.error_type,
      errorMessage: failureLog.error_message,
      recoveryActions: actions
    });

  } catch (logError) {
    logger.error('Failed to log failure event', {
      taskId,
      userId,
      error: logError.message
    });
  }
};

/**
 * Health check for critical services
 * @returns {Promise<Object>} Health status of services
 */
const checkServicesHealth = async () => {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    services: {},
    overall: 'healthy'
  };

  // Check database connection
  try {
    const supabase = createSupabaseClient();
    await supabase.from('user_profiles').select('id').limit(1);
    healthCheck.services.database = 'healthy';
  } catch (error) {
    healthCheck.services.database = 'unhealthy';
    healthCheck.services.databaseError = error.message;
    healthCheck.overall = 'degraded';
  }

  // Check KIE API
  try {
    const { createKieVeo3Client } = require('./kie-client');
    const kieClient = createKieVeo3Client();
    await kieClient.testConnection();
    healthCheck.services.kieApi = 'healthy';
  } catch (error) {
    healthCheck.services.kieApi = 'unhealthy';
    healthCheck.services.kieApiError = error.message;
    healthCheck.overall = 'degraded';
  }

  // Check R2 storage
  try {
    const { testR2Connection } = require('./storage');
    const r2Healthy = await testR2Connection();
    healthCheck.services.r2Storage = r2Healthy ? 'healthy' : 'unhealthy';
    if (!r2Healthy) {
      healthCheck.overall = 'degraded';
    }
  } catch (error) {
    healthCheck.services.r2Storage = 'unhealthy';
    healthCheck.services.r2StorageError = error.message;
    healthCheck.overall = 'degraded';
  }

  return healthCheck;
};

/**
 * Graceful shutdown handler
 * @param {string} signal - Shutdown signal
 */
const gracefulShutdown = (signal) => {
  logger.info('Graceful shutdown initiated', { signal });
  
  // Give ongoing operations time to complete
  setTimeout(() => {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }, 5000);
};

/**
 * Circuit breaker for external services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async call(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

// Create circuit breakers for external services
const kieApiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000
});

const r2StorageCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
});

/**
 * Cleanup orphaned resources
 * @returns {Promise<Object>} Cleanup results
 */
const cleanupOrphanedResources = async () => {
  const cleanupResult = {
    timestamp: new Date().toISOString(),
    actions: [],
    errors: []
  };

  try {
    const supabase = createSupabaseClient();
    
    // Find videos stuck in processing state for more than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: stuckVideos, error } = await supabase
      .from('videos')
      .select('id, task_id, user_id, created_at')
      .eq('status', 'processing')
      .lt('created_at', oneHourAgo);

    if (error) {
      cleanupResult.errors.push(`Failed to query stuck videos: ${error.message}`);
      return cleanupResult;
    }

    if (stuckVideos && stuckVideos.length > 0) {
      logger.info('Found stuck videos for cleanup', { count: stuckVideos.length });
      
      for (const video of stuckVideos) {
        try {
          // Update status to failed
          await updateVideoStatus(
            video.task_id, 
            'failed', 
            'Automatic cleanup - video stuck in processing state'
          );
          
          // Refund credits
          if (video.user_id) {
            await refundCredits(
              video.user_id,
              20,
              'Automatic refund for stuck video generation',
              video.task_id
            );
          }
          
          cleanupResult.actions.push(`Cleaned up stuck video: ${video.id}`);
          
        } catch (cleanupError) {
          cleanupResult.errors.push(`Failed to cleanup video ${video.id}: ${cleanupError.message}`);
        }
      }
    }

    logger.info('Orphaned resource cleanup completed', {
      actions: cleanupResult.actions.length,
      errors: cleanupResult.errors.length
    });

  } catch (error) {
    cleanupResult.errors.push(`Cleanup operation failed: ${error.message}`);
    logger.error('Error during orphaned resource cleanup', { error: error.message });
  }

  return cleanupResult;
};

// Setup process handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = {
  retryWithBackoff,
  isRetryableError,
  handleVideoGenerationFailure,
  logFailureEvent,
  checkServicesHealth,
  gracefulShutdown,
  CircuitBreaker,
  kieApiCircuitBreaker,
  r2StorageCircuitBreaker,
  cleanupOrphanedResources
};