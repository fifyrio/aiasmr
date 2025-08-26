'use client'

import React, { useEffect, useState } from 'react'
import AOS from 'aos'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

const FAQPage = () => {
  const [openItem, setOpenItem] = useState<number | null>(null)

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is AIASMR Video?",
          answer: "AIASMR Video is an AI-powered platform that generates high-quality ASMR videos from text prompts, images, or reference videos. Our advanced AI technology creates immersive 4K looped ASMR content with various triggers and binaural audio effects."
        },
        {
          question: "How do I create my first ASMR video?",
          answer: "Simply sign up for an account, go to the Create page, enter a descriptive text prompt, select your preferred ASMR triggers, and click Generate. Your video will be ready in 1-2 minutes (up to 4 minutes during peak times)."
        },
        {
          question: "Do I need to be 18+ to use this service?",
          answer: "Yes, our service is restricted to users who are 18 years of age or older due to the nature of ASMR content and our terms of service."
        }
      ]
    },
    {
      category: "Credits & Pricing",
      questions: [
        {
          question: "How does the credit system work?",
          answer: "Our service uses a credit-based system. Each video generation consumes credits based on the complexity and length. Free users get limited credits, while paid plans offer 200-1000+ credits per month."
        },
        {
          question: "What happens if video generation fails?",
          answer: "If generation fails due to technical issues on our end, no credits are deducted from your account. You can retry the generation at no additional cost."
        },
        {
          question: "Can I get a refund?",
          answer: "Yes, we offer a 7-day satisfaction guarantee for new subscriptions. You can request a full refund within 7 days of your initial purchase, no questions asked."
        },
        {
          question: "Do unused credits roll over?",
          answer: "For paid plans, unused credits roll over to the next billing cycle. Trial credits expire after the trial period ends."
        }
      ]
    },
    {
      category: "Video Generation",
      questions: [
        {
          question: "How long does it take to generate a video?",
          answer: "Average generation time is 1-2 minutes for most videos. During peak usage periods, it may take up to 4 minutes. You'll see a progress indicator during generation."
        },
        {
          question: "What video quality do I get?",
          answer: "Free users get 720p resolution videos. Basic plan subscribers get 720p, while Pro plan users receive full 4K resolution videos with enhanced audio quality."
        },
        {
          question: "What ASMR triggers are available?",
          answer: "We support a wide variety of triggers including Water, Soap, Sponge, Ice, Honey, Petals, Pages, Cutting, Whisper, and many more. Our library is continuously expanding."
        },
        {
          question: "Can I use my own images or reference videos?",
          answer: "Yes, you can upload your own images or reference videos to guide the AI generation process. This helps create more personalized ASMR content."
        }
      ]
    },
    {
      category: "Downloads & Usage",
      questions: [
        {
          question: "How do I download my videos?",
          answer: "Once generation is complete, you'll see a download button on your video. Free users can download in standard quality, while paid subscribers get HD/4K download options."
        },
        {
          question: "Can I use generated videos commercially?",
          answer: "Commercial usage rights are available only to paid subscribers (Basic and Pro plans). Free users can only use videos for personal, non-commercial purposes."
        },
        {
          question: "How long are my videos stored?",
          answer: "Your generated videos are stored in your account indefinitely as long as your account remains active. Deleted accounts may lose access to stored content after a grace period."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "Why isn't my video generating?",
          answer: "Common issues include insufficient credits, inappropriate content in prompts, or temporary server load. Check your credit balance and ensure your prompt follows our content guidelines."
        },
        {
          question: "What browsers are supported?",
          answer: "Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. Make sure JavaScript is enabled and your browser is up to date."
        },
        {
          question: "How do I contact support?",
          answer: "For any questions or technical issues, please email us at support@aiasmr.vip. We provide email-only support and typically respond within 24 hours."
        },
        {
          question: "Is my data secure?",
          answer: "Yes, we use industry-standard SSL/TLS encryption for all data transmission and implement strict security measures to protect your personal information and generated content."
        }
      ]
    }
  ]

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-bg pt-24 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" data-aos-delay="200">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Frequently Asked <span className="text-yellow-300">Questions</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Find answers to common questions about our AI-powered ASMR video generation platform.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            
            {faqData.map((category, categoryIndex) => (
              <div key={category.category} data-aos="fade-up" data-aos-delay={categoryIndex * 100} className="mb-12 last:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="ri-question-line text-purple-500 mr-3"></i>
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex
                    const isOpen = openItem === globalIndex
                    
                    return (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                        >
                          <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                          <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-purple-500 text-xl flex-shrink-0 transition-transform`}></i>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="px-6 py-4 bg-white border-t border-gray-200">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Contact Section */}
            <div data-aos="fade-up" data-aos-delay="800" className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="ri-customer-service-line text-purple-500 mr-3"></i>
                Still Need Help?
              </h2>
              <p className="text-gray-700 mb-4">
                Can&apos;t find the answer you&apos;re looking for? Our support team is here to help you with any questions or technical issues.
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center text-purple-600">
                  <i className="ri-mail-line mr-2"></i>
                  <a href="mailto:support@aiasmr.vip" className="hover:text-purple-800 transition-colors font-semibold">
                    support@aiasmr.vip
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  <i className="ri-time-line mr-1"></i>
                  Typical response time: 24 hours
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div data-aos="fade-up" data-aos-delay="900" className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/pricing" className="block p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-all">
                <div className="flex items-center">
                  <i className="ri-money-dollar-circle-line text-purple-500 text-2xl mr-3"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">View Pricing</h3>
                    <p className="text-sm text-gray-600">Compare our plans</p>
                  </div>
                </div>
              </a>
              
              <a href="/create" className="block p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center">
                  <i className="ri-play-circle-line text-blue-500 text-2xl mr-3"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Start Creating</h3>
                    <p className="text-sm text-gray-600">Generate your first video</p>
                  </div>
                </div>
              </a>
              
              <a href="/terms" className="block p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center">
                  <i className="ri-file-text-line text-gray-500 text-2xl mr-3"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Terms & Privacy</h3>
                    <p className="text-sm text-gray-600">Read our policies</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default FAQPage