import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AuthProvider } from '@/contexts/AuthContext'
import Script from 'next/script'
import { GA_TRACKING_ID } from '@/lib/analytics'

const inter = Inter({ subsets: ['latin'] })

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
        <AuthProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  )
}