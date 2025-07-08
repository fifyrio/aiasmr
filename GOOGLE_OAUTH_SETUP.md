# Google OAuth Setup Guide

## 1. 创建Google Cloud Console项目

### 步骤详解：

1. **访问Google Cloud Console**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 使用Google账号登录

2. **创建新项目**
   - 点击顶部项目选择器
   - 点击 "新建项目"
   - 项目名称：`AI ASMR Video`
   - 点击 "创建"

3. **启用必要的API**
   - 在左侧菜单选择 "API和服务" > "库"
   - 搜索 "Google+ API" 并启用
   - 搜索 "Google People API" 并启用

## 2. 配置OAuth同意屏幕

1. **访问OAuth同意屏幕**
   - 左侧菜单：API和服务 > OAuth同意屏幕
   - 选择 "外部" 用户类型
   - 点击 "创建"

2. **填写应用信息**
   ```
   应用名称：AI ASMR Video
   用户支持电子邮件：你的邮箱
   应用徽标：（可选，上传你的Logo）
   应用主页：http://localhost:3000
   应用隐私权政策链接：http://localhost:3000/privacy
   应用服务条款链接：http://localhost:3000/terms
   ```

3. **添加作用域**
   - 点击 "添加或移除作用域"
   - 选择以下作用域：
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`

4. **添加测试用户**（开发阶段）
   - 添加你的Google邮箱作为测试用户

## 3. 创建OAuth 2.0客户端ID

1. **创建凭据**
   - 左侧菜单：API和服务 > 凭据
   - 点击 "创建凭据" > "OAuth 2.0客户端ID"

2. **配置客户端**
   ```
   应用类型：Web应用
   名称：AI ASMR Video Web Client
   
   已获授权的JavaScript来源：
   - http://localhost:3000
   - https://你的域名.com（生产环境）
   
   已获授权的重定向URI：
   - https://xwthsruuafryyqspqyss.supabase.co/auth/v1/callback
   ```

3. **保存凭据**
   - 点击 "创建"
   - **重要**：复制客户端ID和客户端密钥

## 4. 在Supabase中配置Google OAuth

1. **访问Supabase仪表板**
   - 前往你的Supabase项目仪表板
   - 左侧菜单：Authentication > Providers

2. **启用Google Provider**
   - 找到 "Google" 提供商
   - 切换开关启用
   - 填入从Google Cloud Console获取的：
     - Client ID（客户端ID）
     - Client Secret（客户端密钥）

3. **设置重定向URL**
   - 确认回调URL为：`https://你的项目ID.supabase.co/auth/v1/callback`

## 5. 更新环境变量

将Google OAuth凭据添加到 `.env.local`：

```env
# Google OAuth
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的客户端密钥
```

## 6. 测试配置

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **测试Google登录**
   - 访问 `http://localhost:3000/auth/login`
   - 点击 "Google" 按钮
   - 应该会重定向到Google授权页面

## 注意事项

⚠️ **重要安全提示**：
- 客户端密钥绝对不要提交到代码仓库
- 生产环境需要更新已授权域名
- 定期轮换OAuth密钥

🔧 **常见问题**：
- 如果遇到 "redirect_uri_mismatch" 错误，检查Supabase回调URL配置
- 如果遇到作用域错误，确保OAuth同意屏幕配置正确
- 测试阶段记得添加测试用户邮箱

## 下一步

配置完成后，你的用户就可以：
1. 使用Google账号一键登录
2. 自动创建用户档案
3. 无缝访问AI ASMR生成功能

