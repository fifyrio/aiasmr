'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'

const Footer = () => {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const params = useParams()
  const locale = params.locale as string
  return (
    <footer className="bg-gray-900/95 backdrop-blur-sm text-white border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${locale}`} className="text-2xl font-bold text-white">
              AIASMR <span className="text-purple-400">Video</span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              {t('description')}
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
            <h3 className="text-lg font-semibold mb-4">{t('navigation')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/create`} className="text-purple-300 hover:text-purple-200 transition-colors">
                  {tNav('create')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/veo3`} className="text-purple-300 hover:text-purple-200 transition-colors">
                  {tNav('veo3')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/explore`} className="text-gray-400 hover:text-white transition-colors">
                  {tNav('explore')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className="text-gray-400 hover:text-white transition-colors">
                  {tNav('pricing')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-gray-400 hover:text-white transition-colors">
                  {tNav('blog')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              <i className="ri-folder-line mr-2 text-purple-400"></i>
              {t('categories')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/explore/roleplay`} className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <i className="ri-user-star-line mr-2 text-pink-400"></i>
                  {t('roleplayCollections')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/explore/relaxing`} className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <i className="ri-leaf-line mr-2 text-green-400"></i>
                  {t('relaxCollections')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('legalSupport')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-white transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-gray-400 hover:text-white transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="text-gray-400 hover:text-white transition-colors">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <a href="mailto:support@aiasmr.vip" className="text-gray-400 hover:text-white transition-colors">
                  {t('support')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('copyright')}
            </p>
            <div className="mt-4 md:mt-0">
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              {t('ageRestriction')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer