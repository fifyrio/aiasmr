import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/my-videos/',
        '/admin/',
      ],
    },
    sitemap: 'https://aiasmr.so/sitemap.xml',
  }
} 