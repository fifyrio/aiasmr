# AIASMR Video - next-intl 国际化实施任务

## 项目概述

将 AIASMR Video 平台从单语言(英文)升级为中英双语支持，使用 next-intl 作为国际化解决方案。

## 总体时间预估: 10-15 工作日

---

## 阶段 1: 项目基础配置 (2-3 工作日)

### 任务 1.1: 安装和配置 next-intl
**预计时间**: 0.5 天  
**优先级**: 🔴 高

#### 子任务:
- [ ] 安装 next-intl 依赖
- [ ] 修改 `next.config.js` 配置
- [ ] 创建 i18n 配置文件
- [ ] 设置 TypeScript 类型定义

#### 具体代码:

```bash
# 安装依赖
npm install next-intl
```

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

```typescript
// src/i18n/config.ts
export const locales = ['en', 'zh'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
```

```typescript
// src/i18n/request.ts
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales} from './config';

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'UTC'
  };
});
```

#### 文件创建:
- `src/i18n/config.ts`
- `src/i18n/request.ts`
- `src/types/i18n.ts`

---

### 任务 1.2: 重构路由结构
**预计时间**: 1 天  
**优先级**: 🔴 高  
**依赖**: 任务 1.1

#### 子任务:
- [ ] 创建 `[locale]` 动态路由目录
- [ ] 移动现有页面到新路由结构
- [ ] 更新布局文件
- [ ] 配置中间件处理语言重定向

#### 新目录结构:
```
src/app/
├── [locale]/              # 动态语言路由
│   ├── layout.tsx         # 国际化布局
│   ├── page.tsx          # 首页
│   ├── create/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── pricing/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── my-videos/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── user/
│   │   └── page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── explore/
│   │   ├── page.tsx
│   │   ├── relaxing/page.tsx
│   │   └── roleplay/page.tsx
│   ├── veo3/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── ai-asmr-prompts/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── faq/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── api/                   # API 路由保持不变
├── globals.css
├── layout.tsx            # 根布局
└── middleware.ts         # 新增中间件
```

#### 关键代码:

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // /en/page 和 /page 都指向英文
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
```

```typescript
// src/app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/i18n/config';

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

### 任务 1.3: 创建基础翻译文件
**预计时间**: 0.5 天  
**优先级**: 🔴 高  
**依赖**: 任务 1.1

#### 子任务:
- [ ] 创建翻译文件目录结构
- [ ] 定义公共翻译键
- [ ] 创建英文基础翻译
- [ ] 创建中文翻译占位符

#### 文件结构:
```
messages/
├── en.json               # 英文翻译
└── zh.json               # 中文翻译
```

#### 基础翻译结构:

```json
// messages/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close"
  },
  "nav": {
    "home": "Home",
    "create": "Create",
    "explore": "Explore",
    "pricing": "Pricing",
    "myVideos": "My Videos",
    "login": "Login",
    "signup": "Sign Up",
    "logout": "Logout",
    "account": "Account",
    "aiPrompts": "AI Prompts",
    "veo3": "VEO3",
    "blog": "Blog",
    "faq": "FAQ"
  },
  "auth": {
    "login": {
      "title": "Sign In to Your Account",
      "email": "Email Address",
      "password": "Password",
      "rememberMe": "Remember me",
      "forgotPassword": "Forgot password?",
      "noAccount": "Don't have an account?",
      "createAccount": "Create one here",
      "loginButton": "Sign In"
    },
    "signup": {
      "title": "Create Your Account",
      "email": "Email Address",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "agreeTerms": "I agree to the Terms of Service and Privacy Policy",
      "hasAccount": "Already have an account?",
      "signInHere": "Sign in here",
      "signupButton": "Create Account"
    }
  },
  "hero": {
    "title": "Generate ASMR Videos with AI in Seconds",
    "subtitle": "Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos. Generate immersive 4K looped ASMR content with advanced AI technology.",
    "ctaCreate": "Start Creating",
    "ctaExplore": "Explore Templates",
    "stats": {
      "videosGenerated": "Videos Generated",
      "happyUsers": "Happy Users",
      "minutesWatched": "Minutes Watched"
    }
  },
  "create": {
    "title": "Create Your ASMR Video",
    "prompt": {
      "label": "Video Prompt",
      "placeholder": "Describe the ASMR video you want to create..."
    },
    "triggers": {
      "label": "Select ASMR Triggers",
      "options": {
        "soap": "Soap",
        "sponge": "Sponge",
        "ice": "Ice",
        "water": "Water",
        "honey": "Honey",
        "cubes": "Cubes",
        "petals": "Petals",
        "pages": "Pages"
      }
    },
    "settings": {
      "duration": "Duration",
      "quality": "Quality",
      "aspectRatio": "Aspect Ratio"
    },
    "generate": "Generate Video",
    "credits": "Credits Required: {credits}"
  },
  "pricing": {
    "title": "Choose Your Plan",
    "subtitle": "Flexible pricing for every creator",
    "plans": {
      "free": {
        "name": "Free Plan",
        "price": "$0",
        "credits": "20 credits",
        "features": [
          "20 free credits",
          "720p video quality",
          "Basic ASMR triggers",
          "Community support"
        ]
      },
      "basic": {
        "name": "AI ASMR Basic",
        "price": "$9.99",
        "credits": "100 credits",
        "features": [
          "100 monthly credits",
          "1080p video quality",
          "All ASMR triggers",
          "Priority support",
          "Commercial usage"
        ]
      },
      "pro": {
        "name": "AI ASMR Pro",
        "price": "$29.99",
        "credits": "500 credits",
        "features": [
          "500 monthly credits",
          "4K video quality",
          "Custom triggers",
          "API access",
          "Priority processing",
          "Commercial usage"
        ]
      }
    }
  }
}
```

