import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // 默认语言不显示前缀，其他语言显示
  localeDetection: false // 禁用自动语言检测，始终使用默认语言
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};