const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Handles all errors that occur in the application
 */

/**
 * Main error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error caught by error handler', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let errorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error occurred'
    }
  };

  // Mongoose/Database validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message);
    errorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: message
      }
    };
    return res.status(400).json(errorResponse);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue);
    const message = `${field} already exists`;
    errorResponse = {
      success: false,
      error: {
        code: 'DUPLICATE_FIELD',
        message,
        details: { field: field[0] }
      }
    };
    return res.status(400).json(errorResponse);
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    const message = `Invalid ${error.path}: ${error.value}`;
    errorResponse = {
      success: false,
      error: {
        code: 'INVALID_FORMAT',
        message
      }
    };
    return res.status(400).json(errorResponse);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    errorResponse = {
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    };
    return res.status(401).json(errorResponse);
  }

  if (error.name === 'TokenExpiredError') {
    errorResponse = {
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expired'
      }
    };
    return res.status(401).json(errorResponse);
  }

  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    errorResponse = {
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds the maximum allowed limit'
      }
    };
    return res.status(400).json(errorResponse);
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    errorResponse = {
      success: false,
      error: {
        code: 'UNEXPECTED_FILE',
        message: 'Unexpected file field'
      }
    };
    return res.status(400).json(errorResponse);
  }

  // Axios/HTTP errors
  if (error.response) {
    errorResponse = {
      success: false,
      error: {
        code: 'EXTERNAL_API_ERROR',
        message: 'External API error occurred',
        details: {
          status: error.response.status,
          statusText: error.response.statusText
        }
      }
    };
    return res.status(502).json(errorResponse);
  }

  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    errorResponse = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network connection error'
      }
    };
    return res.status(503).json(errorResponse);
  }

  // Custom application errors
  if (error.statusCode) {
    errorResponse = {
      success: false,
      error: {
        code: error.code || 'CUSTOM_ERROR',
        message: error.message
      }
    };
    return res.status(error.statusCode).json(errorResponse);
  }

  // Development vs Production error responses
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
    errorResponse.error.details = error;
  }

  res.status(500).json(errorResponse);
};

/**
 * Handle async errors by wrapping async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create custom error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @returns {Error} Custom error object
 */
const createError = (message, statusCode = 500, code = 'CUSTOM_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

/**
 * Handle 404 errors (route not found)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  
  // Graceful shutdown
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  });
  
  // Close server gracefully
  process.exit(1);
});

module.exports = {
  errorHandler,
  asyncHandler,
  createError,
  notFoundHandler
};