'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import FsLightbox from 'fslightbox-react'
import AOS from 'aos'
import { useAuth } from '@/contexts/AuthContext'

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
  const t = useTranslations('myVideos')
  const router = useRouter()
  const { user } = useAuth()
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
  const [totalVideos, setTotalVideos] = useState(0)

  const loadVideos = useCallback(async (userId: string, page: number = 1, append: boolean = false) => {
    if (!userId) return
    
    if (!append) setLoading(true)
    
    try {
      const response = await fetch(`/api/videos?userId=${userId}&page=${page}&limit=10`)
      const data = await response.json()
      
      if (data.success && data.videos) {
        let fetchedVideos = data.videos.map((video: any) => ({
          id: video.id,
          title: video.title,
          prompt: video.prompt,
          triggers: video.triggers || [],
          status: video.status,
          credit_cost: video.credit_cost,
          created_at: video.created_at,
          updated_at: video.updated_at,
          thumbnail_url: video.thumbnail_url || '/api/placeholder/400/300',
          preview_url: video.preview_url || '/api/placeholder/video/1',
          download_url: video.download_url || '',
          category: video.category || 'General',
          duration: video.duration || '0:00',
          views: 0, // Add views/likes tracking later if needed
          likes: 0
        }))
        
        // Apply filters
        if (filterStatus !== 'all') {
          fetchedVideos = fetchedVideos.filter((video: Video) => video.status === filterStatus)
        }
        
        if (filterCategory !== 'all') {
          fetchedVideos = fetchedVideos.filter((video: Video) => video.category === filterCategory)
        }
        
        // Sort videos
        fetchedVideos.sort((a: Video, b: Video) => {
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
        
        if (append) {
          setVideos(prev => [...prev, ...fetchedVideos])
        } else {
          setVideos(fetchedVideos)
        }
        
        setHasMore(data.pagination.page < data.pagination.totalPages)
        setTotalVideos(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to load videos:', error)
      if (!append) setVideos([])
    }
    
    setLoading(false)
  }, [sortBy, filterStatus, filterCategory])

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      
      if (data.success && data.profile) {
        const profile = data.profile
        setUserStats({
          total_videos: profile.total_videos_created || 0,
          total_credits_spent: profile.total_credits_spent || 0,
          remaining_credits: profile.credits || 0,
          plan_type: profile.plan_type || 'free'
        })
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
      // Fallback to default stats
      setUserStats({
        total_videos: 0,
        total_credits_spent: 0,
        remaining_credits: 0,
        plan_type: 'free'
      })
    }
  }

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  useEffect(() => {
    if (user?.id) {
      setCurrentPage(1)
      loadVideos(user.id, 1, false)
      loadUserStats()
    }
  }, [loadVideos, user?.id])

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

  const handleDownload = async (videoId: string, title: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/download`)
      const data = await response.json()

      if (data.success && data.downloadUrl) {
        // Create filename
        const filename = data.filename || `${title.replace(/[^a-zA-Z0-9-_]/g, '-')}.mp4`
        
        // Check if it's a real video URL or test URL
        if (data.downloadUrl.includes('file.com/k/') || data.downloadUrl.includes('xxxxxxx')) {
          // Test environment - show info to user
          alert(t('errors.testDownload', { filename, url: data.downloadUrl }))
        } else {
          // Real URL - attempt download
          try {
            // Try proxied download first for better CORS handling
            const link = document.createElement('a')
            link.href = `/api/videos/${videoId}/download?proxy=true`
            link.download = filename
            link.style.display = 'none'
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } catch (proxyError) {
            console.warn('Proxied download failed, trying direct:', proxyError)
            
            // Fallback to direct URL
            const link = document.createElement('a')
            link.href = data.downloadUrl
            link.download = filename
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        }
      } else {
        console.error('Download failed:', data.error)
        alert(t('errors.downloadFailed'))
      }
    } catch (error) {
      console.error('Download error:', error)
      alert(t('errors.downloadError'))
    }
  }

  const confirmDelete = async () => {
    if (!actionVideoId || !user?.id) return
    
    try {
      const response = await fetch(`/api/videos/${actionVideoId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setVideos(prev => prev.filter(v => v.id !== actionVideoId))
        setSelectedVideos(prev => prev.filter(id => id !== actionVideoId))
      } else {
        console.error('Failed to delete video')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
    }
    
    setShowDeleteModal(false)
    setActionVideoId(null)
  }

  const confirmRegenerate = async () => {
    if (!actionVideoId || !user?.id) return
    
    try {
      const video = videos.find(v => v.id === actionVideoId)
      if (!video) return
      
      const response = await fetch('/api/videos/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId: actionVideoId,
          userId: user.id
        })
      })
      
      if (response.ok) {
        setVideos(prev => prev.map(v => 
          v.id === actionVideoId 
            ? { ...v, status: 'processing' as const, updated_at: new Date().toISOString() }
            : v
        ))
      } else {
        console.error('Failed to regenerate video')
      }
    } catch (error) {
      console.error('Error regenerating video:', error)
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
            {t('controls.statusOptions.processing')}
          </span>
        )
      case 'ready':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            {t('controls.statusOptions.ready')}
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
            {t('controls.statusOptions.failed')}
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
            <div className="text-sm text-gray-600">{t('stats.totalVideos')}</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-gray-800">{userStats.total_credits_spent}</div>
            <div className="text-sm text-gray-600">{t('stats.creditsSpent')}</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-purple-600">{userStats.remaining_credits}</div>
            <div className="text-sm text-gray-600">{t('stats.remainingCredits')}</div>
          </div>
          <div className="text-center md:text-left">
            <button
              onClick={() => router.push('/pricing')}
              className="btn-primary w-full md:w-auto"
            >
              <i className="ri-vip-crown-line mr-2"></i>
              {userStats.plan_type === 'free' ? t('stats.upgradePlan') : t('stats.buyMoreCredits')}
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
              <label className="text-sm font-medium text-gray-700">{t('controls.sortBy')}</label>
              <select 
                value={sortBy} 
                onChange={(e) => {
                  setSortBy(e.target.value as any)
                  setCurrentPage(1)
                  if (user?.id) loadVideos(user.id, 1, false)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date">{t('controls.sortOptions.date')}</option>
                <option value="cost">{t('controls.sortOptions.cost')}</option>
                <option value="alphabetical">{t('controls.sortOptions.alphabetical')}</option>
              </select>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">{t('controls.status')}</label>
              <select 
                value={filterStatus} 
                onChange={(e) => {
                  setFilterStatus(e.target.value as any)
                  setCurrentPage(1)
                  if (user?.id) loadVideos(user.id, 1, false)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('controls.statusOptions.all')}</option>
                <option value="processing">{t('controls.statusOptions.processing')}</option>
                <option value="ready">{t('controls.statusOptions.ready')}</option>
                <option value="failed">{t('controls.statusOptions.failed')}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">{t('controls.category')}</label>
              <select 
                value={filterCategory} 
                onChange={(e) => {
                  setFilterCategory(e.target.value)
                  setCurrentPage(1)
                  if (user?.id) loadVideos(user.id, 1, false)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('controls.allCategories') : category}
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
              {t('controls.bulkActions')}
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
                    {t('controls.selectAll', { count: selectedVideos.length })}
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
                    {t('controls.regenerateSelected')}
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    {t('controls.deleteSelected')}
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('empty.title')}</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus !== 'all' || filterCategory !== 'all' 
                ? t('empty.withFilters')
                : t('empty.noVideos')
              }
            </p>
            <button className="btn-primary">
              <i className="ri-add-circle-line mr-2"></i>
              {t('empty.createVideo')}
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
                    {video.thumbnail_url && video.thumbnail_url !== '/api/placeholder/400/300' ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement?.querySelector('.fallback-thumbnail')?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center fallback-thumbnail ${
                      video.thumbnail_url && video.thumbnail_url !== '/api/placeholder/400/300' ? 'hidden' : ''
                    }`}>
                      <div className="text-white text-center">
                        <i className="ri-play-circle-line text-4xl mb-2 opacity-80 group-hover:opacity-100 transition-opacity"></i>
                        <p className="text-sm opacity-80">{t('videoCard.clickToPreview')}</p>
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
                          {video.credit_cost} {t('videoCard.credits')}
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
                          {t('videoCard.preview')}
                        </button>
                        
                        {video.status === 'ready' && (
                          <button 
                            onClick={() => handleDownload(video.id, video.title)}
                            className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <i className="ri-download-line mr-1"></i>
                            {t('videoCard.download')}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRegenerate(video.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title={t('videoCard.regenerate')}
                        >
                          <i className="ri-refresh-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title={t('videoCard.delete')}
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
            onClick={() => {
              const nextPage = currentPage + 1
              setCurrentPage(nextPage)
              if (user?.id) loadVideos(user.id, nextPage, true)
            }}
            className="btn-secondary"
          >
            <i className="ri-arrow-down-line mr-2"></i>
            {t('loadMore')}
          </button>
        </div>
      )}

      {/* Help Section */}
      <div data-aos="fade-up" data-aos-delay="800" className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t('help.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('help.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-secondary bg-purple-600/10 border-purple-400/30 text-purple-900">
              <i className="ri-question-line mr-2"></i>
              {t('help.viewFaq')}
            </button>
            <button className="btn-primary">
              <i className="ri-mail-line mr-2"></i>
              {t('help.contactSupport')}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <i className="ri-error-warning-line text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('modals.delete.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('modals.delete.message')}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-600 hover:text-white transition-colors"
                >
                  {t('modals.delete.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  {t('modals.delete.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="text-blue-500 mb-4">
                <i className="ri-refresh-line text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('modals.regenerate.title')}
              </h3>
              <p className="text-gray-300 mb-4">
                {t('modals.regenerate.message')}
              </p>
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-300">
                  <i className="ri-coin-line mr-1"></i>
                  {t('modals.regenerate.costWarning', { credits: actionVideoId ? (videos.find(v => v.id === actionVideoId)?.credit_cost || 0) : 0 })}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-600 hover:text-white transition-colors"
                >
                  {t('modals.regenerate.cancel')}
                </button>
                <button
                  onClick={confirmRegenerate}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('modals.regenerate.regenerate')}
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