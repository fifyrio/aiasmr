import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './config';

export default getRequestConfig(async ({locale}) => {
  // Handle undefined locale by using default
  const normalizedLocale = locale || defaultLocale;
  
  // Validate the normalized locale
  if (!locales.includes(normalizedLocale as any)) {
    notFound();
  }

  try {
    // Use dynamic import with proper error handling
    const messages = (await import(`../../messages/${normalizedLocale}.json`)).default;
    
    return {
      messages,
      locale: normalizedLocale as string
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${normalizedLocale}`, error);
    notFound();
  }
});