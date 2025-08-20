const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./src/utils/logger');
const { errorHandler } = require('./src/middleware/error-handler');
const { generalLimit } = require('./src/middleware/rate-limit');

// Import routes
const authRoutes = require('./src/routes/auth');
const videoRoutes = require('./src/routes/videos');
const generateRoutes = require('./src/routes/generate');
const creditsRoutes = require('./src/routes/credits');
const userRoutes = require('./src/routes/user');
const kieCallbackRoutes = require('./src/routes/kie-callback');
const healthRoutes = require('./src/routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use(generalLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/kie-callback', kieCallbackRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Backend API server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;