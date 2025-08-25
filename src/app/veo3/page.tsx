import { Metadata } from 'next';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import VEO3Client from '@/components/VEO3Client';
import asmrTemplates from '@/data/asmr_templates.json';

// Static metadata for SEO optimization
export const metadata: Metadata = {
  title: 'VEO3 AI Video Generator | Premium ASMR Content Creation | AIASMR',
  description: 'Create high-quality ASMR videos with Google\'s VEO3 AI model. Generate professional 720p-1080p videos from text prompts with advanced neural technology.',
  keywords: [
    'VEO3 AI video generator',
    'ASMR video creation',
    'Google VEO3 model',
    'AI video generation',
    'professional ASMR content',
    'text to video AI',
    'video synthesis',
    'neural video generation',
    '720p 1080p video',
    'commercial video license'
  ],
  authors: [{ name: 'AIASMR Team' }],
  creator: 'AIASMR',
  publisher: 'AIASMR',
  alternates: {
    canonical: 'https://www.aiasmr.vip/veo3'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.aiasmr.vip/veo3',
    title: 'VEO3 AI Video Generator - Premium ASMR Content Creation',
    description: 'Generate professional ASMR videos with Google\'s advanced VEO3 AI model. Support for 16:9 and 9:16 aspect ratios, HD quality output.',
    siteName: 'AIASMR',
    images: [
      {
        url: 'https://www.aiasmr.vip/images/veo3-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VEO3 AI Video Generator - Create Premium ASMR Videos'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aiasmr',
    creator: '@aiasmr',
    title: 'VEO3 AI Video Generator - Premium ASMR Creation',
    description: 'Generate high-quality ASMR videos with Google\'s VEO3 AI. Professional results in minutes.',
    images: ['https://www.aiasmr.vip/images/veo3-twitter-card.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  },
  category: 'Technology'
};

export default function VEO3Page() {

  // Enhanced JSON-LD Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VEO3 AI Video Generator",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "description": "Professional ASMR video generation platform powered by Google's VEO3 AI model. Create high-quality videos from text prompts with support for multiple aspect ratios and resolutions.",
    "url": "https://www.aiasmr.vip/veo3",
    "author": {
      "@type": "Organization",
      "name": "AIASMR",
      "url": "https://www.aiasmr.vip"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AIASMR",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.aiasmr.vip/images/logo.png"
      }
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "VEO3 Fast Generation",
        "description": "Rapid video generation with VEO3 Fast model",
        "price": "60",
        "priceCurrency": "CREDITS",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01"
      },
      {
        "@type": "Offer",
        "name": "VEO3 Standard Generation",
        "description": "Premium quality video generation with VEO3 Standard model",
        "price": "300",
        "priceCurrency": "CREDITS",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01"
      }
    ],
    "featureList": [
      "Text-to-video AI generation",
      "Google VEO3 model integration",
      "16:9 and 9:16 aspect ratio support",
      "720p and 1080p HD output",
      "Reference image support",
      "Custom watermark options",
      "Commercial usage rights",
      "Real-time generation progress"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "screenshot": [
      {
        "@type": "ImageObject",
        "url": "https://www.aiasmr.vip/images/veo3-screenshot-1.jpg",
        "name": "VEO3 Generator Interface"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <div className="min-h-screen hero-bg">
        <Navigation />
        
        <Suspense fallback={
          <div className="min-h-screen hero-bg flex items-center justify-center">
            <div className="text-white text-xl">Loading VEO3 Generator...</div>
          </div>
        }>
          <VEO3Client />
        </Suspense>
        
        <Footer />
      </div>
    </>
  );
}