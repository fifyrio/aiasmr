'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import FsLightbox from 'fslightbox-react'
import AOS from 'aos'

const FeaturedVideos = () => {
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

  const featuredVideos = [
    {
      id: 1,
      title: 'Soap Cutting ASMR',
      description: 'Satisfying soap cutting sounds with colorful soaps',
      thumbnail: '/api/placeholder/400/300',
      video: '/api/placeholder/video/1',
      category: 'Cutting',
      duration: '3:42',
      views: '12.5K',
      likes: '1.2K'
    },
    {
      id: 2,
      title: 'Water Droplets',
      description: 'Relaxing water droplet sounds on different surfaces',
      thumbnail: '/api/placeholder/400/300',
      video: '/api/placeholder/video/2',
      category: 'Water',
      duration: '5:18',
      views: '8.9K',
      likes: '892'
    },
    {
      id: 3,
      title: 'Honey Dripping',
      description: 'Sweet honey dripping ASMR with golden visuals',
      thumbnail: '/api/placeholder/400/300',
      video: '/api/placeholder/video/3',
      category: 'Object',
      duration: '4:25',
      views: '15.2K',
      likes: '1.8K'
    },
    {
      id: 4,
      title: 'Page Turning',
      description: 'Gentle page turning sounds from vintage books',
      thumbnail: '/api/placeholder/400/300',
      video: '/api/placeholder/video/4',
      category: 'Pages',
      duration: '6:12',
      views: '7.3K',
      likes: '654'
    },
    {
      id: 5,
      title: 'Ice Crushing',
      description: 'Satisfying ice crushing and breaking sounds',
      thumbnail: '/api/placeholder/400/300',
      video: '/api/placeholder/video/5',
      category: 'Ice',
      duration: '2:58',
      views: '11.7K',
      likes: '1.1K'
    },
    {
      id: 6,
      title: 'Sponge Squeezing',
      description: 'Colorful sponge squeezing with water sounds',
      thumbnail: '/api/placeholder/400/300',
      video: '/api/placeholder/video/6',
      category: 'Sponge',
      duration: '4:33',
      views: '9.8K',
      likes: '967'
    }
  ]

  const openLightbox = (index: number) => {
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: index + 1
    })
  }

  const videoSources = featuredVideos.map(video => video.video)

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Featured AI-Generated Videos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
            {featuredVideos.map((video, index) => (
              <SwiperSlide key={video.id}>
                <div className="video-card group cursor-pointer" onClick={() => openLightbox(index)}>
                  <div className="relative overflow-hidden">
                    <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
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
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
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
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <i className="ri-heart-line"></i>
                        </button>
                        <button className="text-gray-400 hover:text-blue-500 transition-colors">
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