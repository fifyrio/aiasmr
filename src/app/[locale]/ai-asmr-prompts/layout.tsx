import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '30+ AI ASMR Video Prompt Examples and Generation Techniques',
  description: 'Explore tested ASMR video prompts and master the art of creating compelling inputs, optimizing visual aesthetics, and producing premium AI ASMR content.',
  keywords: 'AI ASMR prompts, ASMR video generator, ASMR templates, soap cutting ASMR, ice crushing ASMR, AI video creation, ASMR content creation, relaxing videos, trigger sounds',
  openGraph: {
    title: '30+ AI ASMR Video Prompt Examples and Generation Techniques',
    description: 'Explore tested ASMR video prompts and master the art of creating compelling inputs, optimizing visual aesthetics, and producing premium AI ASMR content.',
    type: 'website',
    siteName: 'AIASMR Video',
  },
  twitter: {
    card: 'summary_large_image',
    title: '30+ AI ASMR Video Prompt Examples and Generation Techniques',
    description: 'Explore tested ASMR video prompts and master creating compelling inputs for premium AI ASMR content.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AIASMRPromptsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}