'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const { credits, loading: creditsLoading } = useCredits()

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
            <Link href="/" className="text-2xl font-bold text-white">
              AIASMR <span className="text-purple-400">Video</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                href="/create" 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create
              </Link>
              {user && (
                <Link 
                  href="/my-videos" 
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Videos
                </Link>
              )}
              <Link 
                href="/explore" 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Explore
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="/blog" 
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none">
              <option value="en">🇺🇸 EN</option>
              <option value="de">🇩🇪 DE</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="it">🇮🇹 IT</option>
              <option value="jp">🇯🇵 JP</option>
              <option value="kr">🇰🇷 KR</option>
              <option value="cn">🇨🇳 CN</option>
            </select>
            
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-purple-50 rounded-full px-3 py-1">
                    <span className="text-purple-600 font-medium">💎</span>
                    <span className="text-purple-700 text-sm font-medium">
                      {creditsLoading ? '...' : credits ?? 0}
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 text-sm">{user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="btn-primary text-sm px-6 py-2"
                >
                  Get Started
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link href="/create" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
              Create
            </Link>
            {user && (
              <Link href="/my-videos" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
                My Videos
              </Link>
            )}
            <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
              Explore
            </Link>
            <Link href="/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
              Pricing
            </Link>
            <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50">
              Blog
            </Link>
            <div className="border-t pt-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center px-3 py-2 space-x-2">
                    <div className="flex items-center space-x-2 bg-purple-50 rounded-full px-3 py-1">
                      <span className="text-purple-600 font-medium">💎</span>
                      <span className="text-purple-700 text-sm font-medium">
                        {creditsLoading ? '...' : credits ?? 0}
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 text-sm">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium btn-primary mt-2"
                  >
                    Get Started
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