const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests per time window
 */

/**
 * General API rate limit - max requests per IP per minute
 */
const generalLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.GENERAL_RATE_LIMIT || '100'), // max requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.',
      retryAfter: '60 seconds'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('General rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP. Please try again later.',
        retryAfter: '60 seconds'
      }
    });
  }
});

/**
 * Authentication rate limit - max login attempts per IP per hour
 */
const authLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max login attempts per window
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: '1 hour'
    }
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: '1 hour'
      }
    });
  }
});

/**
 * Video generation rate limit - max generations per user per hour
 */
const videoGenerationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.VIDEO_GENERATION_RATE_LIMIT || '5'), // max generations per window
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise fall back to IP
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: {
      code: 'VIDEO_GENERATION_LIMIT_EXCEEDED',
      message: 'You have exceeded the video generation limit. Please try again later.',
      retryAfter: '1 hour'
    }
  },
  skipSuccessfulRequests: false, // Count all requests including successful ones
  handler: (req, res) => {
    logger.warn('Video generation rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'VIDEO_GENERATION_LIMIT_EXCEEDED',
        message: 'You have exceeded the video generation limit. Please try again later.',
        retryAfter: '1 hour',
        details: {
          limit: parseInt(process.env.VIDEO_GENERATION_RATE_LIMIT || '5'),
          windowMs: 60 * 60 * 1000
        }
      }
    });
  }
});

/**
 * Credits purchase rate limit - max purchases per user per day
 */
const creditsPurchaseLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // max purchases per window
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: {
      code: 'CREDITS_PURCHASE_LIMIT_EXCEEDED',
      message: 'You have exceeded the daily credits purchase limit. Please try again tomorrow.',
      retryAfter: '24 hours'
    }
  },
  handler: (req, res) => {
    logger.warn('Credits purchase rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'CREDITS_PURCHASE_LIMIT_EXCEEDED',
        message: 'You have exceeded the daily credits purchase limit. Please try again tomorrow.',
        retryAfter: '24 hours'
      }
    });
  }
});

/**
 * Strict rate limit for sensitive endpoints
 */
const strictLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // max 3 requests per window
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: {
      code: 'STRICT_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests to this sensitive endpoint. Please try again later.',
      retryAfter: '15 minutes'
    }
  },
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'STRICT_RATE_LIMIT_EXCEEDED',
        message: 'Too many requests to this sensitive endpoint. Please try again later.',
        retryAfter: '15 minutes'
      }
    });
  }
});

/**
 * Create custom rate limiter
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} [options.message] - Custom message
 * @param {string} [options.keyGenerator] - Key generator function
 * @returns {Function} Rate limit middleware
 */
const createCustomLimit = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    message: options.message || {
      success: false,
      error: {
        code: 'CUSTOM_RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please try again later.'
      }
    },
    handler: (req, res) => {
      logger.warn('Custom rate limit exceeded', {
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        options
      });
      
      res.status(429).json(options.message || {
        success: false,
        error: {
          code: 'CUSTOM_RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please try again later.'
        }
      });
    }
  });
};

module.exports = {
  generalLimit,
  authLimit,
  videoGenerationLimit,
  creditsPurchaseLimit,
  strictLimit,
  createCustomLimit
};