const express = require('express');
const { registerUser, loginUser } = require('../services/auth-service');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authLimit } = require('../middleware/rate-limit');
const { asyncHandler } = require('../middleware/error-handler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', 
  authLimit,
  validateRegistration,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    logger.info('User registration attempt', { email });
    
    const result = await registerUser(email, password);
    
    if (result.success) {
      logger.info('User registered successfully', { 
        userId: result.user.id, 
        email: result.user.email 
      });
      
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'User registered successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: result.error
        }
      });
    }
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  authLimit,
  validateLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    logger.info('User login attempt', { email });
    
    const result = await loginUser(email, password);
    
    if (result.success) {
      logger.info('User logged in successfully', { 
        userId: result.user.id, 
        email: result.user.email 
      });
      
      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: result.error
        }
      });
    }
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh',
  asyncHandler(async (req, res) => {
    // For now, we'll implement a simple token refresh
    // In a more sophisticated setup, you might use refresh tokens
    
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided'
        }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { verifyToken, generateToken, getUserById } = require('../services/auth-service');
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
    
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    const newToken = generateToken(user);
    
    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          plan_type: user.plan_type
        }
      },
      message: 'Token refreshed successfully'
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout',
  asyncHandler(async (req, res) => {
    // Since JWTs are stateless, we can't invalidate them server-side
    // The client should remove the token from storage
    // In a production environment, you might implement token blacklisting
    
    res.json({
      success: true,
      message: 'Logged out successfully. Please remove the token from client storage.'
    });
  })
);

module.exports = router;