'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/contexts/CreditsContext'
import LanguageSwitcher from './LanguageSwitcher'

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  // Only fetch credits when user is logged in to reduce unnecessary API calls
  const { credits, loading: creditsLoading } = useCredits()
  const t = useTranslations('nav')
  const params = useParams()
  const locale = params.locale as string
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsUserDropdownOpen(false)
  }

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserDropdownOpen])

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
                <>
                  <Link 
                    href={`/${locale}/free-credits`} 
                    className="relative px-3 py-2 rounded-md text-xs font-medium transition-all duration-300 group
                               border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-purple-400/5 to-purple-500/10 
                               hover:border-purple-400/60 hover:bg-gradient-to-r hover:from-purple-500/20 hover:via-purple-400/10 hover:to-purple-500/20
                               hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105
                               text-purple-300 hover:text-purple-200"
                  >
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-600/0 via-purple-400/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center">
                      <span className="mr-1.5">🎁</span>
                      {t('freeCredits')}
                    </span>
                  </Link>
                  <Link 
                    href={`/${locale}/my-videos`} 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                  >
                    {t('myVideos')}
                  </Link>
                </>
              )}              
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Credits Display */}
                <Link 
                  href={`/${locale}/pricing`}
                  className="flex items-center space-x-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-full px-3 py-1.5 transition-colors group"
                  title={t('credits')}
                >
                  <span className="text-orange-400 font-medium text-sm">💎</span>
                  <span className="text-orange-400 text-sm font-semibold group-hover:text-orange-300">
                    {creditsLoading ? '...' : credits?.credits ?? 0}
                  </span>
                </Link>
                
                {/* User Avatar Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center space-x-2 hover:bg-gray-800 rounded-full p-1 transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-900 font-semibold text-lg">
                            {user.email?.split('@')[0] || 'User'}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                    
                    <div className="py-2">
                      <Link
                        href={`/${locale}/free-credits`}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <span className="w-5 h-5 text-purple-500 flex items-center justify-center text-lg">🎁</span>
                        <span className="text-gray-700">{t('freeCredits')}</span>
                      </Link>
                      <Link
                        href={`/${locale}/my-videos`}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">{t('myVideos')}</span>
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-gray-700">{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
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
              <>
                <Link href={`/${locale}/free-credits`} className="relative block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 group
                                                              border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-purple-400/5 to-purple-500/10 
                                                              hover:border-purple-400/60 hover:bg-gradient-to-r hover:from-purple-500/20 hover:via-purple-400/10 hover:to-purple-500/20
                                                              hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]
                                                              text-purple-300 hover:text-purple-200">
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-600/0 via-purple-400/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center">
                    <span className="mr-2">🎁</span>
                    {t('freeCredits')}
                  </span>
                </Link>
                <Link href={`/${locale}/my-videos`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700">
                  {t('myVideos')}
                </Link>
              </>
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
                  <div className="flex items-center px-3 py-2 space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-200 font-medium">
                        {user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Link
                          href={`/${locale}/pricing`}
                          className="flex items-center space-x-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-full px-2 py-0.5 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="text-blue-400 text-xs">💎</span>
                          <span className="text-blue-400 text-xs font-medium">
                            {creditsLoading ? '...' : credits?.credits ?? 0}
                          </span>
                        </Link>
                      </div>
                    </div>
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