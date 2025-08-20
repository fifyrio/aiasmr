const { verifyToken, getUserById } = require('../services/auth-service');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT tokens and adds user information to the request
 */

/**
 * JWT Authentication Middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'NO_TOKEN',
          message: 'Access denied. No token provided.' 
        }
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token.' 
        }
      });
    }

    // Get user from database to ensure user still exists
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'USER_NOT_FOUND',
          message: 'User not found.' 
        }
      });
    }

    // Add user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      credits: user.credits,
      plan_type: user.plan_type
    };

    next();
    
  } catch (error) {
    logger.error('Authentication middleware error', { 
      error: error.message,
      url: req.url,
      method: req.method
    });
    
    res.status(401).json({ 
      success: false, 
      error: { 
        code: 'AUTH_ERROR',
        message: 'Authentication failed.' 
      }
    });
  }
};

/**
 * Optional Authentication Middleware
 * Adds user information if token is provided but doesn't require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (decoded) {
      const user = await getUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          credits: user.credits,
          plan_type: user.plan_type
        };
      }
    }

    next();
    
  } catch (error) {
    logger.warn('Optional authentication middleware error', { 
      error: error.message,
      url: req.url,
      method: req.method
    });
    
    // Don't fail the request, just continue without user
    next();
  }
};

/**
 * Admin Authentication Middleware
 * Requires admin role for access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // First run standard auth middleware
    await authMiddleware(req, res, () => {
      // Check if user has admin role
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ 
          success: false, 
          error: { 
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin access required.' 
          }
        });
      }
    });
    
  } catch (error) {
    logger.error('Admin authentication middleware error', { 
      error: error.message,
      url: req.url,
      method: req.method
    });
    
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'ADMIN_AUTH_ERROR',
        message: 'Admin authentication failed.' 
      }
    });
  }
};

/**
 * Plan-based Access Middleware
 * Requires specific plan type for access
 * @param {string[]} allowedPlans - Array of allowed plan types
 * @returns {Function} Middleware function
 */
const planAccessMiddleware = (allowedPlans) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          error: { 
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required for this endpoint.' 
          }
        });
      }

      if (!allowedPlans.includes(req.user.plan_type)) {
        return res.status(403).json({ 
          success: false, 
          error: { 
            code: 'PLAN_UPGRADE_REQUIRED',
            message: `This feature requires one of the following plans: ${allowedPlans.join(', ')}.`,
            details: {
              currentPlan: req.user.plan_type,
              requiredPlans: allowedPlans
            }
          }
        });
      }

      next();
      
    } catch (error) {
      logger.error('Plan access middleware error', { 
        error: error.message,
        url: req.url,
        method: req.method,
        allowedPlans
      });
      
      res.status(500).json({ 
        success: false, 
        error: { 
          code: 'PLAN_ACCESS_ERROR',
          message: 'Plan access verification failed.' 
        }
      });
    }
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminAuthMiddleware,
  planAccessMiddleware
};