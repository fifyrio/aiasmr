import React from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import FeaturedVideos from '@/components/FeaturedVideos'
import Footer from '@/components/Footer'
import { getSiteStats } from '@/lib/data'

// ISR配置：每小时重新生成页面
export const revalidate = 3600

// SEO元数据
export const metadata = {
  title: 'AIASMR Video - Generate ASMR Videos with AI in Seconds',
  description: 'Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos. Generate immersive 4K looped ASMR content with advanced AI technology.',
  keywords: 'ASMR videos, AI video generation, text to video, ASMR creation, relaxation videos, sleep sounds',
  alternates: {
    canonical: 'https://www.aiasmr.vip',
  },
  openGraph: {
    title: 'AIASMR Video - Generate ASMR Videos with AI',
    description: 'Create high-quality, AI-powered ASMR videos from text prompts. Generate immersive 4K looped ASMR content with advanced AI technology.',
    type: 'website',
    url: 'https://www.aiasmr.vip',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AIASMR Video - AI-Generated ASMR Content'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIASMR Video - Generate ASMR Videos with AI',
    description: 'Create high-quality, AI-powered ASMR videos from text prompts. Generate immersive 4K looped ASMR content.',
    images: ['/og-image.jpg']
  }
}

export default async function Home() {
  // 服务端获取数据
  const siteStats = await getSiteStats()

  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero siteStats={siteStats} />
      <FeaturedVideos />
      <Footer />
    </main>
  )
}