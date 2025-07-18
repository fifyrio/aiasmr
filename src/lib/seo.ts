import type { Metadata } from 'next'

const SITE_URL = 'https://aiasmr.so'

export function generateCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${cleanPath}`
}

export function generateMetadata({
  title,
  description,
  keywords,
  path = '',
  type = 'website',
  image = '/og-image.jpg',
  publishedTime,
  authors,
}: {
  title: string
  description: string
  keywords?: string
  path?: string
  type?: 'website' | 'article'
  image?: string
  publishedTime?: string
  authors?: string[]
}): Metadata {
  const canonicalUrl = generateCanonicalUrl(path)
  
  const metadata: Metadata = {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type,
      url: canonicalUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }

  // Add article-specific metadata
  if (type === 'article' && publishedTime) {
    (metadata.openGraph as any).publishedTime = publishedTime
  }

  if (authors && authors.length > 0) {
    (metadata.openGraph as any).authors = authors
  }

  return metadata
}

// Common metadata for different page types
export const commonMetadata = {
  siteName: 'AIASMR Video',
  siteUrl: SITE_URL,
  defaultImage: '/og-image.jpg',
  defaultDescription: 'Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos. Generate immersive 4K looped ASMR content with our advanced AI technology.',
} 