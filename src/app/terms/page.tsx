'use client'

import React, { useEffect } from 'react'
import AOS from 'aos'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const TermsPage = () => {
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
              Terms of <span className="text-yellow-300">Service</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Please read these terms carefully before using our AI-powered ASMR video generation platform.
            </p>
          </div>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            
            <div data-aos="fade-up" className="mb-8">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> February 27, 2025
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Welcome to AIASMR Video. These Terms of Service ("Terms") govern your use of our AI-powered ASMR video generation platform. By accessing or using our service, you agree to be bound by these Terms.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700">
                By creating an account or using our service, you confirm that you are at least 18 years old and have the legal capacity to enter into these Terms. If you do not agree with any part of these Terms, you must not use our service.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 mb-4">
                AIASMR Video provides AI-powered video generation services that create ASMR content based on your text prompts, images, or reference materials. Our service includes:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <i className="ri-play-circle-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>AI-generated ASMR videos with various triggers and effects</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-hd-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>High-quality video output up to 4K resolution for paid users</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-headphone-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Binaural audio effects and whisper synchronization</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-cloud-line text-purple-500 mr-3 mt-1 text-lg"></i>
                  <span>Cloud-based storage and content management</span>
                </li>
              </ul>
            </div>

            <div data-aos="fade-up" data-aos-delay="300" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts and Credits</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Registration</h3>
                  <p>You must provide accurate and complete information when creating your account. You are responsible for maintaining the security of your account credentials.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Credit System</h3>
                  <p>Our service operates on a credit-based system. Credits are consumed when generating videos. Unused credits may roll over to the next billing cycle for paid plans.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Subscription Plans</h3>
                  <p>Paid subscriptions automatically renew until cancelled. You may cancel your subscription at any time through your account settings.</p>
                </div>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="400" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Restrictions</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use our service for:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <i className="ri-close-circle-line text-red-500 mr-3 mt-1 text-lg"></i>
                  <span>Creating illegal, harmful, or offensive content</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-close-circle-line text-red-500 mr-3 mt-1 text-lg"></i>
                  <span>Violating intellectual property rights of others</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-close-circle-line text-red-500 mr-3 mt-1 text-lg"></i>
                  <span>Attempting to reverse engineer our AI models</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-close-circle-line text-red-500 mr-3 mt-1 text-lg"></i>
                  <span>Sharing account credentials with third parties</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-close-circle-line text-red-500 mr-3 mt-1 text-lg"></i>
                  <span>Commercial use without a paid subscription</span>
                </li>
              </ul>
            </div>

            <div data-aos="fade-up" data-aos-delay="500" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Content</h3>
                  <p>You retain ownership of the prompts and materials you provide. You grant us a license to use your inputs to generate videos and improve our service.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Generated Content</h3>
                  <p>You own the videos generated through our service, subject to our terms. Commercial use rights are available only to paid subscribers.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Our Platform</h3>
                  <p>All rights in our platform, AI models, and technology remain our exclusive property.</p>
                </div>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="600" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment and Refunds</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Billing</h3>
                  <p>Subscription fees are billed in advance on a monthly basis. All prices are in USD and subject to applicable taxes.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Refund Policy</h3>
                  <p>We offer a 7-day satisfaction guarantee for new subscriptions. Refund requests must be submitted within 7 days of initial purchase.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Failed Generations</h3>
                  <p>Credits are not deducted for failed video generations due to technical issues on our end.</p>
                </div>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="700" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability</h2>
              <p className="text-gray-700">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. We may perform maintenance, updates, or experience technical issues that temporarily affect service availability. Average generation time is 1-2 minutes, extending up to 4 minutes during peak usage.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="800" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700">
                Our liability is limited to the amount you paid for the service in the 12 months preceding any claim. We are not liable for indirect, incidental, or consequential damages arising from your use of our service.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="900" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account for violations of these Terms. You may terminate your account at any time. Upon termination, your access to generated content may be revoked after a reasonable grace period.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="1000" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. Material changes will be communicated via email or platform notification. Continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="1100" className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
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

export default TermsPage