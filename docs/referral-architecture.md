# 推荐码持久化架构设计

## 🎯 目标需求

将推荐链接从 `https://www.aiasmr.vip/auth/signup?ref=WAASPGC4` 改为 `https://www.aiasmr.vip?ref=WAASPGC4`，用户从首页进入后在任何时刻登录/注册都能记住推荐关系。

## 🏗️ 架构设计

### 多层存储策略

| 存储方式 | 持久性 | 容量 | 服务端访问 | 用途 |
|---------|-------|------|-----------|------|
| **localStorage** | 浏览器关闭后保留 | 5-10MB | ❌ | 最持久的本地存储 |
| **sessionStorage** | 标签页关闭时清除 | 5-10MB | ❌ | 当前会话优先级最高 |
| **Cookie** | 可设置过期时间 | 4KB | ✅ | 服务端可读取，跨页面 |

### 工作流程

```
用户点击推荐链接
         ↓
https://www.aiasmr.vip?ref=WAASPGC4
         ↓
1. Middleware 拦截请求，设置 Cookie
2. 客户端组件提取 URL 参数
3. ReferralTracker 多层存储推荐码
         ↓
用户浏览网站（推荐码持续保持）
         ↓
用户访问 /auth/signup 或 /auth/login
         ↓
SignupForm/LoginForm 从存储获取推荐码
         ↓
注册成功后调用推荐奖励 API
```

## 🔧 技术实现

### 1. 服务端中间件 (`/src/middleware.ts`)

```typescript
export default function middleware(request: NextRequest) {
  const referralCode = searchParams.get('ref');
  
  if (referralCode && /^[A-Z0-9]{8}$/.test(referralCode)) {
    response.cookies.set('aiasmr_ref', referralCode, {
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/',
      secure: true,
      sameSite: 'lax',
      httpOnly: false
    });
  }
}
```

**职责：**
- 拦截所有带 `?ref=CODE` 的请求
- 设置服务端可读的 Cookie
- 验证推荐码格式

### 2. 客户端追踪器 (`/src/utils/referral-tracker.ts`)

```typescript
export class ReferralTracker {
  static setReferralCode(code: string): void {
    // 1. localStorage (最持久)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({code, expires}));
    
    // 2. sessionStorage (会话期间优先级最高) 
    sessionStorage.setItem(SESSION_KEY, code);
    
    // 3. Cookie (跨页面)
    document.cookie = `${COOKIE_KEY}=${code}; max-age=...`;
  }

  static getReferralCode(): string | null {
    // 优先级：sessionStorage > localStorage > Cookie
    return sessionStorage.getItem(SESSION_KEY) || 
           localStorage.getItem(STORAGE_KEY) || 
           getCookieValue(COOKIE_KEY);
  }
}
```

**职责：**
- 三层存储确保可靠性
- 智能获取（按优先级）
- URL 参数提取和验证
- 过期时间管理

### 3. 全局追踪组件 (`/src/components/ReferralTracker.tsx`)

```typescript
export default function ReferralTrackerComponent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      ReferralTracker.setReferralCode(ref);
    }
  }, [searchParams]);

  return null;
}
```

**职责：**
- 在根布局中运行，覆盖所有页面
- 自动提取 URL 中的推荐码
- 开发环境调试日志

### 4. 注册表单集成 (`/src/components/SignupForm.tsx`)

```typescript
useEffect(() => {
  const ref = searchParams.get('ref') || ReferralTracker.getReferralCode();
  if (ref) {
    setReferralCode(ref);
  }
}, [searchParams]);
```

**职责：**
- 注册时获取推荐码（URL 优先，存储备选）
- 注册成功后调用奖励 API
- 错误处理和用户反馈

## 🛡️ 安全与可靠性

### 数据验证
- 推荐码格式：8位大写字母数字组合 `^[A-Z0-9]{8}$`
- 过期时间：30天自动清除
- 重复注册检查：防止同一用户多次获得奖励

### 容错机制
```typescript
// 多层检查确保获取成功
const getReferralCodeWithFallback = () => {
  return searchParams.get('ref') ||           // URL 参数
         sessionStorage.getItem(SESSION_KEY) || // 会话存储  
         localStorage.getItem(STORAGE_KEY) ||   // 本地存储
         getCookieValue(COOKIE_KEY) ||          // Cookie
         null;
};
```

### 隐私保护
- Cookie 设置 `sameSite: 'lax'` 防止 CSRF
- 开发环境才输出调试日志
- 不存储用户敏感信息，仅存储推荐码

## 📊 用户场景支持

| 场景 | 解决方案 | 数据源 |
|------|---------|--------|
| 直接注册 | URL 参数 → 存储 | `?ref=CODE` |
| 浏览后注册 | 从存储获取 | localStorage/sessionStorage |
| 跨页面访问 | Cookie 同步 | Cookie |
| 页面刷新 | 持久化存储 | localStorage |
| 新标签页 | Cookie 传递 | Cookie |
| 清除浏览数据 | 自动失效 | 30天过期 |

## 🚀 部署清单

### 文件创建/修改
- ✅ `/src/utils/referral-tracker.ts` - 核心追踪逻辑
- ✅ `/src/components/ReferralTracker.tsx` - 全局组件  
- ✅ `/src/hooks/useReferralTracker.ts` - React Hook
- ✅ `/src/middleware.ts` - 服务端中间件（修改）
- ✅ `/src/components/SignupForm.tsx` - 注册表单（修改）
- ✅ `/src/app/[locale]/layout.tsx` - 根布局（修改）
- ✅ `/src/app/api/free-credits/referral/route.ts` - API路由（修改）

### 环境配置
```bash
# 无需额外环境变量
# 使用现有的 NODE_ENV 和 NEXT_PUBLIC_* 配置
```

### 测试场景
1. **基础功能：** `https://www.aiasmr.vip?ref=TESTCODE` → 注册 → 检查奖励
2. **跨页面：** 首页 → 浏览其他页面 → 注册页面 → 检查推荐码
3. **持久化：** 刷新页面 → 新标签页 → 检查推荐码
4. **过期处理：** 修改过期时间 → 检查自动清除

## 📈 性能优化

- **懒加载：** ReferralTracker 仅在需要时执行
- **缓存策略：** sessionStorage 作为最高优先级缓存
- **最小化：** Cookie 仅存储8字符推荐码，占用最小空间
- **异步处理：** 推荐奖励 API 调用不影响注册流程

## 🔄 向后兼容

现有的 `/auth/signup?ref=CODE` 链接仍然有效：
- Middleware 在任何路径下都会处理 `ref` 参数
- SignupForm 优先检查 URL 参数
- 渐进式迁移，无需立即更新所有链接

这个架构确保了从首页访问到完成注册的整个流程中推荐码的可靠传递和持久化。