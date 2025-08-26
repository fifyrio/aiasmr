import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Videos - AIASMR Video | Manage Your AI-Generated Content',
  description: 'Access and manage your AI-generated ASMR videos. Download, share, and organize your personal collection of relaxing content.',
  keywords: 'my videos, ASMR video management, download videos, personal content, AI-generated videos',
  alternates: {
    canonical: 'https://www.aiasmr.vip/my-videos',
  },
  openGraph: {
    title: 'My Videos - AIASMR Video',
    description: 'Access and manage your AI-generated ASMR videos. Download, share, and organize your personal collection.',
    type: 'website',
    url: 'https://www.aiasmr.vip/my-videos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Videos - AIASMR Video',
    description: 'Access and manage your AI-generated ASMR videos. Download, share, and organize your personal collection.',
  }
}

export default function MyVideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 