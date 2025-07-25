'use client'

import React, { useEffect } from 'react'
import AOS from 'aos'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const PrivacyPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-bg pt-24 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" data-aos-delay="200">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Privacy <span className="text-yellow-300">Policy</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            
            <div data-aos="fade-up" className="mb-8">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> February 27, 2025
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                AIASMR Video ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered ASMR video generation platform.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <p>When you create an account, we collect your email address and any other information you voluntarily provide.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Usage Information</h3>
                  <p>We collect information about how you use our service, including prompts, generation history, and platform interactions.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Technical Information</h3>
                  <p>We automatically collect device information, IP addresses, browser type, and other technical data to improve our service.</p>
                </div>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Provide and maintain our AI video generation service</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Process payments and manage subscriptions</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Improve our AI models and platform functionality</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Send important service updates and notifications</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Ensure platform security and prevent abuse</span>
                </li>
              </ul>
            </div>

            <div data-aos="fade-up" data-aos-delay="300" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <i className="ri-arrow-right-s-line text-purple-500 mr-2 mt-1"></i>
                  <span>With service providers who help us operate our platform</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-arrow-right-s-line text-purple-500 mr-2 mt-1"></i>
                  <span>When required by law or to protect our legal rights</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-arrow-right-s-line text-purple-500 mr-2 mt-1"></i>
                  <span>In connection with a business transaction or merger</span>
                </li>
              </ul>
            </div>

            <div data-aos="fade-up" data-aos-delay="400" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data transmission is encrypted using industry-standard SSL/TLS protocols.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="500" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <i className="ri-user-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Access and update your personal information</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-delete-bin-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Request deletion of your account and data</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-download-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Export your data in a portable format</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-shield-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Withdraw consent for data processing</span>
                </li>
              </ul>
            </div>

            <div data-aos="fade-up" data-aos-delay="600" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Age Restriction</h2>
              <p className="text-gray-700">
                Our service is restricted to users who are 18 years of age or older. We do not knowingly collect personal information from individuals under 18.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="700" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="800" className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="flex items-center text-purple-600">
                <i className="ri-mail-line mr-2"></i>
                <a href="mailto:support@aiasmr.vip" className="hover:text-purple-800 transition-colors">
                  support@aiasmr.vip
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default PrivacyPage