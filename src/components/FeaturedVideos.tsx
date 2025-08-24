'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import AOS from 'aos'
import ASMRModal, { ASMRTemplate } from './ASMRModal'

// Import template data  
import templatesData from '@/data/asmr_templates.json'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// 本地格式化数字函数
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

interface FeaturedVideosProps {
  // No props needed - using template data directly
}

const FeaturedVideos: React.FC<FeaturedVideosProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ASMRTemplate | null>(null)
  
  // Use first 10 templates from the data
  const featuredTemplates = templatesData.slice(0, 10) as ASMRTemplate[]

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  // 转换模板数据格式以兼容现有UI
  const displayVideos = featuredTemplates.map((template, index) => ({
    id: template.id,
    title: template.title,
    description: template.prompt.substring(0, 100) + '...', // Use prompt as description, truncated
    thumbnail: template.poster || '/placeholder-video-thumb.jpg',
    video: template.video || '',
    category: template.category[0] || 'ASMR',
    duration: template.duration,
    views: template.downloads, // Use downloads as views
    likes: Math.floor(parseInt(template.downloads.replace(/[K,M]/g, '')) / 10) + 'K', // Generate likes based on downloads
    author: 'AI Generated'
  }))

  const openModal = (index: number) => {
    const template = featuredTemplates[index]
    setSelectedTemplate(template)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTemplate(null)
  }


  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Featured <span className="text-purple-400">AI-Generated</span> Videos
          </h2>
          <p className="text-xl text-purple-200/80 max-w-2xl mx-auto">
            Discover amazing ASMR videos created by our AI. Get inspired and create your own masterpiece.
          </p>
        </div>

        <div data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="featured-videos-swiper"
          >
            {displayVideos.map((video, index) => (
              <SwiperSlide key={video.id}>
                <div className="video-card group cursor-pointer" onClick={() => openModal(index)}>
                  <div className="relative overflow-hidden">
                    <div className="w-full h-64 relative bg-gray-800">
                      <img 
                        src={encodeURI(video.thumbnail)} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient background if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.classList.add('bg-gradient-to-br', 'from-purple-600', 'to-purple-800', 'flex', 'items-center', 'justify-center');
                            parent.innerHTML += `
                              <div class="text-white text-center">
                                <i class="ri-play-circle-line text-6xl mb-2 opacity-80 group-hover:opacity-100 transition-opacity"></i>
                                <p class="text-sm opacity-80">Click to Preview</p>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {video.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="ri-play-circle-line text-6xl text-white"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {video.title}
                    </h3>
                    <p className="text-purple-200/80 mb-4">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-purple-300/80">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <i className="ri-eye-line mr-1"></i>
                          {video.views}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-heart-line mr-1"></i>
                          {video.likes}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-400 hover:text-red-400 transition-colors">
                          <i className="ri-heart-line"></i>
                        </button>
                        <button className="text-purple-400 hover:text-blue-400 transition-colors">
                          <i className="ri-share-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
          <button className="btn-primary">
            <i className="ri-compass-line mr-2"></i>
            Explore All Videos
          </button>
        </div>
      </div>

      <ASMRModal
        isOpen={isModalOpen}
        template={selectedTemplate}
        onClose={closeModal}
      />
    </section>
  )
}

export default FeaturedVideos