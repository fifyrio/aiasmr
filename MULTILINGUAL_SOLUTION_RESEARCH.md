# 多语言解决方案研究报告

## 项目概述

AIASMR Video 是一个基于 Next.js 14.0.1 的 AI ASMR 视频生成平台，当前只支持英文。本报告研究适合该项目的国际化(i18n)解决方案，重点关注中英双语支持。

## 技术栈分析

### 当前技术栈
- **框架**: Next.js 14.0.1 (App Router)
- **语言**: TypeScript 5.2.2
- **样式**: Tailwind CSS 3.3.5
- **状态管理**: React Context
- **数据库**: Supabase PostgreSQL
- **部署**: Vercel

### 页面结构分析
当前平台包含以下主要页面类型：
1. **公共页面**: 首页、定价、FAQ、隐私政策、条款
2. **功能页面**: 创建视频、探索页面、AI 提示词库
3. **用户页面**: 登录、注册、我的视频、用户账户
4. **内容页面**: 博客、产品页面(VEO3)

## 多语言方案对比

### 1. next-intl (推荐方案)

**优势:**
- ✅ 专为 Next.js App Router 优化
- ✅ 原生 TypeScript 支持，提供编译时类型检查
- ✅ 性能优化，支持服务端渲染
- ✅ 支持动态路由 (`/en/create`, `/zh/create`)
- ✅ 内置时间、数字、货币格式化
- ✅ 支持 ICU 消息格式，处理复数形式
- ✅ 轻量级，bundle 大小较小
- ✅ 配置简单，学习曲线平缓

**劣势:**
- ❌ 生态系统相对较小
- ❌ 插件扩展性有限

### 2. next-i18next

**优势:**
- ✅ 功能丰富，扩展性强
- ✅ 基于成熟的 i18next 生态
- ✅ 支持命名空间(namespaces)
- ✅ 插件生态丰富

**劣势:**
- ❌ 配置复杂，学习曲线陡峭
- ❌ 主要为 Pages Router 设计
- ❌ Bundle 大小较大 (~22KB)
- ❌ App Router 支持不完整

### 3. react-i18next

**优势:**
- ✅ 最成熟的 React i18n 解决方案
- ✅ 丰富的生态系统和插件
- ✅ 社区活跃，文档完善
- ✅ 灵活的集成方式

**劣势:**
- ❌ Next.js 集成需要额外配置
- ❌ 缺乏内置路由国际化
- ❌ 需要更多手动配置

## 推荐方案: next-intl

基于项目需求和技术栈分析，推荐使用 **next-intl** 作为多语言解决方案。

### 选择理由

1. **技术匹配度高**: 专为 Next.js 14 App Router 设计
2. **开发效率**: 配置简单，开发体验好
3. **性能优越**: 服务端渲染支持，首屏加载快
4. **类型安全**: 完整的 TypeScript 支持
5. **SEO 友好**: 支持动态路由和元数据国际化
6. **轻量级**: 对 bundle 大小影响小

## 实施方案

### 1. 项目结构设计

```
src/
├── i18n/
│   ├── config.ts           # i18n 配置文件
│   └── request.ts          # 服务端请求配置
├── messages/               # 翻译文件
│   ├── en.json            # 英文翻译
│   └── zh.json            # 中文翻译
├── app/
│   └── [locale]/          # 动态语言路由
│       ├── layout.tsx     # 布局文件
│       ├── page.tsx       # 首页
│       ├── create/        # 创建页面
│       ├── pricing/       # 定价页面
│       └── ...           # 其他页面
```

### 2. 路由策略

采用 **子路径路由** 策略：
- 英文: `https://aiasmr.vip/en/create`
- 中文: `https://aiasmr.vip/zh/create`
- 默认: `https://aiasmr.vip/` → 根据浏览器语言自动重定向

### 3. 翻译内容分类

#### A. 用户界面翻译
- 导航菜单
- 按钮和表单
- 状态消息
- 错误提示

#### B. 内容翻译
- 页面标题和描述
- 产品介绍
- FAQ 内容
- 博客文章

#### C. SEO 元数据
- Meta 标题和描述
- Open Graph 标签
- 结构化数据

### 4. 数据库设计调整

为支持多语言内容，需要扩展数据库结构：

```sql
-- 多语言内容表
CREATE TABLE content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'faq', 'blog', 'product'
  content_id UUID NOT NULL,
  locale TEXT NOT NULL,       -- 'en', 'zh'
  title TEXT,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(content_type, content_id, locale)
);

-- FAQ 多语言支持
CREATE TABLE faq_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id UUID NOT NULL,
  locale TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  UNIQUE(faq_id, locale)
);
```

### 5. 实施步骤

#### 阶段1: 基础设置 (1-2天)
1. 安装和配置 next-intl
2. 设置项目结构和路由
3. 创建基础翻译文件
4. 配置 TypeScript 类型安全

