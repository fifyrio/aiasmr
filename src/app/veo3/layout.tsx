import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VEO3 ASMR Generator - Google AI Video | AIASMR Video',
  description: 'Generate premium ASMR videos with Google VEO3 AI. High-quality video creation from text prompts using advanced neural networks.',
  keywords: 'VEO3, Google VEO3, VEO3 ASMR, AI video generator, Google AI, VEO3 model, ASMR generator, premium video',
  alternates: {
    canonical: 'https://www.aiasmr.vip/veo3',
  },
  openGraph: {
    title: 'VEO3 ASMR Generator - Google AI Video',
    description: 'Generate premium ASMR videos with Google VEO3 AI. High-quality video creation from text prompts.',
    type: 'website',
    url: 'https://www.aiasmr.vip/veo3',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VEO3 ASMR Generator - Google AI Video',
    description: 'Generate premium ASMR videos with Google VEO3 AI. High-quality video creation from text prompts.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function VEO3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}