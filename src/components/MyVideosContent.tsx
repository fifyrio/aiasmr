'use client'

import React, { useState, useEffect, useCallback } from 'react'
import FsLightbox from 'fslightbox-react'
import AOS from 'aos'

interface Video {
  id: string
  title: string
  prompt: string
  triggers: string[]
  status: 'processing' | 'ready' | 'failed'
  credit_cost: number
  created_at: string
  updated_at: string
  thumbnail_url: string
  preview_url: string
  download_url: string
  category: string
  duration: string
  views: number
  likes: number
}

interface UserStats {
  total_videos: number
  total_credits_spent: number
  remaining_credits: number
  plan_type: 'free' | 'basic' | 'pro'
}

const MyVideosContent = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'alphabetical'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'processing' | 'ready' | 'failed'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    total_videos: 0,
    total_credits_spent: 0,
    remaining_credits: 0,
    plan_type: 'free'
  })
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [actionVideoId, setActionVideoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadVideos = useCallback(async () => {
    setLoading(true)
    
    // Mock data for demonstration
    const mockVideos: Video[] = [
      {
        id: '1',
        title: 'Soap Cutting ASMR',
        prompt: 'Create a relaxing soap cutting ASMR video with colorful soaps',
        triggers: ['cutting', 'soap', 'satisfying'],
        status: 'ready',
        credit_cost: 25,
        created_at: '2024-01-15T14:30:00Z',
        updated_at: '2024-01-15T14:32:00Z',
        thumbnail_url: '/api/placeholder/400/300',
        preview_url: '/api/placeholder/video/1',
        download_url: '/downloads/video1.mp4',
        category: 'Cutting',
        duration: '3:42',
        views: 245,
        likes: 32
      },
      {
        id: '2',
        title: 'Water Droplets',
        prompt: 'Generate water droplet sounds on different surfaces',
        triggers: ['water', 'droplets', 'rain'],
        status: 'processing',
        credit_cost: 30,
        created_at: '2024-01-14T10:15:00Z',
        updated_at: '2024-01-14T10:15:00Z',
        thumbnail_url: '/api/placeholder/400/300',
        preview_url: '/api/placeholder/video/2',
        download_url: '',
        category: 'Water',
        duration: '5:18',
        views: 0,
        likes: 0
      },
      {
        id: '3',
        title: 'Honey Dripping',
        prompt: 'Sweet honey dripping ASMR with golden visuals',
        triggers: ['honey', 'dripping', 'sweet'],
        status: 'failed',
        credit_cost: 20,
        created_at: '2024-01-13T16:45:00Z',
        updated_at: '2024-01-13T16:47:00Z',
        thumbnail_url: '/api/placeholder/400/300',
        preview_url: '/api/placeholder/video/3',
        download_url: '',
        category: 'Object',
        duration: '4:25',
        views: 0,
        likes: 0
      },
      {
        id: '4',
        title: 'Page Turning',
        prompt: 'Gentle page turning sounds from vintage books',
        triggers: ['pages', 'books', 'paper'],
        status: 'ready',
        credit_cost: 15,
        created_at: '2024-01-12T09:20:00Z',
        updated_at: '2024-01-12T09:22:00Z',
        thumbnail_url: '/api/placeholder/400/300',
        preview_url: '/api/placeholder/video/4',
        download_url: '/downloads/video4.mp4',
        category: 'Pages',
        duration: '6:12',
        views: 189,
        likes: 28
      },
      {
        id: '5',
        title: 'Ice Crushing',
        prompt: 'Satisfying ice crushing and breaking sounds',
        triggers: ['ice', 'crushing', 'breaking'],
        status: 'ready',
        credit_cost: 28,
        created_at: '2024-01-11T13:10:00Z',
        updated_at: '2024-01-11T13:12:00Z',
        thumbnail_url: '/api/placeholder/400/300',
        preview_url: '/api/placeholder/video/5',
        download_url: '/downloads/video5.mp4',
        category: 'Ice',
        duration: '2:58',
        views: 412,
        likes: 65
      },
      {
        id: '6',
        title: 'Sponge Squeezing',
        prompt: 'Colorful sponge squeezing with water sounds',
        triggers: ['sponge', 'squeezing', 'water'],
        status: 'processing',
        credit_cost: 22,
        created_at: '2024-01-10T11:30:00Z',
        updated_at: '2024-01-10T11:30:00Z',
        thumbnail_url: '/api/placeholder/400/300',
        preview_url: '/api/placeholder/video/6',
        download_url: '',
        category: 'Sponge',
        duration: '4:33',
        views: 0,
        likes: 0
      }
    ]

    // Apply filters and sorting
    let filteredVideos = [...mockVideos]
    
    if (filterStatus !== 'all') {
      filteredVideos = filteredVideos.filter(video => video.status === filterStatus)
    }
    
    if (filterCategory !== 'all') {
      filteredVideos = filteredVideos.filter(video => video.category === filterCategory)
    }
    
    // Sort videos
    filteredVideos.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'cost':
          return b.credit_cost - a.credit_cost
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setVideos(filteredVideos)
    setLoading(false)
  }, [sortBy, filterStatus, filterCategory])

  const loadUserStats = async () => {
    // Mock user stats
    const mockStats: UserStats = {
      total_videos: 24,
      total_credits_spent: 520,
      remaining_credits: 180,
      plan_type: 'basic'
    }
    setUserStats(mockStats)
  }

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  useEffect(() => {
    loadVideos()
    loadUserStats()
  }, [loadVideos])

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([])
    } else {
      setSelectedVideos(videos.map(v => v.id))
    }
  }

  const openLightbox = (videoId: string) => {
    const videoIndex = videos.findIndex(v => v.id === videoId)
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: videoIndex + 1
    })
  }

  const handleDelete = (videoId: string) => {
    setActionVideoId(videoId)
    setShowDeleteModal(true)
  }

  const handleRegenerate = (videoId: string) => {
    setActionVideoId(videoId)
    setShowRegenerateModal(true)
  }

  const confirmDelete = () => {
    if (actionVideoId) {
      setVideos(prev => prev.filter(v => v.id !== actionVideoId))
      setSelectedVideos(prev => prev.filter(id => id !== actionVideoId))
    }
    setShowDeleteModal(false)
    setActionVideoId(null)
  }

  const confirmRegenerate = () => {
    if (actionVideoId) {
      setVideos(prev => prev.map(v => 
        v.id === actionVideoId 
          ? { ...v, status: 'processing' as const, updated_at: new Date().toISOString() }
          : v
      ))
    }
    setShowRegenerateModal(false)
    setActionVideoId(null)
  }

  const handleBulkDelete = () => {
    setVideos(prev => prev.filter(v => !selectedVideos.includes(v.id)))
    setSelectedVideos([])
    setShowBulkActions(false)
  }

  const handleBulkRegenerate = () => {
    setVideos(prev => prev.map(v => 
      selectedVideos.includes(v.id) 
        ? { ...v, status: 'processing' as const, updated_at: new Date().toISOString() }
        : v
    ))
    setSelectedVideos([])
    setShowBulkActions(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></div>
            Processing
          </span>
        )
      case 'ready':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Ready
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
            Failed
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const videoSources = videos.map(video => video.preview_url)

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Credits & Usage Summary */}
      <div data-aos="fade-up" className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-gray-800">{userStats.total_videos}</div>
            <div className="text-sm text-gray-600">Total Videos</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-gray-800">{userStats.total_credits_spent}</div>
            <div className="text-sm text-gray-600">Credits Spent This Month</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-purple-600">{userStats.remaining_credits}</div>
            <div className="text-sm text-gray-600">Remaining Credits</div>
          </div>
          <div className="text-center md:text-left">
            <button className="btn-primary w-full md:w-auto">
              <i className="ri-vip-crown-line mr-2"></i>
              {userStats.plan_type === 'free' ? 'Upgrade Plan' : 'Buy More Credits'}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div data-aos="fade-up" data-aos-delay="200" className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date">Date (Newest)</option>
                <option value="cost">Cost (Highest)</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className="ri-grid-line"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className="ri-list-check"></i>
              </button>
            </div>

            {/* Bulk Actions Toggle */}
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showBulkActions 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className="ri-checkbox-multiple-line mr-2"></i>
              Bulk Actions
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedVideos.length === videos.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Select All ({selectedVideos.length} selected)
                  </span>
                </label>
              </div>
              
              {selectedVideos.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkRegenerate}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    Regenerate Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Videos Grid/List */}
      <div data-aos="fade-up" data-aos-delay="400">
        {videos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <i className="ri-video-line text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your filters or create your first video.'
                : 'You haven\'t created any videos yet. Start creating your first ASMR video!'
              }
            </p>
            <button className="btn-primary">
              <i className="ri-add-circle-line mr-2"></i>
              Create Video
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {videos.map((video) => (
              <div key={video.id} className="video-card">
                <div className="relative">
                  {/* Checkbox for bulk actions */}
                  {showBulkActions && (
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedVideos.includes(video.id)}
                        onChange={() => handleVideoSelect(video.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {/* Video Thumbnail */}
                  <div className="relative overflow-hidden h-48 cursor-pointer" onClick={() => openLightbox(video.id)}>
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <i className="ri-play-circle-line text-4xl mb-2 opacity-80 group-hover:opacity-100 transition-opacity"></i>
                        <p className="text-sm opacity-80">Click to Preview</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(video.status)}
                    </div>
                    
                    {/* Duration */}
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {video.category}
                      </span>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {video.prompt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.triggers.map((trigger, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {trigger}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <i className="ri-calendar-line mr-1"></i>
                          {formatDate(video.created_at)}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-coin-line mr-1"></i>
                          {video.credit_cost} credits
                        </span>
                      </div>
                      {video.status === 'ready' && (
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">
                            <i className="ri-eye-line mr-1"></i>
                            {video.views}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-heart-line mr-1"></i>
                            {video.likes}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openLightbox(video.id)}
                          className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          <i className="ri-play-line mr-1"></i>
                          Preview
                        </button>
                        
                        {video.status === 'ready' && (
                          <button className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                            <i className="ri-download-line mr-1"></i>
                            Download
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRegenerate(video.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Regenerate"
                        >
                          <i className="ri-refresh-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && videos.length > 0 && (
        <div className="text-center" data-aos="fade-up" data-aos-delay="600">
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="btn-secondary"
          >
            <i className="ri-arrow-down-line mr-2"></i>
            Load More Videos
          </button>
        </div>
      )}

      {/* Help Section */}
      <div data-aos="fade-up" data-aos-delay="800" className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            Having trouble with video generation or need support?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-secondary">
              <i className="ri-question-line mr-2"></i>
              View FAQ
            </button>
            <button className="btn-primary">
              <i className="ri-mail-line mr-2"></i>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <i className="ri-error-warning-line text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Delete Video
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this video? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-blue-600 mb-4">
                <i className="ri-refresh-line text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Regenerate Video
              </h3>
              <p className="text-gray-600 mb-4">
                This will create a new video using the original prompt and settings.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  <i className="ri-coin-line mr-1"></i>
                  This will cost {actionVideoId ? videos.find(v => v.id === actionVideoId)?.credit_cost : 0} credits
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRegenerate}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <FsLightbox
        toggler={lightboxController.toggler}
        sources={videoSources}
        slide={lightboxController.slide}
        type="video"
      />
    </div>
  )
}

export default MyVideosContent