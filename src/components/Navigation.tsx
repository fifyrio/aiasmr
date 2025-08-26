'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import LanguageSwitcher from './LanguageSwitcher'

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  // Only fetch credits when user is logged in to reduce unnecessary API calls
  const { credits, loading: creditsLoading } = useCredits()
  const t = useTranslations('nav')
  const params = useParams()
  const locale = params.locale as string

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md fixed w-full top-0 z-50 shadow-lg border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-2xl font-bold text-white">
              AIASMR <span className="text-purple-400">Video</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                href={`/${locale}/create`} 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
              >
                {t('create')}
              </Link>
              <Link 
                href={`/${locale}/ai-asmr-prompts`} 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
              >
                {t('aiPrompts')}
              </Link>
              <Link 
                href={`/${locale}/veo3`} 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
              >
                {t('veo3')}
              </Link>
              <Link 
                href={`/${locale}/explore`} 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
              >
                {t('explore')}
              </Link>
              <Link 
                href={`/${locale}/pricing`} 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
              >
                {t('pricing')}
              </Link>
              {user && (
                <Link 
                  href={`/${locale}/my-videos`} 
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  {t('myVideos')}
                </Link>
              )}              
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-orange-500/20 rounded-full px-3 py-1">
                    <span className="text-orange-400 font-medium">💎</span>
                    <span className="text-orange-400 text-sm font-medium">
                      {creditsLoading ? '...' : credits?.credits ?? 0}
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Link 
                    href={`/${locale}/user`} 
                    className="text-gray-300 text-sm hover:text-purple-400 transition-colors cursor-pointer"
                  >
                    {user.email}
                  </Link>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href={`/${locale}/auth/login`}
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  {t('login')}
                </Link>
                <Link 
                  href={`/${locale}/auth/signup`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  {t('signup')}
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 border-t border-gray-700">
            <Link href={`/${locale}/create`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700">
              {t('create')}
            </Link>
            {user && (
              <Link href={`/${locale}/my-videos`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700">
                {t('myVideos')}
              </Link>
            )}
            <Link href={`/${locale}/explore`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700">
              {t('explore')}
            </Link>
            <Link href={`/${locale}/pricing`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700">
              {t('pricing')}
            </Link>
            <Link href={`/${locale}/ai-asmr-prompts`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700">
              {t('aiPrompts')}
            </Link>
            <div className="border-t border-gray-700 pt-3">
              <div className="px-3 py-2">
                <LanguageSwitcher currentLocale={locale} />
              </div>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center px-3 py-2 space-x-2">
                    <div className="flex items-center space-x-2 bg-orange-500/20 rounded-full px-3 py-1">
                      <span className="text-orange-400 font-medium">💎</span>
                      <span className="text-orange-400 text-sm font-medium">
                        {creditsLoading ? '...' : credits?.credits ?? 0}
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <Link 
                      href={`/${locale}/user`} 
                      className="text-gray-300 text-sm hover:text-purple-400 transition-colors cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user.email}
                    </Link>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    href={`/${locale}/auth/login`}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700"
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    href={`/${locale}/auth/signup`}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-purple-600 hover:bg-purple-700 text-white mt-2"
                  >
                    {t('signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation