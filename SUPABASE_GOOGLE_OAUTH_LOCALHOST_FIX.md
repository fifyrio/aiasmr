# Supabase Google OAuth Localhost 修复指南

## 问题诊断

Google OAuth在localhost不工作的主要原因通常是Supabase的Auth配置问题。

## 解决步骤

### 1. 检查Supabase Auth配置

登录你的Supabase项目：https://supabase.com/dashboard

#### A. 检查Site URL设置
1. 进入 `Authentication` > `URL Configuration`
2. 检查以下设置：

**Site URL（重要）**：
- 开发环境应该设置为：`http://localhost:3000`
- 如果设置错误，Google OAuth会重定向到错误的URL

**Additional Redirect URLs**：
添加以下URL（每行一个）：
```
http://localhost:3000
http://localhost:3000/auth/callback
https://www.aiasmr.vip
https://www.aiasmr.vip/auth/callback
```

#### B. 检查Google OAuth Provider配置
1. 进入 `Authentication` > `Providers`
2. 找到 `Google` 提供商
3. 确保以下设置正确：

**Client ID**: `your-google-client-id.apps.googleusercontent.com`
**Client Secret**: `your-google-client-secret`

**Redirect URL（重要）**：
应该显示类似：`https://your-project-id.supabase.co/auth/v1/callback`

### 2. 更新Google Cloud Console

使用Supabase提供的redirect URL更新Google Cloud Console：

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目
3. 进入 `APIs & Services` > `Credentials`
4. 选择你的OAuth 2.0客户端ID

**Authorized JavaScript origins**:
```
http://localhost:3000
https://your-project-id.supabase.co
https://www.aiasmr.vip
```

**Authorized redirect URIs**:
```
http://localhost:3000/auth/callback
https://your-project-id.supabase.co/auth/v1/callback
https://www.aiasmr.vip/auth/callback
```

### 3. 验证环境变量

确保 `.env.local` 文件包含：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Environment-specific URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTION_URL=https://www.aiasmr.vip

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. 测试步骤

1. **重启开发服务器**：
   ```bash
   npm run dev
   ```

2. **访问调试页面**：
   ```
   http://localhost:3000/debug-auth
   ```
   检查配置是否正确

3. **测试Google登录**：
   - 访问 `http://localhost:3000/auth/login`
   - 点击 "Login with Google"
   - 应该重定向到Google授权页面
   - 授权后应该回到你的应用

### 5. 常见错误及解决方案

#### 错误: "redirect_uri_mismatch"
**原因**: Google Cloud Console中的重定向URI不匹配
**解决**: 确保添加了 `https://your-project-id.supabase.co/auth/v1/callback`

#### 错误: "Invalid redirect URL"
**原因**: Supabase的Site URL设置错误
**解决**: 在Supabase Auth设置中设置Site URL为 `http://localhost:3000`

#### 错误: 登录后重定向到生产URL
**原因**: Supabase的Site URL设置为生产URL
**解决**: 临时将Site URL改为localhost，或在Additional Redirect URLs中添加localhost

### 6. 开发vs生产环境处理

为了更好地处理开发和生产环境，建议：

**开发环境配置**:
- Supabase Site URL: `http://localhost:3000`
- 在Additional Redirect URLs中添加生产URL

**生产环境配置**:
- Supabase Site URL: `https://www.aiasmr.vip`
- 保留localhost在Additional Redirect URLs中用于开发

### 7. 验证检查清单

- [ ] Supabase Site URL设置为 `http://localhost:3000`
- [ ] Supabase Additional Redirect URLs包含localhost和生产URL
- [ ] Google Cloud Console重定向URI包含Supabase回调URL
- [ ] 环境变量正确设置
- [ ] 开发服务器已重启
- [ ] 浏览器缓存已清除

## 如果仍然不工作

1. 检查浏览器控制台的错误信息
2. 检查Network标签中的请求和响应
3. 访问 `/debug-auth` 页面查看配置详情
4. 检查Supabase项目的Auth日志