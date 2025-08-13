import axios, { AxiosInstance, AxiosError } from 'axios';

export interface VideoGenerationOptions {
  prompt: string;
  imageUrl?: string;
  duration: 5 | 8;
  quality: '720p' | '1080p';
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
  waterMark?: string;
  callBackUrl: string;
}

export interface VideoGenerationResult {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  };
  error?: string;
}

export interface TaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  };
  error?: string;
  progress?: number;
}

export class KieVeo3Client {
  private client: AxiosInstance;
  private maxRetries: number;

  constructor(apiKey: string, options: { maxRetries?: number; timeout?: number } = {}) {
    this.maxRetries = options.maxRetries || 3;
    
    const baseURL = process.env.KIE_BASE_URL || 'https://api.kie.ai/api/v1';
    console.log('KIE Client Configuration:', {
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
        console.log('KIE API Request:', {
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
        console.error('KIE API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for debugging
    this.client.interceptors.response.use(
      (response) => {
        console.log('KIE API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          dataType: typeof response.data
        });
        return response;
      },
      (error) => {
        console.error('KIE API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing KIE API connection...');
      // Try a simple request to test connectivity
      const response = await this.client.get('/health', { timeout: 10000 });
      console.log('KIE API connection test successful');
      return true;
    } catch (error) {
      console.error('KIE API connection test failed:', error);
      return false;
    }
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    this.validateGenerationOptions(options);
    
    // Format the request according to new KIE Runway API documentation
    const requestData = {
      prompt: options.prompt,
      duration: options.duration,
      quality: options.quality,
      aspectRatio: options.aspectRatio,
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
      ...(options.imageUrl && { imageUrl: options.imageUrl })
    };

    console.log('KIE Runway API request data:', JSON.stringify(requestData, null, 2));
    
    return this.requestWithRetry(async () => {
      const response = await this.client.post('/runway/generate', requestData);
      console.log('KIE Runway API raw response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      const responseData = response.data;
      
      // Handle KIE API response format: { code, msg, data }
      if (responseData && typeof responseData === 'object') {
        console.log('Searching for taskId in response fields:', Object.keys(responseData));
        
        // KIE API returns: { code: 200, msg: "success", data: { taskId: "..." } }
        let taskId;
        
        if (responseData.data && responseData.data.taskId) {
          // Standard KIE API format
          taskId = responseData.data.taskId;
        } else {
          // Fallback: check for other possible locations
          taskId = responseData.taskId || responseData.task_id || responseData.id || responseData.requestId || responseData.uuid || responseData.jobId;
        }
        
        console.log('Task ID candidates:', {
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
          console.error('No taskId found in response. Full response:', JSON.stringify(responseData, null, 2));
          
          // If we can't find a task ID but the response looks successful
          if (responseData.code === 200 && responseData.msg === 'success') {
            console.log('Response appears successful but no taskId found, creating mock taskId');
            return {
              taskId: `kie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              status: 'pending',
              result: responseData.data || responseData,
              error: undefined
            };
          }
          
          throw new Error('KIE API响应中未找到任务ID');
        }
      } else {
        console.error('Invalid response format:', responseData);
        throw new Error('KIE API返回无效的响应格式');
      }
    });
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const url = `/runway/record-detail?taskId=${taskId}`;
    
    return this.requestWithRetry(async () => {
      const response = await this.client.get(url);
      console.log('KIE Task Status API response:', {
        status: response.status,
        data: response.data
      });
      
      const responseData = response.data;
      
      // Handle KIE API response format based on the actual API structure
      if (responseData && responseData.code === 200) {
        const data = responseData.data;
        
        // Map KIE status to our internal status
        let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
        let progress = 0;
        let result = null;
        let error = null;
        
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
        throw new Error(`KIE API错误: ${responseData?.msg || 'Unknown error'}`);
      }
    });
  }

  private validateGenerationOptions(options: VideoGenerationOptions): void {
    const errors: string[] = [];
    
    if (!options.prompt) {
      errors.push('prompt是必需的');
    } else if (options.prompt.length > 1800) {
      errors.push('prompt不能超过1800个字符');
    }
    
    if (![5, 8].includes(options.duration)) {
      errors.push('duration必须是5或8');
    }
    
    if (!['720p', '1080p'].includes(options.quality)) {
      errors.push('quality必须是720p或1080p');
    }
    
    // Check for conflicting duration/quality combinations
    if (options.duration === 8 && options.quality === '1080p') {
      errors.push('8秒视频不能选择1080p分辨率');
    }
    
    if (!['16:9', '4:3', '1:1', '3:4', '9:16'].includes(options.aspectRatio)) {
      errors.push('aspectRatio必须是16:9, 4:3, 1:1, 3:4或9:16');
    }
    
    if (!options.callBackUrl) {
      errors.push('callBackUrl是必需的');
    } else {
      try {
        new URL(options.callBackUrl);
      } catch {
        errors.push('callBackUrl不是有效的URL');
      }
    }
    
    if (options.imageUrl) {
      try {
        new URL(options.imageUrl);
      } catch {
        errors.push('imageUrl不是有效的URL');
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`参数验证失败: ${errors.join(', ')}`);
    }
  }

  private async requestWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = this.handleError(error as AxiosError);
        
        if (attempt === this.maxRetries) {
          break;
        }
        
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`请求失败，${delay}ms后重试 (${attempt}/${this.maxRetries})`);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private handleError(error: AxiosError): Error {
    console.error('KIE API Error Details:', {
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
      const message = (data as any)?.message || '未知错误';
      
      console.error('API Response Error:', {
        status,
        data,
        headers: error.response.headers
      });
      
      switch (status) {
        case 429:
          return new Error('请求过于频繁，请稍后再试');
        case 401:
          return new Error('API密钥无效，请检查配置');
        case 400:
          return new Error(`请求参数错误: ${message}`);
        case 403:
          return new Error('API访问被拒绝，请检查权限');
        case 404:
          return new Error('API端点不存在，请检查URL配置');
        case 500:
          return new Error('服务器内部错误，请稍后重试');
        default:
          return new Error(`API错误 ${status}: ${message}`);
      }
    } else if (error.request) {
      console.error('Network Request Error:', {
        request: {
          url: error.request.responseURL || 'N/A',
          status: error.request.status,
          readyState: error.request.readyState
        },
        code: error.code,
        syscall: (error as any).syscall,
        errno: (error as any).errno,
        address: (error as any).address,
        port: (error as any).port
      });
      
      if (error.code === 'ECONNREFUSED') {
        return new Error('连接被拒绝，请检查API服务是否可用');
      } else if (error.code === 'ENOTFOUND') {
        return new Error('域名解析失败，请检查网络连接和API URL');
      } else if (error.code === 'ETIMEDOUT') {
        return new Error('请求超时，请检查网络连接');
      } else {
        return new Error(`网络请求失败: ${error.code || '未知网络错误'}`);
      }
    } else {
      return new Error(`请求配置错误: ${error.message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const createKieVeo3Client = (): KieVeo3Client => {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error('KIE_API_KEY环境变量未设置');
  }
  
  return new KieVeo3Client(apiKey, {
    maxRetries: parseInt(process.env.KIE_MAX_RETRIES || '3'),
    timeout: parseInt(process.env.KIE_TIMEOUT || '30000')
  });
};