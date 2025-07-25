import axios, { AxiosInstance, AxiosError } from 'axios';

export interface VideoGenerationOptions {
  prompt: string;
  imageUrls?: string[];
  model?: 'veo3' | 'veo3_fast';
  watermark?: string;
  aspectRatio?: '16:9' | '9:16';
  seeds?: number;
  callBackUrl?: string;
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
    
    this.client = axios.create({
      baseURL: process.env.KIE_BASE_URL || 'https://api.kie.ai/api/v1',
      timeout: options.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    this.validateGenerationOptions(options);
    
    return this.requestWithRetry(async () => {
      const response = await this.client.post('/veo/generate', options);
      return response.data;
    });
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get(`/veo/task/${taskId}`);
      return response.data;
    });
  }

  async waitForCompletion(
    taskId: string, 
    maxWaitTime: number = 300000, 
    pollInterval: number = 5000
  ): Promise<TaskStatus> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.getTaskStatus(taskId);
        
        if (status.status === 'completed') {
          return status;
        } else if (status.status === 'failed') {
          throw new Error(`任务失败: ${status.error || '未知错误'}`);
        }
        
        await this.sleep(pollInterval);
      } catch (error) {
        if (Date.now() - startTime >= maxWaitTime) {
          throw new Error('任务等待超时');
        }
        await this.sleep(pollInterval);
      }
    }
    
    throw new Error('任务等待超时');
  }

  private validateGenerationOptions(options: VideoGenerationOptions): void {
    const errors: string[] = [];
    
    if (!options.prompt) {
      errors.push('prompt是必需的');
    } else if (options.prompt.length > 1000) {
      errors.push('prompt不能超过1000个字符');
    }
    
    if (options.model && !['veo3', 'veo3_fast'].includes(options.model)) {
      errors.push('model必须是veo3或veo3_fast');
    }
    
    if (options.aspectRatio && !['16:9', '9:16'].includes(options.aspectRatio)) {
      errors.push('aspectRatio必须是16:9或9:16');
    }
    
    if (options.seeds && (options.seeds < 10000 || options.seeds > 99999)) {
      errors.push('seeds必须在10000-99999范围内');
    }
    
    if (options.imageUrls) {
      if (!Array.isArray(options.imageUrls)) {
        errors.push('imageUrls必须是数组');
      } else {
        options.imageUrls.forEach((url, index) => {
          try {
            new URL(url);
          } catch {
            errors.push(`imageUrls[${index}]不是有效的URL`);
          }
        });
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
    if (error.response) {
      const { status, data } = error.response;
      const message = (data as any)?.message || '未知错误';
      
      switch (status) {
        case 429:
          return new Error('请求过于频繁，请稍后再试');
        case 401:
          return new Error('API密钥无效，请检查配置');
        case 400:
          return new Error('请求参数错误，请检查输入');
        default:
          return new Error(`API错误 ${status}: ${message}`);
      }
    } else if (error.request) {
      return new Error('网络请求失败');
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