import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VEO3 ASMR Video Generator - Premium AI by Google | AIASMR Video',
  description: 'Create premium ASMR videos with Google VEO3 AI model. Experience the highest quality video generation with advanced neural networks for realistic, immersive ASMR content.',
  keywords: 'VEO3, Google VEO3, VEO3 ASMR, premium AI video generator, Google AI video, VEO3 model, high-quality ASMR generator, advanced video AI, neural network video, realistic ASMR videos, premium video generation, Google video AI',
  alternates: {
    canonical: 'https://www.aiasmr.vip/veo3',
  },
  openGraph: {
    title: 'VEO3 ASMR Video Generator - Premium AI by Google',
    description: 'Create premium ASMR videos with Google VEO3 AI model. Experience the highest quality video generation for realistic, immersive ASMR content.',
    type: 'website',
    url: 'https://www.aiasmr.vip/veo3',
    images: [
      {
        url: '/images/veo3-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VEO3 ASMR Video Generator - Premium Quality AI Videos',
      }
    ],
    locale: 'en_US',
    siteName: 'AIASMR Video',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aiasmrvideo',
    title: 'VEO3 ASMR Video Generator - Premium AI by Google',
    description: 'Create premium ASMR videos with Google VEO3 AI model. Experience the highest quality video generation for realistic, immersive ASMR content.',
    images: ['/images/veo3-twitter-card.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'AI Video Generation',
  classification: 'ASMR Content Creation',
  other: {
    'google-site-verification': 'your-verification-code',
  },
}

export default function VEO3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}