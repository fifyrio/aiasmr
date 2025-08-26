export const locales = ['en', 'zh', 'de'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];