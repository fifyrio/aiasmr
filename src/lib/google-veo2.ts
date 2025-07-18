import { GoogleAuth } from 'google-auth-library';
import { storageService } from './google-storage';

// Google Veo2 API配置
export class GoogleVeo2API {
  private auth: GoogleAuth;
  private projectId: string;
  private location: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    // 初始化Google认证
    this.auth = new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  /**
   * 生成ASMR视频
   * @param prompt 视频描述
   * @param triggers ASMR触发器
   * @returns 生成的视频URL
   */
  async generateASMRVideo(prompt: string, triggers: string[]): Promise<string> {
    try {
      // 构建增强的prompt
      const enhancedPrompt = this.buildEnhancedPrompt(prompt, triggers);
      
      // 调用Veo2 API生成视频
      const videoData = await this.callVeo2API(enhancedPrompt);
      
      // 如果返回的是视频数据而不是URL，需要上传到存储
      if (videoData.startsWith('data:') || videoData.startsWith('blob:')) {
        // 处理base64或blob数据
        const videoBuffer = this.convertToBuffer(videoData);
        const filename = `asmr-videos/${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
        return await storageService.uploadVideo(videoBuffer, filename);
      }
      
      return videoData;
    } catch (error) {
      console.error('Veo2 API error:', error);
      throw new Error('Failed to generate video with Veo2 API');
    }
  }

  /**
   * 构建增强的prompt
   */
  private buildEnhancedPrompt(prompt: string, triggers: string[]): string {
    const triggerDescriptions = {
      soap: 'smooth, creamy soap with gentle bubbles and soft textures',
      sponge: 'porous sponge with satisfying squish sounds and water absorption',
      ice: 'crystalline ice with melting droplets and cold condensation',
      water: 'flowing water with ripples, droplets, and liquid movement',
      honey: 'thick, golden honey with slow, viscous flow and sticky texture',
      cubes: 'geometric cubes with clean edges and satisfying stacking',
      petals: 'delicate flower petals with soft, organic textures',
      pages: 'paper pages with gentle turning sounds and smooth surfaces'
    };

    const selectedTriggerDescriptions = triggers
      .map(trigger => triggerDescriptions[trigger as keyof typeof triggerDescriptions])
      .filter(Boolean)
      .join(', ');

    return `Create a high-quality ASMR video featuring: ${prompt}. 
    Focus on these ASMR triggers: ${selectedTriggerDescriptions}. 
    The video should be calming, visually appealing, and optimized for ASMR content. 
    Include close-up shots, smooth camera movements, and satisfying visual textures. 
    Duration: 10-15 seconds, high resolution, smooth frame rate.`;
  }

  /**
   * 调用Veo2 API
   */
  private async callVeo2API(prompt: string): Promise<string> {
    try {
      // 获取认证token
      const authClient = await this.auth.getClient();
      const accessToken = await authClient.getAccessToken();

      // Veo2 API端点
      const apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/veo2:predict`;

      // 构建请求体
      const requestBody = {
        instances: [
          {
            prompt: prompt,
            video_length: "SHORT", // SHORT, MEDIUM, LONG
            aspect_ratio: "16:9", // 16:9, 9:16, 1:1
            style_preset: "CINEMATIC", // CINEMATIC, PHOTOREALISTIC, ANIMATED
            quality: "HIGH", // STANDARD, HIGH
            seed: Math.floor(Math.random() * 1000000), // 随机种子
          }
        ],
        parameters: {
          sampleImageCount: 1,
          sampleVideoCount: 1,
        }
      };

      // 发送请求
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Veo2 API response error:', errorText);
        throw new Error(`Veo2 API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // 处理响应数据
      if (data.predictions && data.predictions[0] && data.predictions[0].video) {
        // 返回生成的视频URL或数据
        return data.predictions[0].video;
      } else {
        throw new Error('No video generated in response');
      }

    } catch (error) {
      console.error('Veo2 API call failed:', error);
      throw error;
    }
  }

  /**
   * 转换视频数据为Buffer
   */
  private convertToBuffer(videoData: string): Buffer {
    if (videoData.startsWith('data:video/mp4;base64,')) {
      const base64Data = videoData.replace('data:video/mp4;base64,', '');
      return Buffer.from(base64Data, 'base64');
    }
    
    // 如果是其他格式，尝试直接转换
    return Buffer.from(videoData, 'base64');
  }

  /**
   * 检查API配额和限制
   */
  async checkQuota(): Promise<{ remaining: number; resetTime: string }> {
    try {
      const authClient = await this.auth.getClient();
      const accessToken = await authClient.getAccessToken();

      const quotaUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/operations`;

      const response = await fetch(quotaUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 解析配额信息
        return {
          remaining: 100, // 示例值，需要根据实际API响应解析
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 示例值
        };
      }

      return { remaining: 0, resetTime: new Date().toISOString() };
    } catch (error) {
      console.error('Quota check failed:', error);
      return { remaining: 0, resetTime: new Date().toISOString() };
    }
  }
}

// 创建单例实例
export const veo2API = new GoogleVeo2API(); 