import React from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-gray-900/95 backdrop-blur-sm text-white border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white">
              AIASMR <span className="text-purple-400">Video</span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              Generate high-quality, AI-powered ASMR videos from text prompts, images, or reference videos. 
              Create immersive 4K looped ASMR content with our advanced AI technology.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                <i className="ri-twitter-line text-xl"></i>
              </a>
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                <i className="ri-facebook-line text-xl"></i>
              </a>
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                <i className="ri-youtube-line text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/create" className="text-purple-300 hover:text-purple-200 transition-colors">
                  Create
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-gray-400 hover:text-white transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@aiasmr.vip" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AIASMR Video. All rights reserved. Last updated: Feb 27, 2025
            </p>
            <div className="mt-4 md:mt-0">
              <select className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-purple-500">
                <option value="en">🇺🇸 English</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="jp">🇯🇵 日本語</option>
                <option value="kr">🇰🇷 한국어</option>
                <option value="cn">🇨🇳 中文</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Age restriction: 18+ | Regional restrictions may apply
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer