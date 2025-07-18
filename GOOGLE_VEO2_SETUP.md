# Google Veo2 API 设置指南

## 1. 创建Google Cloud项目

### 步骤详解：

1. **访问Google Cloud Console**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 使用Google账号登录

2. **创建新项目**
   - 点击顶部项目选择器
   - 点击 "新建项目"
   - 项目名称：`AI ASMR Video Generator`
   - 点击 "创建"

3. **启用必要的API**
   - 在左侧菜单选择 "API和服务" > "库"
   - 搜索 "Vertex AI API" 并启用
   - 搜索 "Veo2 API" 并启用（如果可用）

## 2. 创建服务账号

1. **访问IAM和管理**
   - 左侧菜单：IAM和管理 > 服务账号
   - 点击 "创建服务账号"

2. **配置服务账号**
   ```
   服务账号名称：veo2-api-service
   服务账号ID：veo2-api-service
   描述：用于调用Veo2 API生成ASMR视频
   ```

3. **分配角色**
   - 点击 "继续"
   - 添加以下角色：
     - Vertex AI 用户
     - AI Platform 开发者
     - 存储对象查看者（如果需要存储视频）

4. **创建密钥**
   - 点击 "完成"
   - 在服务账号列表中找到刚创建的账号
   - 点击 "密钥" > "添加密钥" > "创建新密钥"
   - 选择 "JSON" 格式
   - 下载密钥文件并安全保存

## 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Google Cloud Platform Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account-key.json

# Google OAuth (for user authentication)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## 4. 设置API配额和计费

1. **启用计费**
   - 左侧菜单：计费
   - 链接计费账户到项目
   - Veo2 API需要有效的计费账户

2. **设置配额限制**
   - 左侧菜单：IAM和管理 > 配额
   - 搜索 "Veo2" 相关配额
   - 根据需要调整配额限制

## 5. 测试配置

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **测试视频生成**
   - 访问 `http://localhost:3000/create`
   - 输入prompt和选择触发器
   - 点击生成按钮测试API调用

## 6. 生产环境部署

### Vercel部署

1. **上传服务账号密钥**
   - 在Vercel项目设置中添加环境变量
   - 将服务账号密钥内容作为环境变量值

2. **设置环境变量**
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-production-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}
   ```

### 其他平台

根据部署平台的要求，相应配置环境变量和服务账号密钥。

## 7. 安全注意事项

⚠️ **重要安全提示**：
- 服务账号密钥绝对不要提交到代码仓库
- 使用环境变量存储敏感信息
- 定期轮换服务账号密钥
- 限制服务账号权限到最小必要范围
- 监控API使用量和费用

## 8. 故障排除

### 常见错误

1. **"Missing Google Cloud configuration"**
   - 检查环境变量是否正确设置
   - 确认服务账号密钥文件路径正确

2. **"API quota exceeded"**
   - 检查配额限制
   - 确认计费账户有效

3. **"Authentication failed"**
   - 验证服务账号密钥格式
   - 确认服务账号有足够权限

4. **"Veo2 API not available"**
   - 确认在支持的地区启用API
   - 检查API是否已启用

### 调试技巧

1. **查看日志**
   ```bash
   # 开发环境
   npm run dev
   
   # 生产环境
   vercel logs
   ```

2. **测试API连接**
   ```bash
   # 使用gcloud CLI测试
   gcloud auth activate-service-account --key-file=./google-service-account-key.json
   gcloud ai operations list --region=us-central1
   ```

## 9. 成本优化

1. **监控使用量**
   - 设置预算警报
   - 定期检查API调用次数

2. **优化请求**
   - 使用合适的视频长度设置
   - 避免不必要的API调用

3. **缓存策略**
   - 缓存生成的视频
   - 实现用户配额限制

## 下一步

配置完成后，你的应用就可以：
1. 使用Google Veo2 API生成高质量ASMR视频
2. 根据用户选择的触发器优化视频内容
3. 提供流畅的用户体验
4. 安全地处理API调用和认证 