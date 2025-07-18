'use client';

import { useState, useEffect } from 'react';
import AOS from 'aos';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Mock data for videos
const mockVideos = [
  {
    id: 1,
    title: "Crystal Apple Slicing",
    description: "Satisfying crystal apple cutting with crisp sounds",
    category: "Cutting",
    status: "HOT",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/1",
    likes: 2847,
    shares: 156,
    creator: "AI Generator"
  },
  {
    id: 2,
    title: "Memory Foam Cutting",
    description: "Smooth knife slicing through memory foam",
    category: "Cutting",
    status: "NEW",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/2",
    likes: 1923,
    shares: 89,
    creator: "AI Generator"
  },
  {
    id: 3,
    title: "Honey Dripping",
    description: "Golden honey slowly dripping with ambient sounds",
    category: "Water",
    status: "TRENDING",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/3",
    likes: 3456,
    shares: 234,
    creator: "AI Generator"
  },
  {
    id: 4,
    title: "Ice Cube Melting",
    description: "Crystal clear ice cubes melting in warm light",
    category: "Water",
    status: "HOT",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/4",
    likes: 1567,
    shares: 78,
    creator: "AI Generator"
  },
  {
    id: 5,
    title: "Soap Cutting",
    description: "Colorful soap bars being cut with precision",
    category: "Cutting",
    status: "NEW",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/5",
    likes: 2134,
    shares: 112,
    creator: "AI Generator"
  },
  {
    id: 6,
    title: "Whisper Sounds",
    description: "Gentle whisper sounds with calming visuals",
    category: "Whisper",
    status: "TRENDING",
    thumbnailUrl: "/api/placeholder/400/300",
    videoUrl: "/api/placeholder/video/6",
    likes: 987,
    shares: 45,
    creator: "AI Generator"
  }
];

const categories = ["All", "Cutting", "Water", "Whisper", "Object"];
const statusFilters = ["All", "HOT", "NEW", "TRENDING"];

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filteredVideos, setFilteredVideos] = useState(mockVideos);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  useEffect(() => {
    let filtered = mockVideos;

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(video => video.status === selectedStatus);
    }

    setFilteredVideos(filtered);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const handleLike = (videoId: number) => {
    setLikedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HOT': return 'bg-red-500';
      case 'NEW': return 'bg-green-500';
      case 'TRENDING': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI ASMR Video <span className="text-yellow-300">Showcase</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover immersive 4K ASMR content created by our community. Experience the perfect blend of visual artistry and relaxing sounds.
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20" data-aos="fade-up" data-aos-delay="200">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/70 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70"></i>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {statusFilters.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedStatus === status
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredVideos.map((video, index) => (
              <div
                key={video.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                data-aos="fade-up"
                data-aos-delay={100 + index * 100}
              >
                {/* Video Thumbnail */}
                <div className="relative group">
                  <div className="aspect-video bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <i className="ri-play-circle-line text-white text-6xl opacity-50 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(video.status)}`}>
                    {video.status}
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
                      <i className="ri-play-fill text-white text-xl"></i>
                    </button>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-2">{video.title}</h3>
                  <p className="text-white/70 text-sm mb-4">{video.description}</p>
                  
                  {/* Creator */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-robot-line text-white text-sm"></i>
                    </div>
                    <span className="text-white/80 text-sm">{video.creator}</span>
                  </div>

                  {/* Engagement Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(video.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                          likedVideos.includes(video.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <i className={`ri-heart-${likedVideos.includes(video.id) ? 'fill' : 'line'} text-sm`}></i>
                        <span className="text-sm font-medium">{video.likes}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300">
                        <i className="ri-share-line text-sm"></i>
                        <span className="text-sm font-medium">{video.shares}</span>
                      </button>
                    </div>
                    
                    <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-300">
                      <i className="ri-eye-line mr-2"></i>
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mb-16" data-aos="fade-up">
            <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <i className="ri-arrow-down-line mr-2"></i>
              Load More Videos
            </button>
          </div>

          {/* Community Testimonials */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-16 border border-white/20" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              <i className="ri-chat-quote-line mr-2"></i>
              What Our Community Says
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Sarah Chen</h4>
                    <p className="text-white/70 text-sm">@sarahc_relaxation</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  &quot;The AI-generated ASMR videos are incredibly realistic and helped me relax after stressful days. The quality is amazing!&quot;
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Mike Johnson</h4>
                    <p className="text-white/70 text-sm">@mikej_asmr</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  &quot;As a content creator, this platform saves me hours of work. The AI understands exactly what makes good ASMR content.&quot;
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Wei Zhang</h4>
                    <p className="text-white/70 text-sm">@weizhang_creator</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  &quot;The variety of triggers and the 4K quality make this my go-to platform for ASMR content. Highly recommended!&quot;
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Snippet */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-16 border border-white/20" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              <i className="ri-question-line mr-2"></i>
              Quick Answers
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <i className="ri-palette-line mr-2 text-yellow-400"></i>
                  What types can be created?
                </h3>
                <p className="text-white/80 text-sm">
                  Our AI can generate cutting videos, water sounds, whisper content, object interactions, and more with realistic 4K visuals.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <i className="ri-timer-2-line mr-2 text-blue-400"></i>
                  How fast is generation?
                </h3>
                <p className="text-white/80 text-sm">
                  Most videos are generated within 1-2 minutes, ensuring you get high-quality content quickly without long wait times.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <i className="ri-hd-line mr-2 text-green-400"></i>
                  Quality advantages?
                </h3>
                <p className="text-white/80 text-sm">
                  AI-generated content offers perfect audio-visual sync, consistent quality, and 4K resolution that rivals professional ASMR videos.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <i className="ri-group-line mr-2 text-purple-400"></i>
                  Who benefits most?
                </h3>
                <p className="text-white/80 text-sm">
                  Content creators, relaxation enthusiasts, and anyone seeking personalized ASMR experiences benefit from our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center" data-aos="fade-up">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Create Your Own ASMR Video?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of creators and start generating personalized ASMR content today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <i className="ri-add-circle-line mr-2"></i>
                  Create Your Own
                </button>
                
                <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                  <i className="ri-price-tag-3-line mr-2"></i>
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}