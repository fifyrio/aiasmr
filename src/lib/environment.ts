/**
 * Environment detection utilities
 */

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get the current base URL based on environment
 */
export const getBaseUrl = (): string => {
  // Server-side
  if (typeof window === 'undefined') {
    if (isDevelopment) {
      return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }
    return process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://www.aiasmr.vip';
  }
  
  // Client-side - use current origin
  return window.location.origin;
};

/**
 * Check if running on localhost
 */
export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') {
    return isDevelopment;
  }
  
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost');
};

/**
 * Get the appropriate site URL for redirects
 */
export const getSiteUrl = (): string => {
  const baseUrl = getBaseUrl();
  
  // Ensure we have the correct protocol for localhost
  if (isLocalhost() && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    return `http://${baseUrl}`;
  }
  
  return baseUrl;
};

/**
 * Get callback URL for OAuth providers
 */
export const getCallbackUrl = (path: string = '/auth/callback'): string => {
  const siteUrl = getSiteUrl();
  return `${siteUrl}${path}`;
};

/**
 * Environment-specific configuration
 */
export const config = {
  isDevelopment,
  isProduction,
  baseUrl: getBaseUrl(),
  siteUrl: getSiteUrl(),
  callbackUrl: getCallbackUrl(),
  
  // Google OAuth URLs
  googleCallbackUrl: getCallbackUrl('/auth/callback'),
  
  // API URLs
  apiUrl: getBaseUrl(),
};