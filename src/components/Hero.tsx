'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import AOS from 'aos'

interface SiteStats {
  totalVideos: number
  totalUsers: number
  totalViews: number
  error: string | null
}

interface HeroProps {
  siteStats?: SiteStats
}

// 本地格式化数字函数
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const Hero: React.FC<HeroProps> = ({ siteStats }) => {
  const t = useTranslations('hero')
  const params = useParams()
  const locale = params.locale as string

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  return (
    <section className="hero-bg min-h-screen flex items-center justify-center relative overflow-hidden pt-32">
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Purple particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-purple-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-purple-500 rounded-full opacity-50 animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-purple-400 rounded-full opacity-30 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div data-aos="fade-up" data-aos-delay="200">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            {t('title')}
          </h1>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="400">
          <p className="text-xl md:text-2xl text-purple-100/90 mb-8 max-w-3xl mx-auto drop-shadow-sm">
            {t('subtitle')}
          </p>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="600" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={`/${locale}/create`} className="btn-primary text-lg px-10 py-4 hover:scale-110 transition-transform inline-flex items-center">
            <i className="ri-play-circle-line mr-2"></i>
            {t('ctaCreate')}
          </Link>
          <Link href={`/${locale}/explore`} className="btn-secondary text-lg px-10 py-4 bg-purple-600/10 border-purple-400/30 text-purple-100 hover:bg-purple-600/20 backdrop-blur-sm inline-flex items-center">
            <i className="ri-search-line mr-2"></i>
            {t('ctaExplore')}
          </Link>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="700" className="mt-12 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            {t('whyChooseTitle')}
          </h2>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="800" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 text-white border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="text-3xl mb-2 text-purple-300">
              <i className="ri-magic-line"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-purple-100">{t('features.aiPowered.title')}</h3>
            <p className="text-purple-200/80">{t('features.aiPowered.description')}</p>
          </div>
          
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 text-white border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="text-3xl mb-2 text-purple-300">
              <i className="ri-hd-line"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-purple-100">{t('features.highQuality.title')}</h3>
            <p className="text-purple-200/80">{t('features.highQuality.description')}</p>
          </div>
          
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 text-white border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="text-3xl mb-2 text-purple-300">
              <i className="ri-time-line"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-purple-100">{t('features.fastGeneration.title')}</h3>
            <p className="text-purple-200/80">{t('features.fastGeneration.description')}</p>
          </div>
        </div>
        
        {/* 动态统计数据 */}
        {siteStats && !siteStats.error && (
          <div data-aos="fade-up" data-aos-delay="1000" className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              {t('communityTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2 drop-shadow-lg">
                  {formatNumber(siteStats.totalVideos)}+
                </div>
                <p className="text-purple-100/80 text-sm">{t('stats.videosGenerated')}</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2 drop-shadow-lg">
                  {formatNumber(siteStats.totalUsers)}+
                </div>
                <p className="text-purple-100/80 text-sm">{t('stats.activeCreators')}</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2 drop-shadow-lg">
                  {formatNumber(siteStats.totalViews)}+
                </div>
                <p className="text-purple-100/80 text-sm">{t('stats.totalViews')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-purple-300/70 animate-bounce">
        <i className="ri-arrow-down-line text-2xl"></i>
      </div>
    </section>
  )
}

export default Hero