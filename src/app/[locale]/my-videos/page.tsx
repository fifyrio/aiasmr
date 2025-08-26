'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import MyVideosContent from '@/components/MyVideosContent'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import AOS from 'aos'

export default function MyVideos() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('myVideos')
  const tNav = useTranslations('nav')

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="min-h-screen hero-bg">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen hero-bg">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up">
            <div className="mb-8">
              <nav className="text-sm text-white/70 mb-4">
                <span>{tNav('home')}</span> <span className="mx-2">/</span> <span className="text-white font-medium">{tNav('myVideos')}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {t('header.title')}
              </h1>
              <p className="text-white/80 text-lg">
                {t('header.description')}
              </p>
            </div>
          </div>
          
          <MyVideosContent />
        </div>
      </div>
      <Footer />
    </main>
  )
}