import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create ASMR Video - AIASMR Video | AI Video Generator',
  description: 'Create stunning ASMR videos with AI technology. Generate high-quality, relaxing content from text prompts with our advanced AI video generator.',
  keywords: 'ASMR video creator, AI video generator, create ASMR, video generation, AI content creation',
  alternates: {
    canonical: 'https://aiasmr.so/create',
  },
  openGraph: {
    title: 'Create ASMR Video - AIASMR Video',
    description: 'Create stunning ASMR videos with AI technology. Generate high-quality, relaxing content from text prompts.',
    type: 'website',
    url: 'https://aiasmr.so/create',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create ASMR Video - AIASMR Video',
    description: 'Create stunning ASMR videos with AI technology. Generate high-quality, relaxing content from text prompts.',
  }
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 