import { Metadata } from 'next';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import asmrTemplates from '@/data/asmr_templates.json';
import RoleplayExploreClient from '@/components/RoleplayExploreClient';

// Static metadata for SEO optimization
export const metadata: Metadata = {
  title: 'Roleplay Collections | Professional ASMR Video Creation | AIASMR',
  description: 'Explore our collection of roleplay ASMR templates including medical exam, makeup artist, flight attendant, teacher, and more professional roleplay scenarios.',
  keywords: [
    'roleplay ASMR templates',
    'medical ASMR roleplay',
    'makeup artist ASMR',
    'flight attendant ASMR',
    'teacher ASMR roleplay',
    'professional ASMR scenarios',
    'ASMR video templates',
    'roleplay video generation'
  ],
  authors: [{ name: 'AIASMR Team' }],
  creator: 'AIASMR',
  publisher: 'AIASMR',
  alternates: {
    canonical: 'https://www.aiasmr.vip/explore/roleplay'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.aiasmr.vip/explore/roleplay',
    title: 'Roleplay Collections - Professional ASMR Scenarios',
    description: 'Browse professional roleplay ASMR templates for creating immersive video experiences. Medical, beauty, travel, and educational scenarios available.',
    siteName: 'AIASMR',
    images: [
      {
        url: 'https://www.aiasmr.vip/images/roleplay-asmr-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Roleplay ASMR Templates Collection'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aiasmr',
    creator: '@aiasmr',
    title: 'Roleplay Collections - Professional Scenarios',
    description: 'Professional roleplay ASMR templates for immersive video creation.',
    images: ['https://www.aiasmr.vip/images/roleplay-asmr-twitter.jpg']
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
  category: 'Entertainment'
};

export default function RoleplayExplorePage() {
  // Filter roleplay templates on server-side
  const roleplayTemplates = asmrTemplates.filter(template =>
    template.tags.some(tag => tag.toLowerCase() === 'roleplay')
  );

  // Enhanced JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Roleplay Collections",
    "description": "Professional roleplay ASMR video templates for creating immersive content experiences",
    "url": "https://www.aiasmr.vip/explore/roleplay",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": roleplayTemplates.length,
      "itemListElement": roleplayTemplates.map((template, index) => ({
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
          "name": "Roleplay Collections",
          "item": "https://www.aiasmr.vip/explore/roleplay"
        }
      ]
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
            <div className="text-white text-xl">Loading Roleplay Collections...</div>
          </div>
        }>
          <RoleplayExploreClient templates={roleplayTemplates} />
        </Suspense>
        
        <Footer />
      </div>
    </>
  );
}