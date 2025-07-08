'use client'

import React, { useEffect } from 'react'
import AOS from 'aos'

const Hero = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  return (
    <section className="hero-bg min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div data-aos="fade-up" data-aos-delay="200">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Generate ASMR videos with{' '}
            <span className="text-yellow-300">AI</span> in seconds
          </h1>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="400">
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos. 
            Generate immersive 4K looped ASMR content with our advanced AI technology.
          </p>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="600" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="btn-primary text-lg px-10 py-4 hover:scale-110 transition-transform">
            <i className="ri-play-circle-line mr-2"></i>
            Get Started Free
          </button>
          <button className="btn-secondary text-lg px-10 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
            <i className="ri-price-tag-3-line mr-2"></i>
            View Pricing
          </button>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="800" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-3xl mb-2">
              <i className="ri-magic-line"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Generation</h3>
            <p className="text-white/80">Advanced AI creates realistic ASMR videos from your text descriptions</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-3xl mb-2">
              <i className="ri-hd-line"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">4K Quality</h3>
            <p className="text-white/80">Generate high-resolution 4K looped videos for premium experience</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-3xl mb-2">
              <i className="ri-time-line"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Generation</h3>
            <p className="text-white/80">Get your ASMR videos in 1-2 minutes with our optimized pipeline</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
        <i className="ri-arrow-down-line text-2xl"></i>
      </div>
    </section>
  )
}

export default Hero