#### 阶段2: 核心页面翻译 (3-4天)
1. 导航组件国际化
2. 首页、定价页面翻译
3. 用户认证流程翻译
4. 错误和状态消息翻译

#### 阶段3: 功能页面翻译 (3-4天)
1. 视频创建页面
2. 我的视频页面
3. 用户账户页面
4. 支付流程翻译

#### 阶段4: 内容管理 (2-3天)
1. 数据库扩展
2. CMS 集成
3. SEO 优化
4. 性能优化

#### 阶段5: 测试和部署 (2天)
1. 功能测试
2. SEO 测试
3. 性能测试
4. 生产部署

### 6. 技术实施细节

#### 安装依赖
```bash
npm install next-intl
```

#### Next.js 配置
```javascript
// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'commondatastorage.googleapis.com', 'pub-a0da9daa5c8a415793ac89043f791f12.r2.dev'],
  },
};

module.exports = withNextIntl(nextConfig);
```

#### i18n 配置
```typescript
// src/i18n/request.ts
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'zh'];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

#### 翻译文件结构
```json
// messages/en.json
{
  "nav": {
    "create": "Create",
    "explore": "Explore",
    "pricing": "Pricing",
    "login": "Login"
  },
  "hero": {
    "title": "Generate ASMR Videos with AI",
    "description": "Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos."
  },
  "create": {
    "title": "Create Your ASMR Video",
    "prompt": "Enter your video prompt",
    "generate": "Generate Video"
  }
}
```

### 7. SEO 优化策略

#### 多语言 Sitemap
```typescript
// src/app/sitemap.ts
import { locales } from '@/i18n/config';

export default function sitemap() {
  const routes = ['', '/create', '/pricing', '/faq'];
  const urls = [];

  locales.forEach(locale => {
    routes.forEach(route => {
      urls.push({
        url: `https://aiasmr.vip/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return urls;
}
```

#### hreflang 标签
```typescript
// 在每个页面的 metadata 中添加
export async function generateMetadata({ params: { locale } }) {
  return {
    alternates: {
      canonical: `https://aiasmr.vip/${locale}`,
      languages: {
        'en': 'https://aiasmr.vip/en',
        'zh': 'https://aiasmr.vip/zh',
      }
    }
  };
}
```

### 8. 性能优化

#### 翻译文件分割
```typescript
// 按页面分割翻译文件
// messages/en/common.json - 公共翻译
// messages/en/create.json - 创建页面翻译
// messages/en/pricing.json - 定价页面翻译
```

#### 动态导入
```typescript
// 动态加载大型翻译文件
const messages = await import(`../../../messages/${locale}/${namespace}.json`);
```

### 9. 开发体验优化

#### TypeScript 类型安全
```typescript
// types/i18n.ts
import en from '../messages/en.json';

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}
```

#### 开发工具集成
- ESLint 规则检查翻译键
- 翻译文件自动检查和验证
- 缺失翻译键的警告

### 10. 项目特定考虑

#### ASMR 专业术语
- 需要专门的 ASMR 术语词典
- 中文 ASMR 社区常用词汇
- 触发词(triggers)的准确翻译

#### 视频生成参数
- 提示词模板的双语版本
- 视频质量描述的本地化
- 错误消息的用户友好翻译

#### 支付流程
- 货币显示本地化
- 支付方式的地区差异
- 税务信息的本地化

### 11. 维护和扩展

#### 翻译工作流
1. 开发时使用占位符
2. 定期提取需要翻译的文本
3. 专业翻译服务或工具
4. 翻译质量审核

#### 未来扩展
- 支持更多语言(日语、韩语等)
- CMS 集成，支持非技术人员更新翻译
- 自动翻译 API 集成(谷歌翻译等)

## 总结

采用 next-intl 作为多语言解决方案可以为 AIASMR Video 项目提供：

1. **技术优势**: 与现有技术栈完美集成
2. **开发效率**: 简化的配置和开发流程  
3. **用户体验**: 流畅的多语言切换和本地化体验
4. **SEO 效果**: 完整的搜索引擎优化支持
5. **可维护性**: 清晰的代码结构和类型安全

预计整个实施过程需要 10-15 个工作日，可以分阶段进行，最小化对现有功能的影响。

## 预算估算

- 开发成本: 10-15 工作日
- 翻译成本: 专业翻译服务约 $500-1000
- 维护成本: 每月约 2-4 小时

## 风险评估

**低风险:**
- next-intl 配置和基础功能
- 静态内容翻译

**中风险:**  
- 动态内容翻译
- SEO 影响评估

**高风险:**
- 数据库迁移
- 支付流程本地化

建议采用渐进式实施策略，先完成核心功能的国际化，再逐步扩展到完整的多语言支持。