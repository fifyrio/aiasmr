import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // 默认语言不显示前缀，其他语言显示
  localeDetection: false // 禁用自动语言检测，始终使用默认语言
});

export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const referralCode = searchParams.get('ref');
  
  // Handle referral code persistence first
  const response = intlMiddleware(request);
  
  if (referralCode && /^[A-Z0-9]{8}$/.test(referralCode)) {
    // Set secure cookie for referral code (30 days)
    response.cookies.set('aiasmr_ref', referralCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Allow cross-site requests (for referral sharing)
      httpOnly: false // Allow client-side access for localStorage sync
    });

    // Optional: Log referral tracking (for analytics/debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Referral code stored: ${referralCode} for ${pathname}`);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',
  ]
};