```json
// messages/zh.json
{
  "common": {
    "loading": "加载中...",
    "error": "发生错误",
    "success": "成功！",
    "cancel": "取消",
    "confirm": "确认",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "close": "关闭"
  },
  "nav": {
    "home": "首页",
    "create": "创建",
    "explore": "探索",
    "pricing": "定价",
    "myVideos": "我的视频",
    "login": "登录",
    "signup": "注册",
    "logout": "退出",
    "account": "账户",
    "aiPrompts": "AI提示词",
    "veo3": "VEO3",
    "blog": "博客",
    "faq": "常见问题"
  },
  "auth": {
    "login": {
      "title": "登录您的账户",
      "email": "邮箱地址",
      "password": "密码",
      "rememberMe": "记住我",
      "forgotPassword": "忘记密码？",
      "noAccount": "还没有账户？",
      "createAccount": "立即注册",
      "loginButton": "登录"
    },
    "signup": {
      "title": "创建您的账户",
      "email": "邮箱地址",
      "password": "密码",
      "confirmPassword": "确认密码",
      "agreeTerms": "我同意服务条款和隐私政策",
      "hasAccount": "已有账户？",
      "signInHere": "立即登录",
      "signupButton": "创建账户"
    }
  },
  "hero": {
    "title": "秒级生成AI ASMR视频",
    "subtitle": "通过文本提示、图像或参考视频创建高质量的AI驱动ASMR视频。使用先进的AI技术生成沉浸式4K循环ASMR内容。",
    "ctaCreate": "开始创建",
    "ctaExplore": "探索模板",
    "stats": {
      "videosGenerated": "已生成视频",
      "happyUsers": "满意用户",
      "minutesWatched": "观看时长"
    }
  },
  "create": {
    "title": "创建您的ASMR视频",
    "prompt": {
      "label": "视频提示",
      "placeholder": "描述您想要创建的ASMR视频..."
    },
    "triggers": {
      "label": "选择ASMR触发器",
      "options": {
        "soap": "肥皂",
        "sponge": "海绵",
        "ice": "冰块",
        "water": "流水",
        "honey": "蜂蜜",
        "cubes": "方块",
        "petals": "花瓣",
        "pages": "翻页"
      }
    },
    "settings": {
      "duration": "时长",
      "quality": "画质",
      "aspectRatio": "宽高比"
    },
    "generate": "生成视频",
    "credits": "需要积分：{credits}"
  },
  "pricing": {
    "title": "选择您的套餐",
    "subtitle": "灵活的定价方案，满足每个创作者",
    "plans": {
      "free": {
        "name": "免费套餐",
        "price": "￥0",
        "credits": "20积分",
        "features": [
          "20免费积分",
          "720p视频质量",
          "基础ASMR触发器",
          "社区支持"
        ]
      },
      "basic": {
        "name": "AI ASMR基础版",
        "price": "￥68",
        "credits": "100积分",
        "features": [
          "100月度积分",
          "1080p视频质量",
          "全部ASMR触发器",
          "优先支持",
          "商业使用"
        ]
      },
      "pro": {
        "name": "AI ASMR专业版",
        "price": "￥198",
        "credits": "500积分",
        "features": [
          "500月度积分",
          "4K视频质量",
          "自定义触发器",
          "API访问",
          "优先处理",
          "商业使用"
        ]
      }
    }
  }
}
```

