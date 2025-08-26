import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore ASMR Videos - AIASMR Video | AI-Generated Content Gallery',
  description: 'Discover and explore amazing AI-generated ASMR videos. Browse our collection of relaxing, high-quality content created with advanced AI technology.',
  keywords: 'ASMR videos, AI video gallery, explore ASMR, video showcase, AI-generated content',
  alternates: {
    canonical: 'https://www.aiasmr.vip/explore',
  },
  openGraph: {
    title: 'Explore ASMR Videos - AIASMR Video',
    description: 'Discover and explore amazing AI-generated ASMR videos. Browse our collection of relaxing, high-quality content.',
    type: 'website',
    url: 'https://www.aiasmr.vip/explore',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore ASMR Videos - AIASMR Video',
    description: 'Discover and explore amazing AI-generated ASMR videos. Browse our collection of relaxing, high-quality content.',
  }
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 