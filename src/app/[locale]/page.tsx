import React from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import FeaturedVideos from '@/components/FeaturedVideos'
import Footer from '@/components/Footer'
import { getSiteStats } from '@/lib/data'
import { getTranslations } from 'next-intl/server'

// ISR配置：每小时重新生成页面
export const revalidate = 3600
export const dynamic = 'force-static'

// SEO元数据
export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'hero' })
  
  return {
    title: t('title') + ' - AIASMR Video',
    description: t('subtitle'),
    keywords: 'ASMR videos, AI video generation, text to video, ASMR creation, relaxation videos, sleep sounds',
    alternates: {
      canonical: `https://www.aiasmr.vip/${locale}`,
      languages: {
        'en': 'https://www.aiasmr.vip/en',
        'zh': 'https://www.aiasmr.vip/zh',
      }
    },
    openGraph: {
      title: t('title') + ' - AIASMR Video',
      description: t('subtitle'),
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: `https://www.aiasmr.vip/${locale}`,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: t('title')
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') + ' - AIASMR Video',
      description: t('subtitle'),
      images: ['/og-image.jpg']
    }
  }
}

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // 临时简化：使用默认统计数据避免数据库调用超时
  const siteStats = {
    totalVideos: 1250,
    totalUsers: 850,
    totalViews: 45000,
    error: null
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero siteStats={siteStats} />
      <FeaturedVideos />
      <Footer />
    </main>
  )
}
