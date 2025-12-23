import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { CreditsProvider } from '@/contexts/CreditsContext'
import ReferralTrackerComponent from '@/components/ReferralTracker'
import Script from 'next/script'
import { GA_TRACKING_ID } from '@/lib/analytics'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aiasmr.vip'),
  title: 'AIASMR Video - Generate ASMR videos with AI in seconds',
  description: 'Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos. Generate immersive 4K looped ASMR content with our advanced AI technology.',
  keywords: 'ASMR, AI video generation, video creation, ASMR videos, AI technology',
  authors: [{ name: 'AIASMR Video Team' }],
  alternates: {
    canonical: 'https://www.aiasmr.vip',
  },
  openGraph: {
    title: 'AIASMR Video - Generate ASMR videos with AI in seconds',
    description: 'Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.aiasmr.vip',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIASMR Video - Generate ASMR videos with AI in seconds',
    description: 'Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

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

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <CreditsProvider>
              <ReferralTrackerComponent />
              {children}
            <Analytics />
            <SpeedInsights />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            </CreditsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
