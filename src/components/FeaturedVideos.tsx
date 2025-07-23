'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import FsLightbox from 'fslightbox-react'
import AOS from 'aos'

// 视频类型定义（本地副本）
interface FeaturedVideo {
  id: string
  title: string
  description: string
  thumbnail_url: string
  preview_url: string
  category: string
  duration: string
  views_count: number
  likes_count: number
  is_featured: boolean
  is_public: boolean
  created_at: string
  author?: {
    full_name: string
    avatar_url?: string
  }
}

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
  videos: FeaturedVideo[]
}

const FeaturedVideos: React.FC<FeaturedVideosProps> = ({ videos }) => {
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1
  })

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  // 转换数据格式以兼容现有UI
  const displayVideos = videos.map((video, index) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail_url,
    video: video.preview_url,
    category: video.category,
    duration: video.duration,
    views: formatNumber(video.views_count),
    likes: formatNumber(video.likes_count),
    author: video.author
  }))

  const openLightbox = (index: number) => {
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: index + 1
    })
  }

  const videoSources = displayVideos.map(video => video.video)

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
                <div className="video-card group cursor-pointer" onClick={() => openLightbox(index)}>
                  <div className="relative overflow-hidden">
                    <div className="w-full h-64 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center border border-purple-500/30">
                      <div className="text-white text-center">
                        <i className="ri-play-circle-line text-6xl mb-2 opacity-80 group-hover:opacity-100 transition-opacity"></i>
                        <p className="text-sm opacity-80">Click to Preview</p>
                      </div>
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

      <FsLightbox
        toggler={lightboxController.toggler}
        sources={videoSources}
        slide={lightboxController.slide}
        type="video"
      />
    </section>
  )
}

export default FeaturedVideos