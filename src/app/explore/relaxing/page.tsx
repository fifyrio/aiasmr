import { Metadata } from 'next';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import asmrTemplates from '@/data/asmr_templates.json';
import RelaxingExploreClient from '@/components/RelaxingExploreClient';

// Static metadata for SEO optimization
export const metadata: Metadata = {
  title: 'Relaxing ASMR Templates | Sleep & Meditation Video Creation | AIASMR',
  description: 'Discover our collection of relaxing ASMR templates designed for sleep, meditation, and stress relief. Tapping, brushing, and facial treatment scenarios.',
  keywords: [
    'relaxing ASMR templates',
    'sleep ASMR videos',
    'meditation ASMR content',
    'tapping ASMR relaxation',
    'brushing ASMR peaceful',
    'facial treatment ASMR',
    'stress relief videos',
    'calming ASMR templates'
  ],
  authors: [{ name: 'AIASMR Team' }],
  creator: 'AIASMR',
  publisher: 'AIASMR',
  alternates: {
    canonical: 'https://www.aiasmr.vip/explore/relaxing'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.aiasmr.vip/explore/relaxing',
    title: 'Relaxing ASMR Templates - Sleep & Meditation Content',
    description: 'Create peaceful ASMR videos with our relaxing templates. Perfect for sleep aids, meditation guides, and stress relief content.',
    siteName: 'AIASMR',
    images: [
      {
        url: 'https://www.aiasmr.vip/images/relaxing-asmr-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Relaxing ASMR Templates Collection'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aiasmr',
    creator: '@aiasmr',
    title: 'Relaxing ASMR Templates - Sleep & Meditation',
    description: 'Peaceful ASMR templates for creating relaxing sleep and meditation content.',
    images: ['https://www.aiasmr.vip/images/relaxing-asmr-twitter.jpg']
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
  category: 'Health & Wellness'
};

export default function RelaxingExplorePage() {
  // Filter relaxing templates on server-side
  const relaxingTemplates = asmrTemplates.filter(template =>
    template.tags.some(tag => tag.toLowerCase() === 'relaxing')
  );

  // Enhanced JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Relaxing ASMR Templates",
    "description": "Peaceful ASMR video templates designed for relaxation, sleep, and meditation",
    "url": "https://www.aiasmr.vip/explore/relaxing",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": relaxingTemplates.length,
      "itemListElement": relaxingTemplates.map((template, index) => ({
        "@type": "VideoObject",
        "position": index + 1,
        "name": template.title,
        "description": template.prompt,
        "thumbnailUrl": template.poster,
        "contentUrl": template.video,
        "duration": `PT${template.duration.replace('s', 'S')}`,
        "keywords": template.tags.join(", "),
        "genre": "ASMR",
        "interactionCount": template.downloads
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.aiasmr.vip"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Explore",
          "item": "https://www.aiasmr.vip/explore"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Relaxing ASMR",
          "item": "https://www.aiasmr.vip/explore/relaxing"
        }
      ]
    },
    "about": {
      "@type": "Thing",
      "name": "ASMR Relaxation",
      "description": "Autonomous Sensory Meridian Response content designed for relaxation and stress relief"
    }
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
            <div className="text-white text-xl">Loading Relaxing Templates...</div>
          </div>
        }>
          <RelaxingExploreClient templates={relaxingTemplates} />
        </Suspense>
        
        <Footer />
      </div>
    </>
  );
}