---

### 任务 1.4: TypeScript 类型安全配置
**预计时间**: 0.5 天  
**优先级**: 🟡 中  
**依赖**: 任务 1.3

#### 子任务:
- [ ] 创建翻译键类型定义
- [ ] 配置全局类型增强
- [ ] 设置 ESLint 规则
- [ ] 创建工具函数

#### 代码实现:

```typescript
// src/types/i18n.ts
import en from '../../messages/en.json';

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}

export type TranslationKeys = keyof IntlMessages;
export type NestedTranslationKeys<T = IntlMessages> = {
  [K in keyof T]: T[K] extends string
    ? K
    : T[K] extends object
    ? `${K & string}.${NestedTranslationKeys<T[K]> & string}`
    : never;
}[keyof T];
```

```typescript
// src/lib/i18n.ts
import {useTranslations} from 'next-intl';

export function useAppTranslations() {
  return {
    t: useTranslations(),
    common: useTranslations('common'),
    nav: useTranslations('nav'),
    auth: useTranslations('auth'),
    hero: useTranslations('hero'),
    create: useTranslations('create'),
    pricing: useTranslations('pricing'),
  };
}
```

---

## 阶段 2: 核心组件国际化 (3-4 工作日)

### 任务 2.1: 导航组件国际化
**预计时间**: 0.5 天  
**优先级**: 🔴 高  
**依赖**: 阶段 1 完成

#### 子任务:
- [ ] 更新 Navigation 组件
- [ ] 添加语言切换器
- [ ] 更新路由链接
- [ ] 添加语言检测

#### 代码实现:

```typescript
// src/components/Navigation.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import LanguageSwitcher from './LanguageSwitcher'

const Navigation = ({ locale }: { locale: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const { credits, loading: creditsLoading } = useCredits()
  const t = useTranslations('nav')
  const pathname = usePathname()

  const navigation = [
    { name: t('create'), href: `/${locale}/create` },
    { name: t('aiPrompts'), href: `/${locale}/ai-asmr-prompts` },
    { name: t('veo3'), href: `/${locale}/veo3` },
    { name: t('explore'), href: `/${locale}/explore` },
    { name: t('pricing'), href: `/${locale}/pricing` },
    { name: t('blog'), href: `/${locale}/blog` },
    { name: t('faq'), href: `/${locale}/faq` }
  ]

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md fixed w-full top-0 z-50 shadow-lg border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-2xl font-bold text-white">
              AIASMR <span className="text-purple-400">Video</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            
            {user ? (
              <div className="flex items-center space-x-4">
                {!creditsLoading && (
                  <div className="flex items-center bg-orange-500/20 px-3 py-1 rounded-full">
                    <span className="text-orange-400 text-sm font-medium">
                      {credits?.credits || 0} {t('credits')}
                    </span>
                  </div>
                )}
                <Link 
                  href={`/${locale}/my-videos`}
                  className="text-gray-300 hover:text-purple-400 text-sm font-medium transition-colors"
                >
                  {t('myVideos')}
                </Link>
                <Link 
                  href={`/${locale}/user`}
                  className="text-gray-300 hover:text-purple-400 text-sm font-medium transition-colors"
                >
                  {t('account')}
                </Link>
                <button
                  onClick={signOut}
                  className="text-gray-300 hover:text-purple-400 text-sm font-medium transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href={`/${locale}/auth/login`}
                  className="text-gray-300 hover:text-purple-400 text-sm font-medium transition-colors"
                >
                  {t('login')}
                </Link>
                <Link 
                  href={`/${locale}/auth/signup`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
```

