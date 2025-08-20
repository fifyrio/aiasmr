/**
 * Environment Configuration
 * Centralizes environment variable management and validation
 */

const logger = require('../utils/logger');

/**
 * Validate required environment variables
 */
const validateEnvironment = () => {
  const required = [
    'JWT_SECRET',
    'KIE_API_KEY',
    'KIE_BASE_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_ENDPOINT'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error('Environment validation failed', { missing });
    throw new Error(error);
  }

  logger.info('Environment validation passed');
};

/**
 * Get environment configuration with defaults
 */
const getConfig = () => {
  const config = {
    // Application
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000'),
    
    // Security
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    // Database
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    
    // KIE API
    KIE_API_KEY: process.env.KIE_API_KEY,
    KIE_BASE_URL: process.env.KIE_BASE_URL || 'https://api.kie.ai/api/v1',
    KIE_MAX_RETRIES: parseInt(process.env.KIE_MAX_RETRIES || '3'),
    KIE_TIMEOUT: parseInt(process.env.KIE_TIMEOUT || '30000'),
    
    // Cloudflare R2
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    
    // Application URLs
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    CALLBACK_URL: process.env.CALLBACK_URL || 'http://localhost:3000/api/kie-callback',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000', 
      'http://localhost:19006'
    ],
    
    // Rate Limiting
    GENERAL_RATE_LIMIT: parseInt(process.env.GENERAL_RATE_LIMIT || '100'),
    VIDEO_GENERATION_RATE_LIMIT: parseInt(process.env.VIDEO_GENERATION_RATE_LIMIT || '5'),
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Feature Flags
    ENABLE_REGISTRATION: process.env.ENABLE_REGISTRATION !== 'false',
    ENABLE_VIDEO_GENERATION: process.env.ENABLE_VIDEO_GENERATION !== 'false',
    ENABLE_CREDIT_PURCHASE: process.env.ENABLE_CREDIT_PURCHASE !== 'false',
    
    // Development
    DEBUG_MODE: process.env.DEBUG_MODE === 'true',
    MOCK_PAYMENTS: process.env.MOCK_PAYMENTS === 'true'
  };

  return config;
};

/**
 * Check if application is running in development mode
 */
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if application is running in production mode
 */
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if application is running in test mode
 */
const isTest = () => {
  return process.env.NODE_ENV === 'test';
};

/**
 * Get database URL based on environment
 */
const getDatabaseUrl = () => {
  if (isTest()) {
    return process.env.TEST_DATABASE_URL || process.env.SUPABASE_URL;
  }
  return process.env.SUPABASE_URL;
};

/**
 * Get log level based on environment
 */
const getLogLevel = () => {
  if (isTest()) {
    return 'error';
  }
  if (isDevelopment()) {
    return process.env.LOG_LEVEL || 'debug';
  }
  return process.env.LOG_LEVEL || 'info';
};

/**
 * Get CORS origin configuration
 */
const getCorsOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  if (isDevelopment()) {
    origins.push('http://localhost:3000', 'http://localhost:19006');
  }
  
  return [...new Set(origins)]; // Remove duplicates
};

/**
 * Validate specific service configurations
 */
const validateServices = () => {
  const errors = [];

  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET should be at least 32 characters long');
  }

  // Validate URLs
  const urlFields = ['KIE_BASE_URL', 'SUPABASE_URL', 'R2_ENDPOINT', 'BASE_URL'];
  urlFields.forEach(field => {
    if (process.env[field]) {
      try {
        new URL(process.env[field]);
      } catch (e) {
        errors.push(`${field} is not a valid URL`);
      }
    }
  });

  // Validate numeric fields
  const numericFields = [
    'PORT', 'KIE_MAX_RETRIES', 'KIE_TIMEOUT', 
    'GENERAL_RATE_LIMIT', 'VIDEO_GENERATION_RATE_LIMIT'
  ];
  numericFields.forEach(field => {
    if (process.env[field] && isNaN(parseInt(process.env[field]))) {
      errors.push(`${field} must be a valid number`);
    }
  });

  if (errors.length > 0) {
    logger.error('Service configuration validation failed', { errors });
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }

  logger.info('Service configuration validation passed');
};

/**
 * Initialize environment configuration
 */
const initializeEnvironment = () => {
  try {
    validateEnvironment();
    validateServices();
    
    const config = getConfig();
    
    logger.info('Environment initialized', {
      NODE_ENV: config.NODE_ENV,
      PORT: config.PORT,
      LOG_LEVEL: config.LOG_LEVEL,
      ENABLE_REGISTRATION: config.ENABLE_REGISTRATION,
      ENABLE_VIDEO_GENERATION: config.ENABLE_VIDEO_GENERATION,
      DEBUG_MODE: config.DEBUG_MODE
    });
    
    return config;
  } catch (error) {
    logger.error('Failed to initialize environment', { error: error.message });
    throw error;
  }
};

module.exports = {
  validateEnvironment,
  getConfig,
  isDevelopment,
  isProduction,
  isTest,
  getDatabaseUrl,
  getLogLevel,
  getCorsOrigins,
  validateServices,
  initializeEnvironment
};