# AIASMR 多语言与架构快速上手手册

## 1. 项目架构速览
- **前端**：Next.js 14 App Router 位于 `src/`。页面按照 `src/app/[locale]/(route)/page.tsx` 划分语言维度；共享 UI 在 `src/components/`，上下文与 hooks 分别放在 `src/contexts/`、`src/hooks/`。
- **国际化资源**：语言配置位于 `src/i18n/`，翻译文案存放在根目录 `messages/*.json` 中（例如 `messages/zh.json`）。
- **运行支撑**：音频/视频脚本在 `scripts/`，公共样式在 `src/styles/`，静态资源在 `public/` 与 `sample_videos/`。`backend-api/` 是独立的 Express 服务，用于 AI 生成、账户与积分管理。
- **数据库/配置**：Supabase 相关 SQL 模板在 `database/`；共享类型、工具函数分别位于 `src/types/` 与 `src/utils/`。

## 2. 多语言核心链路
1. **语言配置**：`src/i18n/config.ts` 声明 `locales`、`defaultLocale`，当前支持 `en/zh/de/fr`。
2. **消息加载**：`src/i18n/request.ts` 使用 `getRequestConfig` 动态加载 `messages/<locale>.json` 并校验合法语言。
3. **路由与中间件**：`src/middleware.ts` 通过 `next-intl/middleware` 处理语言前缀（`/en`, `/zh`），并保留默认语言无前缀，同时复用中间件存储返利 cookie。
4. **布局注入**：`src/app/[locale]/layout.tsx` 校验 `params.locale`，调用 `getMessages` 并把翻译注入 `NextIntlClientProvider`，也是全局 Provider（Auth、Credits、Analytics）的挂载点。
5. **翻译调用**：客户端组件使用 `useTranslations('namespace')`，服务端组件/页面使用 `getTranslations({locale})`。`src/lib/i18n.ts` 暴露 `useAppTranslations()` 便于同时访问多个命名空间。

## 3. 常见操作指南
### 3.1 新增语言
1. 在 `src/i18n/config.ts` 的 `locales` 数组追加语言代码。
2. 在 `messages/` 下复制一个新的 `<locale>.json`，可根据现有键值结构翻译。
3. （可选）在 `public/locales/` 或 SEO 设置中补充该语言资源，如 sitemap、`metadata.alternates`。
4. 运行 `npm run dev` 并访问 `http://localhost:3000/<locale>` 验证。

### 3.2 添加翻译 key
1. 在 `messages/en.json` 里新增键值，例如：
   ```json
   {
     "create": {
       "cta": "Generate your ASMR video"
     }
   }
   ```
2. 在其他语言文件中保持相同层级结构。
3. 在组件中引用：
   ```tsx
   import {useTranslations} from 'next-intl';
   const CreateCTA = () => {
     const t = useTranslations('create');
     return <Button>{t('cta')}</Button>;
   };
   ```
   服务端页面可使用 `const t = await getTranslations({locale, namespace: 'create'});`.

### 3.3 复用命名空间
针对常用命名空间（`common`, `nav`, `hero` 等），通过 `useAppTranslations()` 一次性获取：
```tsx
const {nav, hero} = useAppTranslations();
return <Nav label={nav('home')} heroTitle={hero('title')} />;
```

## 4. 本地运行与调试
- 根目录：`npm install && npm run dev`，默认监听 `3000`，英文首页路径 `/`，其他语言通过 `/zh`、`/de` 等访问。
- 后端：`cd backend-api && npm install && npm run dev`，提供生成任务、积分、鉴权接口，可在 `.env` 中配置 Supabase、KIE、Cloudflare R2。
- 快速切换语言：浏览器直接切换路径或在组件中拼接 `/${locale}/${route}`；intl 中间件禁用了自动检测，所有 locale 取决于 URL。

## 5. 质量校验清单
1. **文案一致**：新增 key 后对照 `messages/en.json` 与目标语言，保持键路径完全一致。
2. **构建检查**：运行 `npm run lint`，确保没有 `useTranslations` 未使用的 key 或拼写错误；编译期会在找不到消息时抛错。
3. **功能自测**：对所有核心路由（首页、/create、/pricing、/auth/* 等）在每种语言至少点进一次，确认导航、表单、Toast 展示正确。
4. **回归脚本**：若改动涉及生成流程，执行 `npm run test:veo2` 以及 `backend-api/node test-video-generation.js`，避免多语言改动引入副作用。

掌握以上流程即可快速定位语言资源、扩展翻译范围，并理解前后端协同结构，方便在多语言上下文中实现新功能或排查问题。
