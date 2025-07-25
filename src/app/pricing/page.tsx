'use client'

import React, { useEffect, useState } from 'react'
import AOS from 'aos'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES, formatPrice } from '@/lib/payment/products'

const PricingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'subscriptions' | 'credits'>('subscriptions');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  const handlePurchase = async (productId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth/login?redirect=' + encodeURIComponent('/pricing');
      return;
    }

    setLoading(productId);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment page
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.error || 'Failed to create order');
      }
    } catch (error) {
      alert(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const displayPlans = planType === 'subscriptions' ? SUBSCRIPTION_PLANS : CREDIT_PACKAGES;

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
            
            {/* Plan Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
                <button
                  onClick={() => setPlanType('subscriptions')}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                    planType === 'subscriptions'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Monthly Plans
                </button>
                <button
                  onClick={() => setPlanType('credits')}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                    planType === 'credits'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Credit Packages
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-8 ${displayPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {displayPlans.map((plan, index) => {
              const isPopular = plan.product_id === 'basic_monthly' || plan.product_id === 'credits_100';
              const isLoading = loading === plan.product_id;
              
              return (
                <div
                  key={plan.product_id}
                  data-aos="fade-up"
                  data-aos-delay={200 + index * 100}
                  className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                    isPopular ? 'ring-4 ring-purple-500/20' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.product_name}</h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                        {plan.type === 'subscription' && (
                          <div className="text-left">
                            <div className="text-sm text-gray-600">
                              /{plan.billing_period === 'yearly' ? 'year' : 'month'}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {plan.billing_period === 'yearly' && (
                        <div className="bg-green-100 border border-green-400 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-4">
                          💰 Save 2 months!
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-4 mb-6 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-semibold text-gray-900">{plan.credits}</div>
                          <div className="text-gray-600">
                            {plan.type === 'subscription' ? 'Credits per month' : 'Total Credits'}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-semibold text-gray-900">{formatPrice(Math.round(plan.price / plan.credits))}</div>
                          <div className="text-gray-600">per credit</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
                      <ul className="space-y-3">
                        {plan.features?.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm">
                            <i className="ri-check-line text-green-500 mr-3 text-lg"></i>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.description && (
                        <p className="mt-4 text-sm text-gray-600">{plan.description}</p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handlePurchase(plan.product_id)}
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r ${
                        isPopular 
                          ? 'from-purple-500 to-pink-600' 
                          : 'from-blue-500 to-purple-600'
                      } text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        `${plan.type === 'subscription' ? 'Subscribe to' : 'Buy'} ${plan.product_name}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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