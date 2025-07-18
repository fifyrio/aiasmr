# Google Veo2 API 集成指南

## 概述

本项目已成功集成Google Veo2 API，用于生成高质量的ASMR视频。Veo2是Google最新的视频生成AI模型，能够根据文本描述创建高质量的视频内容。

## 功能特性

### 🎬 视频生成
- 基于文本描述生成ASMR视频
- 支持多种ASMR触发器（肥皂、海绵、冰块、水、蜂蜜、立方体、花瓣、纸张）
- 自动优化prompt以获得最佳效果
- 支持不同的视频长度和宽高比

### 🗄️ 视频存储
- 自动上传到Google Cloud Storage
- 生成公开访问的URL
- 支持签名下载链接
- 文件管理和清理

### 🔐 用户认证
- 集成Google OAuth登录
- 用户视频管理
- 配额和限制控制

## 技术架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API    │    │   Google APIs   │
│   (Create Page) │───▶│   Routes         │───▶│   Veo2 API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Supabase DB    │    │   Cloud Storage │
                       │   (Video Records)│    │   (Video Files) │
                       └──────────────────┘    └─────────────────┘
```

## 配置步骤

### 1. 环境变量设置

创建 `.env.local` 文件：

```env
# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account-key.json
GOOGLE_CLOUD_STORAGE_BUCKET=ai-asmr-videos

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Google Cloud 设置

1. **创建项目**：在Google Cloud Console创建新项目
2. **启用API**：启用Vertex AI API和Veo2 API
3. **创建服务账号**：配置必要的权限
4. **设置存储桶**：创建Cloud Storage存储桶
5. **配置计费**：确保有有效的计费账户

## API 使用

### 生成视频

```typescript
// POST /api/generate
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Smooth soap cutting with gentle bubbles",
    triggers: ["soap", "water"]
  })
});

const { videoUrl, metadata } = await response.json();
```

## 核心功能实现

### 1. Veo2 API 调用

```typescript
// src/lib/google-veo2.ts
async generateASMRVideo(prompt: string, triggers: string[]): Promise<string> {
  const enhancedPrompt = this.buildEnhancedPrompt(prompt, triggers);
  const videoData = await this.callVeo2API(enhancedPrompt);
  
  // 处理视频数据并上传到存储
  if (videoData.startsWith('data:')) {
    const videoBuffer = this.convertToBuffer(videoData);
    const filename = `asmr-videos/${Date.now()}-${Math.random()}.mp4`;
    return await storageService.uploadVideo(videoBuffer, filename);
  }
  
  return videoData;
}
```

## 部署指南

### 开发环境

```bash
npm install
npm run dev
```

### 生产环境

1. **Vercel部署**
   ```bash
   vercel --prod
   ```

2. **环境变量配置**
   - 在Vercel项目设置中配置所有环境变量
   - 将服务账号密钥内容作为环境变量值

## 故障排除

### 常见错误及解决方案

1. **"Missing Google Cloud configuration"**
   - 检查环境变量设置
   - 确认服务账号密钥文件路径

2. **"API quota exceeded"**
   - 检查配额限制
   - 确认计费账户有效

3. **"Authentication failed"**
   - 验证服务账号权限
   - 检查API是否已启用

## 支持

如有问题，请查看：
- [Google Veo2 API 文档](https://ai.google.dev/docs/veo2)
- [Google Cloud Storage 文档](https://cloud.google.com/storage/docs) 