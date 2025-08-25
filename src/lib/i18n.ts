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