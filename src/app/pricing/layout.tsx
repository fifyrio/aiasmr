import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - AIASMR Video | Choose Your AI Video Generation Plan',
  description: 'Select the perfect pricing plan for your ASMR video generation needs. Compare features, credits, and pricing for our AI-powered video creation platform.',
  keywords: 'ASMR video pricing, AI video generation cost, subscription plans, video credits, pricing comparison',
  alternates: {
    canonical: 'https://aiasmr.so/pricing',
  },
  openGraph: {
    title: 'Pricing - AIASMR Video',
    description: 'Select the perfect pricing plan for your ASMR video generation needs. Compare features, credits, and pricing.',
    type: 'website',
    url: 'https://aiasmr.so/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - AIASMR Video',
    description: 'Select the perfect pricing plan for your ASMR video generation needs. Compare features, credits, and pricing.',
  }
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 