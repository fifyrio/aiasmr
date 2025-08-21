'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'

interface ASMRTemplate {
  id: number
  title: string
  category: string[]
  ratio: string
  duration: string
  downloads: string
  prompt: string
  tags: string[]
  similar: number[]
  video: string
  poster: string
  hasAudio: boolean
}

const AIASMRPromptsPage = () => {
  const [templates, setTemplates] = useState<ASMRTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ASMRTemplate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/ai-asmr-prompts')
        const result = await response.json()
        
        if (result.success) {
          setTemplates(result.data)
        } else {
          setError(result.error || 'Failed to load templates')
        }
      } catch (err) {
        setError('Failed to fetch ASMR templates')
        console.error('Error fetching templates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const openModal = (template: ASMRTemplate) => {
    setSelectedTemplate(template)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTemplate(null)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToastMessage('Prompt copied to clipboard!')
      setToastType('success')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      setToastMessage('Failed to copy prompt')
      setToastType('error')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const scrollToDiscoverASMR = () => {
    const element = document.getElementById('discover-asmr')
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("/images/ai-asmr-prompts.png")`,
          }}
        ></div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI ASMR Prompts
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto">
            AI-Powered ASMR Video Generator with Ready-to-Use Prompts
          </p>
          <p className="text-lg text-gray-300 mb-12 max-w-5xl mx-auto">
            Create all kinds of ASMR videos effortlessly with AIASMR Video&apos;s AI-powered video editor. Whether you&apos;re producing peeling 
            ASMR, cutting ASMR, eating sounds, or object manipulation ASMR, AIASMR Video helps you generate high-quality visuals and 
            clean, crisp audio with just a few clicks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={scrollToDiscoverASMR}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              View Full ASMR Clips
            </button>
            <Link href="/create">
              <button className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors">
                Create Videos
              </button>
            </Link>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="text-4xl font-bold text-purple-300 mb-2">2.3M+</div>
              <div className="text-gray-300">Creative Assets</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="text-4xl font-bold text-purple-300 mb-2">150M+</div>
              <div className="text-gray-300">Downloads</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="text-4xl font-bold text-purple-300 mb-2">30M+</div>
              <div className="text-gray-300">Active Creators</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Video Examples Section */}
      <section id="discover-asmr" className="py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Discover Soothing ASMR
            </h2>
            <h3 className="text-3xl font-semibold text-purple-400 mb-6">
              Visuals & Audio [Prompts Included]
            </h3>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              Discover what&apos;s possible with AIASMR Video&apos;s AI-powered ASMR video generator. Explore curated video 
              examples created with Google Veo 3 model in AIASMR Video, each paired with the exact prompt used, so you 
              can easily replicate or customize them for your own relaxing content.
            </p>
          </div>
          
          {/* Video Grid */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading ASMR templates...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && templates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="bg-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-gray-600 cursor-pointer"
                  onClick={() => openModal(template)}
                >
                  <div className="relative">
                    <img 
                      src={template.poster} 
                      alt={template.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/api/placeholder/300/400";
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-purple-600/80 text-white text-xs px-2 py-1 rounded">
                      {template.ratio.replace('ratio-', '').replace('-', ':')}
                    </div>
                    {template.hasAudio && (
                      <div className="absolute bottom-3 left-3 bg-purple-600/80 text-white text-xs px-2 py-1 rounded flex items-center">
                        <span className="mr-1">🔊</span>
                        <span>Audio</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-2">{template.title}</h4>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded mr-2">ASMR</span>
                      <span>👁 {template.downloads}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/create">
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg">
                Make Your First ASMR Video in Minutes
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Why Choose AIASMR Video Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose AIASMR Video to Generate AI ASMR Videos?
            </h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              Our advanced AI technology and user-friendly platform make creating professional ASMR content effortless and accessible for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning-Fast Generation</h3>
              <p className="text-gray-300">
                Create high-quality ASMR videos in minutes with our advanced AI technology. No technical skills required.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Ready-to-Use Prompts</h3>
              <p className="text-gray-300">
                Access our curated library of proven ASMR prompts for soap cutting, ice crushing, page turning, and more.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Professional Quality</h3>
              <p className="text-gray-300">
                Generate 4K quality videos with crystal-clear audio, perfect for social media and professional use.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Customizable Options</h3>
              <p className="text-gray-300">
                Adjust duration, quality, aspect ratio, and triggers to create the perfect ASMR video for your audience.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Instant Download</h3>
              <p className="text-gray-300">
                Download your generated ASMR videos immediately in multiple formats, ready for upload to any platform.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Community Support</h3>
              <p className="text-gray-300">
                Join thousands of creators sharing tips, prompts, and inspiration in our vibrant ASMR community.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQs Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              FAQs on Making ASMR Videos With Prompts
            </h2>
            <p className="text-lg text-gray-300">
              Get answers to the most common questions about creating AI-generated ASMR videos with our platform.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Q</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    What types of ASMR videos can I create with AI prompts?
                  </h3>
                  <p className="text-gray-300">
                    You can create a wide variety of ASMR videos including soap cutting, ice crushing, page turning, sponge squeezing, 
                    water droplets, honey dripping, and many other satisfying and relaxing content types. Our AI supports both visual 
                    and audio ASMR triggers.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Q</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    How long does it take to generate an ASMR video?
                  </h3>
                  <p className="text-gray-300">
                    Most ASMR videos are generated within 2-5 minutes, depending on the complexity of your prompt and the selected 
                    duration. Our advanced AI technology ensures fast processing while maintaining high quality output.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Q</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    What video quality and formats are available?
                  </h3>
                  <p className="text-gray-300">
                    We offer multiple quality options including 720p and 1080p resolution. Videos can be generated in various 
                    aspect ratios (16:9, 4:3, 1:1, 3:4, 9:16) to suit different platforms like YouTube, Instagram, TikTok, and more.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Q</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Can I customize the ASMR triggers in my videos?
                  </h3>
                  <p className="text-gray-300">
                    Yes! You can select from our library of ASMR triggers including soap, sponge, ice, water, honey, cubes, petals, 
                    and pages. You can combine up to 3 different triggers in a single video to create unique and engaging content.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 5 */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Q</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    How much does it cost to generate ASMR videos?
                  </h3>
                  <p className="text-gray-300">
                    Each video generation costs 20 credits. New users receive 20 free credits to get started. Additional credits 
                    can be purchased through our flexible pricing plans, and failed generations are automatically refunded.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 6 */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Q</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Can I use the generated videos commercially?
                  </h3>
                  <p className="text-gray-300">
                    Yes, all videos generated through our platform are available for commercial use. You retain full rights to 
                    your created content and can monetize them on any platform including YouTube, social media, or your own website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How to Make AI ASMR Video Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              How to Make an AI ASMR Video From Prompts in AIASMR Video
            </h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              Follow these simple steps to create stunning ASMR videos using our AI-powered platform. 
              No technical skills required - just your creativity!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
               
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Write Your Prompt</h3>
              <p className="text-gray-300">
                Describe the ASMR video you want to create. Be specific about the triggers, sounds, and visual elements you desire.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Customize Settings</h3>
              <p className="text-gray-300">
                Select your preferred duration, quality, aspect ratio, and ASMR triggers to personalize your video.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Generate Video</h3>
              <p className="text-gray-300">
                Click generate and let our AI create your ASMR video. The process typically takes 2-5 minutes to complete.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
                  <span className="text-white text-2xl font-bold">4</span>
                </div>
                
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Download & Share</h3>
              <p className="text-gray-300">
                Download your completed ASMR video and share it on your favorite platforms like YouTube, TikTok, or Instagram.
              </p>
            </div>
          </div>          
          
          <div className="text-center mt-12">
            <Link href="/create">
              <button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg">
                Start Creating Your ASMR Video Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-black rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">ASMR Examples</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Video Preview */}
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-gray-900">
                    <video 
                      className="w-full h-auto"
                      poster={selectedTemplate.poster}
                      controls
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        const img = document.createElement('img');
                        img.src = selectedTemplate.poster;
                        img.className = 'w-full h-auto';
                        img.alt = selectedTemplate.title;
                        target.parentNode?.appendChild(img);
                      }}
                    >
                      <source src={selectedTemplate.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute top-3 right-3 bg-purple-600/80 text-white text-xs px-2 py-1 rounded">
                      {selectedTemplate.ratio.replace('ratio-', '').replace('-', ':')}
                    </div>
                  </div>
                  {selectedTemplate.hasAudio && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <span className="mr-2">🔊</span>
                      <span>Audio Included</span>
                    </div>
                  )}
                </div>

                {/* Right Side - Template Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">{selectedTemplate.title}</h3>
                    
                    {/* Template Info */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 text-gray-400">🏷️</span>
                        <span className="text-gray-300">Category:</span>
                        <span className="ml-2 bg-purple-600 text-white px-2 py-1 rounded text-sm">
                          {selectedTemplate.category[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 text-gray-400">⏱️</span>
                        <span className="text-gray-300">Duration:</span>
                        <span className="ml-2 bg-gray-700 text-white px-2 py-1 rounded text-sm">
                          {selectedTemplate.duration}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 text-gray-400">📐</span>
                        <span className="text-gray-300">Aspect Ratio:</span>
                        <span className="ml-2 bg-gray-700 text-white px-2 py-1 rounded text-sm">
                          {selectedTemplate.ratio.replace('ratio-', '').replace('-', ':')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Copy Prompt Section */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">
                        Copy this prompt to generate a similar video:
                      </h4>
                      <button
                        onClick={() => copyToClipboard(selectedTemplate.prompt)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedTemplate.prompt}
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Link 
                      href={`/create?prompt=${encodeURIComponent(selectedTemplate.prompt)}`}
                      className="block w-full"
                    >
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center">                        
                        Make ASMR with AI
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast 
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      <Footer />
    </div>
  )
}

export default AIASMRPromptsPage