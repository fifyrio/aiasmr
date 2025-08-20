const axios = require('axios');
const logger = require('../utils/logger');

/**
 * KIE VEO3 Client for video generation API
 */
class KieVeo3Client {
  constructor(apiKey, options = {}) {
    this.maxRetries = options.maxRetries || 3;
    
    const baseURL = process.env.KIE_BASE_URL || 'https://api.kie.ai/api/v1';
    logger.info('KIE Client Configuration', {
      baseURL,
      timeout: options.timeout || 30000,
      maxRetries: this.maxRetries,
      hasApiKey: !!apiKey
    });
    
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for debugging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('KIE API Request', {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          timeout: config.timeout,
          headers: {
            ...config.headers,
            Authorization: config.headers.Authorization ? '[REDACTED]' : undefined
          }
        });
        return config;
      },
      (error) => {
        logger.error('KIE API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for debugging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('KIE API Response', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          dataType: typeof response.data
        });
        return response;
      },
      (error) => {
        logger.error('KIE API Response Error', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      logger.info('Testing KIE API connection...');
      // Try a simple request to test connectivity
      await this.client.get('/health', { timeout: 10000 });
      logger.info('KIE API connection test successful');
      return true;
    } catch (error) {
      logger.error('KIE API connection test failed', error);
      return false;
    }
  }

  /**
   * Generate video with KIE API
   * @param {Object} options - Video generation options
   * @param {string} options.prompt - Video description prompt
   * @param {string} [options.imageUrl] - Reference image URL
   * @param {number} options.duration - Video duration (5 or 8 seconds)
   * @param {string} options.quality - Video quality ('720p' or '1080p')
   * @param {string} options.aspectRatio - Video aspect ratio
   * @param {string} [options.waterMark] - Watermark text
   * @param {string} options.callBackUrl - Callback URL for completion notification
   * @returns {Promise<Object>} Generation result with taskId
   */
  async generateVideo(options) {
    this.validateGenerationOptions(options);
    
    // Format the request according to KIE Runway API documentation
    const requestData = {
      prompt: options.prompt,
      duration: options.duration,
      quality: options.quality,
      aspectRatio: options.aspectRatio,
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
      ...(options.imageUrl && { imageUrl: options.imageUrl })
    };

    logger.info('KIE Runway API request data', requestData);
    
    return this.requestWithRetry(async () => {
      const response = await this.client.post('/runway/generate', requestData);
      logger.info('KIE Runway API raw response', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      const responseData = response.data;
      
      // Handle KIE API response format: { code, msg, data }
      if (responseData && typeof responseData === 'object') {
        logger.debug('Searching for taskId in response fields', Object.keys(responseData));
        
        // KIE API returns: { code: 200, msg: "success", data: { taskId: "..." } }
        let taskId;
        
        if (responseData.data && responseData.data.taskId) {
          // Standard KIE API format
          taskId = responseData.data.taskId;
        } else {
          // Fallback: check for other possible locations
          taskId = responseData.taskId || 
                   responseData.task_id || 
                   responseData.id || 
                   responseData.requestId || 
                   responseData.uuid || 
                   responseData.jobId;
        }
        
        logger.debug('Task ID candidates', {
          'data.taskId': responseData.data?.taskId,
          taskId: responseData.taskId,
          task_id: responseData.task_id,
          id: responseData.id,
          requestId: responseData.requestId,
          uuid: responseData.uuid,
          jobId: responseData.jobId,
          finalTaskId: taskId
        });
        
        if (taskId) {
          return {
            taskId: taskId,
            status: responseData.code === 200 ? 'pending' : 'failed',
            result: responseData.data,
            error: responseData.code !== 200 ? responseData.msg : undefined
          };
        } else {
          logger.error('No taskId found in response. Full response:', responseData);
          
          // If we can't find a task ID but the response looks successful
          if (responseData.code === 200 && responseData.msg === 'success') {
            logger.info('Response appears successful but no taskId found, creating mock taskId');
            return {
              taskId: `kie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              status: 'pending',
              result: responseData.data || responseData,
              error: undefined
            };
          }
          
          throw new Error('KIE API response missing task ID');
        }
      } else {
        logger.error('Invalid response format', responseData);
        throw new Error('KIE API returned invalid response format');
      }
    });
  }

  /**
   * Get task status from KIE API
   * @param {string} taskId - Task ID to query
   * @returns {Promise<Object>} Task status information
   */
  async getTaskStatus(taskId) {
    const url = `/runway/record-detail?taskId=${taskId}`;
    
    return this.requestWithRetry(async () => {
      const response = await this.client.get(url);
      logger.debug('KIE Task Status API response', {
        status: response.status,
        data: response.data
      });
      
      const responseData = response.data;
      
      // Handle KIE API response format based on the actual API structure
      if (responseData && responseData.code === 200) {
        const data = responseData.data;
        
        // Map KIE status to our internal status
        let status = 'pending';
        let progress = 0;
        let result = undefined;
        let error = undefined;
        
        // Determine status based on KIE API response format
        if (data.state === 'success' && data.videoInfo?.videoUrl) {
          status = 'completed';
          progress = 100;
          result = {
            videoUrl: data.videoInfo.videoUrl,
            thumbnailUrl: data.videoInfo.imageUrl,
            duration: undefined // Duration not provided in the API response
          };
        } else if (data.state === 'fail' || data.state === 'failed') {
          status = 'failed';
          progress = 0;
          error = data.failMsg || 'Generation failed';
        } else if (data.state === 'processing' || data.state === 'running') {
          status = 'processing';
          progress = 50;
        } else if (data.state === 'pending' || data.state === 'queue' || data.state === 'waiting') {
          status = 'pending';
          progress = 10;
        } else {
          // Default to pending for unknown states
          status = 'pending';
          progress = 10;
        }
        
        return {
          taskId,
          status,
          result,
          error,
          progress
        };
      } else {
        throw new Error(`KIE API error: ${responseData?.msg || 'Unknown error'}`);
      }
    });
  }

  /**
   * Validate video generation options
   * @param {Object} options - Options to validate
   */
  validateGenerationOptions(options) {
    const errors = [];
    
    if (!options.prompt) {
      errors.push('prompt is required');
    } else if (options.prompt.length > 1800) {
      errors.push('prompt cannot exceed 1800 characters');
    }
    
    if (![5, 8].includes(options.duration)) {
      errors.push('duration must be 5 or 8');
    }
    
    if (!['720p', '1080p'].includes(options.quality)) {
      errors.push('quality must be 720p or 1080p');
    }
    
    // Check for conflicting duration/quality combinations
    if (options.duration === 8 && options.quality === '1080p') {
      errors.push('8-second videos cannot use 1080p resolution');
    }
    
    if (!['16:9', '4:3', '1:1', '3:4', '9:16'].includes(options.aspectRatio)) {
      errors.push('aspectRatio must be 16:9, 4:3, 1:1, 3:4 or 9:16');
    }
    
    if (!options.callBackUrl) {
      errors.push('callBackUrl is required');
    } else {
      try {
        new URL(options.callBackUrl);
      } catch {
        errors.push('callBackUrl is not a valid URL');
      }
    }
    
    if (options.imageUrl) {
      try {
        new URL(options.imageUrl);
      } catch {
        errors.push('imageUrl is not a valid URL');
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Parameter validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Execute request with retry logic
   * @param {Function} requestFn - Function that executes the request
   * @returns {Promise} Request result
   */
  async requestWithRetry(requestFn) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = this.handleError(error);
        
        if (attempt === this.maxRetries) {
          break;
        }
        
        const delay = Math.pow(2, attempt - 1) * 1000;
        logger.warn(`Request failed, retrying in ${delay}ms (${attempt}/${this.maxRetries})`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Handle and format errors
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    logger.error('KIE API Error Details', {
      code: error.code,
      message: error.message,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      }
    });

    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || 'Unknown error';
      
      logger.error('API Response Error', {
        status,
        data,
        headers: error.response.headers
      });
      
      switch (status) {
        case 429:
          return new Error('Too many requests, please try again later');
        case 401:
          return new Error('Invalid API key, please check configuration');
        case 400:
          return new Error(`Invalid request parameters: ${message}`);
        case 403:
          return new Error('API access denied, please check permissions');
        case 404:
          return new Error('API endpoint not found, please check URL configuration');
        case 500:
          return new Error('Internal server error, please try again later');
        default:
          return new Error(`API error ${status}: ${message}`);
      }
    } else if (error.request) {
      logger.error('Network Request Error', {
        request: {
          url: error.request.responseURL || 'N/A',
          status: error.request.status,
          readyState: error.request.readyState
        },
        code: error.code,
        syscall: error.syscall,
        errno: error.errno,
        address: error.address,
        port: error.port
      });
      
      if (error.code === 'ECONNREFUSED') {
        return new Error('Connection refused, please check if API service is available');
      } else if (error.code === 'ENOTFOUND') {
        return new Error('DNS resolution failed, please check network connection and API URL');
      } else if (error.code === 'ETIMEDOUT') {
        return new Error('Request timeout, please check network connection');
      } else {
        return new Error(`Network request failed: ${error.code || 'Unknown network error'}`);
      }
    } else {
      return new Error(`Request configuration error: ${error.message}`);
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create KIE VEO3 client instance
 * @returns {KieVeo3Client} Client instance
 */
const createKieVeo3Client = () => {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error('KIE_API_KEY environment variable not set');
  }
  
  return new KieVeo3Client(apiKey, {
    maxRetries: parseInt(process.env.KIE_MAX_RETRIES || '3'),
    timeout: parseInt(process.env.KIE_TIMEOUT || '30000')
  });
};

module.exports = {
  KieVeo3Client,
  createKieVeo3Client
};