```typescript
// src/components/LanguageSwitcher.tsx
'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { locales } from '@/i18n/config'

interface LanguageSwitcherProps {
  currentLocale: string
}

const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  zh: { name: '中文', flag: '🇨🇳' }
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (locale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    // Add new locale
    const newPath = `/${locale}${pathWithoutLocale}`
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        <span>{languages[currentLocale as keyof typeof languages]?.flag}</span>
        <span>{languages[currentLocale as keyof typeof languages]?.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-gray-800 rounded-md shadow-xl z-20 border border-gray-700">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLanguage(locale)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === currentLocale
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-2">{languages[locale as keyof typeof languages]?.flag}</span>
              {languages[locale as keyof typeof languages]?.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 任务 2.2: 首页Hero组件国际化
**预计时间**: 0.5 天  
**优先级**: 🔴 高

#### 子任务:
- [ ] 更新 Hero 组件翻译
- [ ] 统计数据本地化
- [ ] CTA 按钮国际化

```typescript
// src/components/Hero.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface SiteStats {
  videosGenerated: number
  happyUsers: number
  minutesWatched: number
}

interface HeroProps {
  siteStats: SiteStats
}

const Hero: React.FC<HeroProps> = ({ siteStats }) => {
  const t = useTranslations('hero')
  const params = useParams()
  const locale = params.locale as string

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US').format(num)
  }

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen flex items-center">
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            {t('subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href={`/${locale}/create`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {t('ctaCreate')}
            </Link>
            <Link
              href={`/${locale}/explore`}
              className="border-2 border-white/20 hover:border-purple-400 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 backdrop-blur-sm"
            >
              {t('ctaExplore')}
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                {formatNumber(siteStats.videosGenerated)}+
              </div>
              <div className="text-gray-300 text-lg">
                {t('stats.videosGenerated')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                {formatNumber(siteStats.happyUsers)}+
              </div>
              <div className="text-gray-300 text-lg">
                {t('stats.happyUsers')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                {formatNumber(siteStats.minutesWatched)}+
              </div>
              <div className="text-gray-300 text-lg">
                {t('stats.minutesWatched')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
```

---

### 任务 2.3: 认证页面国际化
**预计时间**: 1 天  
**优先级**: 🔴 高

#### 子任务:
- [ ] 登录页面翻译
- [ ] 注册页面翻译
- [ ] 表单验证消息翻译
- [ ] 错误消息国际化

```typescript
// src/app/[locale]/auth/login/page.tsx
import React from 'react'
import { useTranslations } from 'next-intl'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return <LoginForm />
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const messages = (await import(`../../../../../messages/${locale}.json`)).default
  
  return {
    title: messages.auth.login.title,
    description: `${messages.auth.login.title} - AIASMR Video`
  }
}
```

```typescript
// src/components/LoginForm.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth.login')
  const tCommon = useTranslations('common')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push(`/${locale}/`)
    } catch (err: any) {
      setError(err.message || tCommon('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {t('title')}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-800 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                {t('rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? tCommon('loading') : t('loginButton')}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400">
              {t('noAccount')}{' '}
              <Link
                href={`/${locale}/auth/signup`}
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                {t('createAccount')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

### 任务 2.4: 错误和状态消息国际化
**预计时间**: 1 天  
**优先级**: 🟡 中

#### 扩展翻译文件:

```json
// 在 messages/en.json 中添加
{
  "errors": {
    "network": "Network error. Please check your connection.",
    "unauthorized": "You need to be logged in to access this page.",
    "forbidden": "You don't have permission to access this resource.",
    "notFound": "The requested resource was not found.",
    "serverError": "Internal server error. Please try again later.",
    "validationError": "Please check your input and try again.",
    "insufficientCredits": "Insufficient credits. Please upgrade your plan.",
    "videoGenerationFailed": "Video generation failed. Please try again.",
    "uploadFailed": "File upload failed. Please try again."
  },
  "success": {
    "loginSuccess": "Successfully logged in!",
    "signupSuccess": "Account created successfully!",
    "videoGenerated": "Video generated successfully!",
    "settingsSaved": "Settings saved successfully!",
    "creditsPurchased": "Credits purchased successfully!"
  },
  "validation": {
    "emailRequired": "Email is required",
    "emailInvalid": "Please enter a valid email address",
    "passwordRequired": "Password is required",
    "passwordTooShort": "Password must be at least 8 characters",
    "passwordsNotMatch": "Passwords do not match",
    "promptRequired": "Video prompt is required",
    "promptTooShort": "Prompt must be at least 10 characters",
    "promptTooLong": "Prompt must be less than 500 characters"
  }
}
```

---

## 阶段 3: 功能页面国际化 (3-4 工作日)

### 任务 3.1: 视频创建页面国际化
**预计时间**: 1.5 天  
**优先级**: 🔴 高

### 任务 3.2: 我的视频页面国际化
**预计时间**: 1 天  
**优先级**: 🔴 高

### 任务 3.3: 用户账户页面国际化
**预计时间**: 1 天  
**优先级**: 🔴 高

### 任务 3.4: 定价页面国际化
**预计时间**: 0.5 天  
**优先级**: 🔴 高

---

## 阶段 4: 内容和SEO国际化 (2-3 工作日)

### 任务 4.1: 博客系统国际化
**预计时间**: 1 天  
**优先级**: 🟡 中

### 任务 4.2: FAQ页面国际化
**预计时间**: 0.5 天  
**优先级**: 🟡 中

### 任务 4.3: SEO元数据国际化
**预计时间**: 1 天  
**优先级**: 🔴 高

#### 子任务:
- [ ] 生成多语言sitemap
- [ ] 配置hreflang标签
- [ ] 本地化结构化数据
- [ ] 更新robots.txt

---

## 阶段 5: 数据库扩展和内容管理 (2-3 工作日)

### 任务 5.1: 数据库结构扩展
**预计时间**: 1 天  
**优先级**: 🟡 中

### 任务 5.2: 动态内容翻译API
**预计时间**: 1 天  
**优先级**: 🟡 中

### 任务 5.3: 内容管理界面
**预计时间**: 1 天  
**优先级**: 🟢 低

---

## 阶段 6: 测试和优化 (2 工作日)

### 任务 6.1: 功能测试
**预计时间**: 0.5 天  
**优先级**: 🔴 高

#### 测试清单:
- [ ] 语言切换功能
- [ ] 路由重定向正确性
- [ ] 翻译完整性
- [ ] 表单验证多语言
- [ ] 错误消息显示

### 任务 6.2: SEO测试
**预计时间**: 0.5 天  
**优先级**: 🔴 高

#### 测试项目:
- [ ] hreflang标签正确性
- [ ] sitemap生成
- [ ] 元数据本地化
- [ ] 结构化数据验证

### 任务 6.3: 性能优化
**预计时间**: 0.5 天  
**优先级**: 🟡 中

### 任务 6.4: 用户体验测试
**预计时间**: 0.5 天  
**优先级**: 🟡 中

---

## 部署和发布

### 任务 7.1: 生产环境配置
**预计时间**: 0.5 天

### 任务 7.2: 分阶段发布
**预计时间**: 0.5 天

#### 发布策略:
1. **Beta测试**: 开放给部分用户测试
2. **软启动**: 默认英文，手动切换中文
3. **全量发布**: 根据地区自动检测语言

---

## 风险管控

### 高风险项目:
- 路由重构可能影响SEO排名
- 翻译质量直接影响用户体验
- 数据库迁移可能导致数据丢失

### 风险缓解措施:
- 渐进式路由迁移
- 专业翻译团队审核
- 完整的数据备份策略

### 回滚计划:
- 保留原有英文路由作为备份
- 分阶段发布，出现问题立即回滚
- 监控系统实时检测错误率

---

## 成功指标

### 技术指标:
- [ ] 翻译覆盖率 ≥ 95%
- [ ] 页面加载速度影响 < 10%
- [ ] SEO排名保持或提升
- [ ] 无严重功能性bug

### 用户指标:
- [ ] 中文用户注册率提升 ≥ 30%
- [ ] 用户满意度调查 ≥ 4.5/5
- [ ] 中文页面跳出率 < 60%
- [ ] 语言切换使用率 ≥ 20%

---

## 后续维护

### 日常维护任务:
- 新功能翻译及时跟进
- 翻译质量定期审核
- 用户反馈收集和改进
- SEO效果监控和优化

### 扩展计划:
- 添加更多语言支持
- 自动翻译集成
- 内容管理系统优化
- 多语言客户支持