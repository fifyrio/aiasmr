'use client'

import React, { useEffect } from 'react'
import AOS from 'aos'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const PricingPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  const plans = [
    {
      name: 'AI ASMR Trial',
      price: '$7.9',
      originalPrice: '$9.9',
      credits: 100,
      videos: 10,
      pricePerVideo: '$0.79',
      pricePerCredit: '$0.079',
      duration: '8s',
      resolution: '720p',
      commercial: false,
      features: [
        'Google Veo 3 ASMR support',
        'Max 8s video duration',
        '720p resolution',
        'Binaural audio effects',
        'ASMR trigger library',
      ],
      buttonText: 'Try AI ASMR ⚡',
      buttonColor: 'from-blue-500 to-purple-600',
      popular: false,
    },
    {
      name: 'AI ASMR Basic',
      price: '$19.9',
      originalPrice: '$24.9',
      credits: 301,
      videos: 30,
      pricePerVideo: '$0.66',
      pricePerCredit: '$0.066',
      duration: '8s',
      resolution: '720p',
      commercial: true,
      priceIncrease: true,
      features: [
        'Google Veo 3 ASMR support',
        'Max 8s video duration',
        '720p resolution',
        'Whisper & voice sync',
        'Binaural audio effects',
        'ASMR trigger library',
        'Commercial usage rights',
        'Standard processing',
        'Basic support',
        'Global availability',
      ],
      buttonText: 'Subscribe to Basic ⚡',
      buttonColor: 'from-blue-500 to-purple-600',
      popular: true,
    },
    {
      name: 'AI ASMR Pro',
      price: '$49.9',
      originalPrice: '$59.9',
      credits: 1001,
      videos: 100,
      pricePerVideo: '$0.50',
      pricePerCredit: '$0.050',
      duration: '8s',
      resolution: '1080p',
      commercial: true,
      features: [
        'All Basic features included',
        '1080p video resolution',
        'Advanced whisper sync',
        'Premium binaural audio',
        'Full ASMR trigger library',
        'Fastest processing',
        'Commercial usage rights',
        'Priority support',
        'Global availability',
      ],
      buttonText: 'Subscribe to Pro ⚡',
      buttonColor: 'from-purple-500 to-pink-600',
      popular: false,
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-bg pt-24 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" data-aos-delay="200">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your <span className="text-yellow-300">AI ASMR</span> Plan
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Select the perfect plan for your ASMR video generation needs. All plans include our advanced AI technology and premium features.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                data-aos="fade-up"
                data-aos-delay={200 + index * 100}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                  plan.popular ? 'ring-4 ring-purple-500/20' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <div className="text-left">
                        <div className="text-gray-500 line-through text-sm">{plan.originalPrice}</div>
                        {plan.name !== 'AI ASMR Trial' && <div className="text-sm text-gray-600">/month</div>}
                      </div>
                    </div>
                    
                    {plan.priceIncrease && (
                      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium mb-4">
                        ⚠️ Price increase coming soon
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-900">{plan.credits}</div>
                        <div className="text-gray-600">Credits</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-900">{plan.videos}</div>
                        <div className="text-gray-600">Videos</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-900">{plan.pricePerVideo}</div>
                        <div className="text-gray-600">per video</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-900">{plan.pricePerCredit}</div>
                        <div className="text-gray-600">per credit</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <i className="ri-check-line text-green-500 mr-3 text-lg"></i>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-center text-sm">
                        <i className={`${plan.commercial ? 'ri-check-line text-green-500' : 'ri-close-line text-red-500'} mr-3 text-lg`}></i>
                        <span className="text-gray-700">Commercial usage rights</span>
                      </li>
                    </ul>
                  </div>
                  
                  <button className={`w-full bg-gradient-to-r ${plan.buttonColor} text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing and features
            </p>
          </div>
          
          <div className="space-y-6">
            <div data-aos="fade-up" data-aos-delay="100" className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">Yes, you can change your plan at any time. Changes take effect immediately, and we&apos;ll prorate any billing adjustments.</p>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="200" className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens to unused credits?</h3>
              <p className="text-gray-600">Credits roll over to the next month for paid plans. Trial credits expire after the trial period.</p>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="300" className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600">Yes, we offer a 7-day refund policy for all subscription plans. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default PricingPage