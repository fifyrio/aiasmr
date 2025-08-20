const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Input Validation Middleware
 * Validates request data using Joi schemas
 */

// Common validation patterns
const commonSchemas = {
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
  uuid: Joi.string().uuid().required(),
  positiveInteger: Joi.number().integer().positive(),
  nonEmptyString: Joi.string().trim().min(1),
  url: Joi.string().uri()
};

// User registration validation
const registerSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
});

// User login validation
const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: Joi.string().required()
});

// Video generation validation
const videoGenerationSchema = Joi.object({
  prompt: Joi.string().trim().min(10).max(1800).required()
    .messages({
      'string.min': 'Prompt must be at least 10 characters long',
      'string.max': 'Prompt cannot exceed 1800 characters',
      'any.required': 'Prompt is required'
    }),
  triggers: Joi.array().items(
    Joi.string().valid('soap', 'sponge', 'ice', 'water', 'honey', 'cubes', 'petals', 'pages')
  ).max(3).optional(),
  duration: Joi.number().valid(5, 8).default(5),
  quality: Joi.string().valid('720p', '1080p').default('720p'),
  aspectRatio: Joi.string().valid('16:9', '4:3', '1:1', '3:4', '9:16').default('16:9'),
  imageUrl: commonSchemas.url.optional(),
  waterMark: Joi.string().max(100).allow('').optional()
}).custom((value, helpers) => {
  // Custom validation: 8s videos cannot use 1080p quality
  if (value.duration === 8 && value.quality === '1080p') {
    return helpers.error('custom.invalidCombination', {
      message: '8-second videos cannot use 1080p resolution'
    });
  }
  return value;
});

// User profile update validation
const updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().max(50).optional(),
  last_name: Joi.string().trim().max(50).optional(),
  bio: Joi.string().trim().max(500).allow('').optional(),
  avatar_url: commonSchemas.url.optional()
});

// Password change validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: commonSchemas.password
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .message('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Password confirmation does not match new password'
    })
});

// Credits purchase validation
const creditsPurchaseSchema = Joi.object({
  package: Joi.string().valid('basic', 'standard', 'premium', 'enterprise').required(),
  paymentMethod: Joi.string().valid('stripe', 'paypal').required(),
  amount: commonSchemas.positiveInteger.required()
});

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * Create validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {string} [source='body'] - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Validation middleware
 */
const createValidationMiddleware = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types when possible
    });
    
    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      logger.warn('Validation failed', {
        source,
        url: req.url,
        method: req.method,
        errors: validationErrors,
        userId: req.user?.id
      });
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validationErrors
        }
      });
    }
    
    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Validation middleware functions
 */
const validateRegistration = createValidationMiddleware(registerSchema);
const validateLogin = createValidationMiddleware(loginSchema);
const validateVideoGeneration = createValidationMiddleware(videoGenerationSchema);
const validateProfileUpdate = createValidationMiddleware(updateProfileSchema);
const validatePasswordChange = createValidationMiddleware(changePasswordSchema);
const validateCreditsPurchase = createValidationMiddleware(creditsPurchaseSchema);
const validatePagination = createValidationMiddleware(paginationSchema, 'query');
const validateUUID = (paramName) => createValidationMiddleware(
  Joi.object({ [paramName]: commonSchemas.uuid }), 
  'params'
);

/**
 * Sanitize user input to prevent XSS
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove potentially dangerous HTML/script tags
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };
  
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = typeof value === 'string' ? sanitizeString(value) : sanitizeObject(value);
    }
    return sanitized;
  };
  
  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * File upload validation
 * @param {Object} options - Upload options
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @returns {Function} Validation middleware
 */
const validateFileUpload = (options) => {
  const { allowedTypes = [], maxSize = 10 * 1024 * 1024 } = options; // Default 10MB
  
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next(); // No file uploaded, skip validation
    }
    
    const files = req.files || [req.file];
    const errors = [];
    
    files.forEach((file, index) => {
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        errors.push({
          file: index,
          field: 'mimetype',
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
      
      if (file.size > maxSize) {
        errors.push({
          file: index,
          field: 'size',
          message: `File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`
        });
      }
    });
    
    if (errors.length > 0) {
      logger.warn('File upload validation failed', {
        url: req.url,
        method: req.method,
        errors,
        userId: req.user?.id
      });
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_VALIDATION_ERROR',
          message: 'File upload validation failed',
          details: errors
        }
      });
    }
    
    next();
  };
};

module.exports = {
  // Schema exports
  registerSchema,
  loginSchema,
  videoGenerationSchema,
  updateProfileSchema,
  changePasswordSchema,
  creditsPurchaseSchema,
  paginationSchema,
  
  // Middleware exports
  createValidationMiddleware,
  validateRegistration,
  validateLogin,
  validateVideoGeneration,
  validateProfileUpdate,
  validatePasswordChange,
  validateCreditsPurchase,
  validatePagination,
  validateUUID,
  sanitizeInput,
  validateFileUpload
};