# Kie.ai Veo 3 API Node.js 开发手册

## 概述

Kie.ai Veo 3 是一个强大的视频生成API，支持文本到视频和图像到视频的转换。本手册提供了使用Node.js集成Veo 3 API的完整指南。

## 快速开始

### 1. 获取API密钥

访问 [https://kie.ai/api-key](https://kie.ai/api-key) 获取您的API密钥。

### 2. 安装依赖

```bash
npm install axios
# 或者
npm install node-fetch
```

### 3. 基础配置

```javascript
const axios = require('axios');

const KIE_API_BASE_URL = 'https://api.kie.ai/api/v1';
const API_KEY = 'your-api-key-here'; // 从环境变量获取

const kieClient = axios.create({
  baseURL: KIE_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

## API 参考

### 生成视频

**端点**: `POST /veo/generate`

#### 请求参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `prompt` | string | 是 | 视频内容的详细文本描述 |
| `imageUrls` | string[] | 否 | 图像URL列表（图像到视频模式） |
| `model` | string | 否 | 模型类型："veo3"（默认）或 "veo3_fast" |
| `watermark` | string | 否 | 添加到视频的水印文本 |
| `aspectRatio` | string | 否 | 宽高比："16:9"（横向）或 "9:16"（纵向） |
| `seeds` | number | 否 | 随机种子（10000-99999） |
| `callBackUrl` | string | 否 | 任务完成通知的回调URL |

#### 响应

成功响应 (200):
```json
{
  "taskId": "task_123456789",
  "status": "pending"
}
```

## Node.js 实现示例

### 基础视频生成客户端

```javascript
class KieVeo3Client {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.kie.ai/api/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 生成视频
   * @param {Object} options - 生成选项
   * @param {string} options.prompt - 视频描述
   * @param {string[]} [options.imageUrls] - 图像URL列表
   * @param {string} [options.model='veo3'] - 模型类型
   * @param {string} [options.watermark] - 水印文本
   * @param {string} [options.aspectRatio='16:9'] - 宽高比
   * @param {number} [options.seeds] - 随机种子
   * @param {string} [options.callBackUrl] - 回调URL
   * @returns {Promise<Object>} 生成任务信息
   */
  async generateVideo(options) {
    try {
      const response = await this.client.post('/veo/generate', options);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 处理API错误
   * @private
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      throw new Error(`API Error ${status}: ${data.message || '未知错误'}`);
    } else if (error.request) {
      throw new Error('网络请求失败');
    } else {
      throw new Error(`请求配置错误: ${error.message}`);
    }
  }
}
```

### 使用示例

#### 1. 文本到视频

```javascript
const client = new KieVeo3Client(process.env.KIE_API_KEY);

async function generateTextToVideo() {
  try {
    const result = await client.generateVideo({
      prompt: "一只可爱的小猫在阳光明媚的花园里玩耍，镜头缓慢移动，4K高清画质",
      model: "veo3",
      aspectRatio: "16:9",
      watermark: "我的品牌"
    });

    console.log('视频生成任务已创建:', result.taskId);
    return result;
  } catch (error) {
    console.error('视频生成失败:', error.message);
  }
}
```

#### 2. 图像到视频

```javascript
async function generateImageToVideo() {
  try {
    const result = await client.generateVideo({
      prompt: "基于这张图片，创建一个梦幻般的动画序列，添加粒子效果和光影变化",
      imageUrls: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      model: "veo3_fast",
      aspectRatio: "9:16",
      seeds: 42856
    });

    console.log('图像到视频生成任务已创建:', result.taskId);
    return result;
  } catch (error) {
    console.error('图像到视频生成失败:', error.message);
  }
}
```

### 高级功能

#### 任务状态查询

```javascript
class KieVeo3ClientAdvanced extends KieVeo3Client {
  /**
   * 查询任务状态（需要根据实际API调整）
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 任务状态信息
   */
  async getTaskStatus(taskId) {
    try {
      const response = await this.client.get(`/veo/task/${taskId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 等待任务完成
   * @param {string} taskId - 任务ID
   * @param {number} [maxWaitTime=300000] - 最大等待时间（毫秒）
   * @param {number} [pollInterval=5000] - 轮询间隔（毫秒）
   * @returns {Promise<Object>} 完成的任务结果
   */
  async waitForCompletion(taskId, maxWaitTime = 300000, pollInterval = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.getTaskStatus(taskId);
        
        if (status.status === 'completed') {
          return status;
        } else if (status.status === 'failed') {
          throw new Error(`任务失败: ${status.error || '未知错误'}`);
        }
        
        console.log(`任务 ${taskId} 状态: ${status.status}`);
        await this.sleep(pollInterval);
      } catch (error) {
        console.error('查询任务状态失败:', error.message);
        await this.sleep(pollInterval);
      }
    }
    
    throw new Error('任务等待超时');
  }

  /**
   * 睡眠函数
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 批量生成

```javascript
async function batchGenerate() {
  const client = new KieVeo3ClientAdvanced(process.env.KIE_API_KEY);
  
  const requests = [
    {
      prompt: "春天的樱花飘落",
      aspectRatio: "16:9"
    },
    {
      prompt: "夏日海滩的日落",
      aspectRatio: "16:9"
    },
    {
      prompt: "秋天的枫叶林",
      aspectRatio: "9:16"
    }
  ];

  try {
    // 并发发起所有请求
    const tasks = await Promise.all(
      requests.map(req => client.generateVideo(req))
    );

    console.log('所有任务已创建:', tasks.map(t => t.taskId));

    // 等待所有任务完成
    const results = await Promise.all(
      tasks.map(task => client.waitForCompletion(task.taskId))
    );

    console.log('所有视频生成完成:', results);
    return results;
  } catch (error) {
    console.error('批量生成失败:', error.message);
  }
}
```

### 回调处理

#### Express.js 回调服务器

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// 处理Kie.ai回调
app.post('/kie-callback', (req, res) => {
  try {
    const { taskId, status, result, error } = req.body;
    
    console.log(`任务 ${taskId} 状态更新: ${status}`);
    
    if (status === 'completed') {
      console.log('视频生成完成:', result);
      // 处理完成的视频
      handleCompletedVideo(taskId, result);
    } else if (status === 'failed') {
      console.error('视频生成失败:', error);
      // 处理失败情况
      handleFailedVideo(taskId, error);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('回调处理错误:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function handleCompletedVideo(taskId, result) {
  // 实现您的业务逻辑
  console.log(`处理完成的视频: ${taskId}`);
  // 例如：保存到数据库、发送通知等
}

function handleFailedVideo(taskId, error) {
  // 实现错误处理逻辑
  console.log(`处理失败的视频: ${taskId}, 错误: ${error}`);
}

app.listen(3000, () => {
  console.log('回调服务器运行在端口 3000');
});
```

### 配置管理

#### 环境配置

```javascript
// config.js
module.exports = {
  kie: {
    apiKey: process.env.KIE_API_KEY,
    baseURL: process.env.KIE_BASE_URL || 'https://api.kie.ai/api/v1',
    timeout: parseInt(process.env.KIE_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.KIE_MAX_RETRIES) || 3
  }
};
```

#### 带重试机制的客户端

```javascript
class KieVeo3ClientRobust extends KieVeo3Client {
  constructor(apiKey, options = {}) {
    super(apiKey);
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000;
    
    // 添加超时配置
    this.client.defaults.timeout = this.timeout;
  }

  /**
   * 带重试的请求方法
   * @private
   */
  async requestWithRetry(requestFn, maxRetries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // 指数退避
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`请求失败，${delay}ms后重试 (${attempt}/${maxRetries})`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * 重写生成视频方法，添加重试机制
   */
  async generateVideo(options) {
    return this.requestWithRetry(async () => {
      const response = await this.client.post('/veo/generate', options);
      return response.data;
    });
  }
}
```

## 最佳实践

### 1. 错误处理

```javascript
async function robustVideoGeneration(prompt, options = {}) {
  const client = new KieVeo3ClientRobust(process.env.KIE_API_KEY);
  
  try {
    // 验证输入
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('提示词不能为空');
    }
    
    if (prompt.length > 1000) {
      throw new Error('提示词过长，请控制在1000字符以内');
    }
    
    // 生成视频
    const result = await client.generateVideo({
      prompt: prompt.trim(),
      ...options
    });
    
    return result;
  } catch (error) {
    // 记录错误
    console.error('视频生成错误:', {
      error: error.message,
      prompt,
      options,
      timestamp: new Date().toISOString()
    });
    
    // 根据错误类型采取不同行动
    if (error.message.includes('API Error 429')) {
      throw new Error('请求过于频繁，请稍后再试');
    } else if (error.message.includes('API Error 401')) {
      throw new Error('API密钥无效，请检查配置');
    } else if (error.message.includes('API Error 400')) {
      throw new Error('请求参数错误，请检查输入');
    }
    
    throw error;
  }
}
```

### 2. 输入验证

```javascript
function validateGenerationOptions(options) {
  const errors = [];
  
  // 验证prompt
  if (!options.prompt) {
    errors.push('prompt是必需的');
  } else if (options.prompt.length > 1000) {
    errors.push('prompt不能超过1000个字符');
  }
  
  // 验证模型
  if (options.model && !['veo3', 'veo3_fast'].includes(options.model)) {
    errors.push('model必须是veo3或veo3_fast');
  }
  
  // 验证宽高比
  if (options.aspectRatio && !['16:9', '9:16'].includes(options.aspectRatio)) {
    errors.push('aspectRatio必须是16:9或9:16');
  }
  
  // 验证种子
  if (options.seeds && (options.seeds < 10000 || options.seeds > 99999)) {
    errors.push('seeds必须在10000-99999范围内');
  }
  
  // 验证图像URL
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
```

### 3. 性能优化

```javascript
// 使用连接池
const https = require('https');
const axios = require('axios');

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

const optimizedClient = axios.create({
  httpsAgent,
  timeout: 30000,
});
```

## 完整示例应用

```javascript
const KieVeo3Client = require('./kie-veo3-client');

class VideoGenerationService {
  constructor() {
    this.client = new KieVeo3ClientRobust(process.env.KIE_API_KEY);
    this.activeJobs = new Map();
  }

  async createVideo(prompt, options = {}) {
    // 验证输入
    validateGenerationOptions({ prompt, ...options });
    
    try {
      // 生成视频
      const result = await this.client.generateVideo({
        prompt,
        model: options.model || 'veo3',
        aspectRatio: options.aspectRatio || '16:9',
        watermark: options.watermark,
        seeds: options.seeds,
        callBackUrl: `${process.env.BASE_URL}/api/kie-callback`
      });

      // 保存任务信息
      this.activeJobs.set(result.taskId, {
        prompt,
        options,
        status: 'pending',
        createdAt: new Date(),
        taskId: result.taskId
      });

      return result;
    } catch (error) {
      throw new Error(`视频生成失败: ${error.message}`);
    }
  }

  async getJobStatus(taskId) {
    return this.activeJobs.get(taskId) || null;
  }

  handleCallback(taskId, status, result) {
    const job = this.activeJobs.get(taskId);
    if (job) {
      job.status = status;
      job.result = result;
      job.completedAt = new Date();
      
      if (status === 'completed' || status === 'failed') {
        // 可以在这里触发业务逻辑
        console.log(`任务 ${taskId} ${status}`);
      }
    }
  }
}

module.exports = VideoGenerationService;
```

## 环境变量配置

创建 `.env` 文件：

```bash
# Kie.ai API配置
KIE_API_KEY=your-api-key-here
KIE_BASE_URL=https://api.kie.ai/api/v1
KIE_TIMEOUT=30000
KIE_MAX_RETRIES=3

# 应用配置
BASE_URL=https://your-domain.com
PORT=3000
```

## 总结

这个Node.js手册涵盖了Kie.ai Veo 3 API的完整使用方法，包括：

- 基础API调用
- 错误处理和重试机制
- 批量处理
- 回调处理
- 输入验证
- 性能优化
- 完整的生产级示例

使用这些示例和最佳实践，您可以轻松地将Veo 3视频生成功能集成到您的Node.js应用中。