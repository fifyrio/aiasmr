/**
 * Application Constants
 * Central location for all application constants and configuration values
 */

// Video generation costs (in credits)
const GENERATION_COSTS = {
  '5s_720p': 20,
  '5s_1080p': 25,
  '8s_720p': 30,
  // 8s_1080p not supported by KIE API
};

// Supported video qualities
const VIDEO_QUALITIES = ['720p', '1080p'];

// Supported video durations (in seconds)
const VIDEO_DURATIONS = [5, 8];

// Supported aspect ratios
const ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16'];

// Available ASMR triggers
const ASMR_TRIGGERS = [
  'soap', 
  'sponge', 
  'ice', 
  'water', 
  'honey', 
  'cubes', 
  'petals', 
  'pages'
];

// User plan types
const PLAN_TYPES = ['free', 'basic', 'pro', 'enterprise'];

// Transaction types
const TRANSACTION_TYPES = ['purchase', 'usage', 'refund', 'bonus'];

// Video status types
const VIDEO_STATUS = ['processing', 'ready', 'failed'];

// Default user credits for new accounts
const DEFAULT_USER_CREDITS = 20;

// Rate limiting defaults
const RATE_LIMITS = {
  GENERAL: 100,           // requests per minute per IP
  AUTH: 10,               // auth attempts per hour per IP
  VIDEO_GENERATION: 5,    // video generations per hour per user
  CREDITS_PURCHASE: 10,   // purchases per day per user
  STRICT: 3,              // sensitive endpoints per 15 minutes
};

// File upload limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ],
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
};

// JWT configuration
const JWT_CONFIG = {
  DEFAULT_EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
  ALGORITHM: 'HS256'
};

// Database configuration
const DB_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // milliseconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  QUERY_TIMEOUT: 5000, // 5 seconds
};

// External API configuration
const API_CONFIG = {
  KIE: {
    MAX_RETRIES: 3,
    TIMEOUT: 30000, // 30 seconds
    BASE_URL: 'https://api.kie.ai/api/v1'
  },
  R2: {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    TIMEOUT: 60000 // 60 seconds
  }
};

// Error codes
const ERROR_CODES = {
  // Authentication errors
  NO_TOKEN: 'NO_TOKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AUTH_RATE_LIMIT_EXCEEDED: 'AUTH_RATE_LIMIT_EXCEEDED',
  VIDEO_GENERATION_LIMIT_EXCEEDED: 'VIDEO_GENERATION_LIMIT_EXCEEDED',
  
  // Credits and billing
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_PACKAGE: 'INVALID_PACKAGE',
  
  // Video generation
  GENERATION_FAILED: 'GENERATION_FAILED',
  INVALID_COMBINATION: 'INVALID_COMBINATION',
  STATUS_CHECK_FAILED: 'STATUS_CHECK_FAILED',
  
  // File handling
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Generic errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND'
};

// Success messages
const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  VIDEO_GENERATION_STARTED: 'Video generation started successfully',
  VIDEO_DELETED: 'Video deleted successfully',
  CREDITS_PURCHASED: 'Credits purchased successfully'
};

// Validation rules
const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },
  PROMPT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1800
  },
  TRIGGERS: {
    MAX_COUNT: 3
  }
};

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutes
  USER_PROFILE_TTL: 600, // 10 minutes
  CREDIT_BALANCE_TTL: 60, // 1 minute
  VIDEO_STATUS_TTL: 30 // 30 seconds
};

// Logging configuration
const LOG_CONFIG = {
  LEVELS: ['error', 'warn', 'info', 'debug'],
  DEFAULT_LEVEL: 'info',
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  MAX_FILES: 5,
  DATE_PATTERN: 'YYYY-MM-DD-HH'
};

module.exports = {
  GENERATION_COSTS,
  VIDEO_QUALITIES,
  VIDEO_DURATIONS,
  ASPECT_RATIOS,
  ASMR_TRIGGERS,
  PLAN_TYPES,
  TRANSACTION_TYPES,
  VIDEO_STATUS,
  DEFAULT_USER_CREDITS,
  RATE_LIMITS,
  UPLOAD_LIMITS,
  JWT_CONFIG,
  DB_CONFIG,
  API_CONFIG,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  CACHE_CONFIG,
  LOG_CONFIG
};