'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import AOS from 'aos'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  thumbnail_url: string
  published_at: string
  tag: string
  status: string
  author?: {
    name: string
    avatar?: string
  }
  read_time?: string
  featured?: boolean
}

const BlogContent = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string>('all')

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()
        
        if (response.ok) {
          setBlogPosts(data.posts || [])
        } else {
          console.error('Failed to fetch blog posts:', data.error)
          // Fallback to mock data
          const mockPosts: BlogPost[] = [
          {
            id: '1',
            title: 'What is ASMR Video? The Complete Guide to Relaxing Content',
            slug: 'what-is-asmr-video-complete-guide',
            excerpt: 'Discover the fascinating world of ASMR videos - from understanding what they are to creating your own AI-generated content. Learn about triggers, benefits, and proven templates.',
            content: '',
            thumbnail_url: '/api/placeholder/600/400',
            published_at: '2024-01-20T10:00:00Z',
            tag: 'Guide',
            status: 'published',
            author: {
              name: 'AI ASMR Team',
              avatar: '/api/placeholder/40/40'
            },
            read_time: '8 min read',
            featured: true
          }
        ]
        
        setBlogPosts(mockPosts)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const tags = ['all', 'Tutorial', 'Guide', 'Technology', 'Business', 'Tips', 'Future']

  const filteredPosts = selectedTag === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.tag === selectedTag)

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'Tutorial': 'bg-blue-100 text-blue-800',
      'Guide': 'bg-green-100 text-green-800',
      'Technology': 'bg-purple-100 text-purple-800',
      'Business': 'bg-orange-100 text-orange-800',
      'Tips': 'bg-pink-100 text-pink-800',
      'Future': 'bg-indigo-100 text-indigo-800'
    }
    return colors[tag] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="hero-bg py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up" data-aos-delay="200">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Blog
            </h1>
          </div>
          <div data-aos="fade-up" data-aos-delay="400">
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Explore guides, tips, and insights for creating stunning ASMR videos with AI technology
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tag Filter */}
          <div className="mb-12" data-aos="fade-up">
            <div className="flex flex-wrap justify-center gap-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTag === tag
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {tag === 'all' ? 'All Posts' : tag}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          )}

          {/* Blog Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="relative overflow-hidden h-48">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <i className="ri-article-line text-4xl mb-2 opacity-80"></i>
                        <p className="text-sm opacity-80">Blog Post</p>
                      </div>
                    </div>
                    
                    {/* Tag Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(post.tag)}`}>
                        {post.tag}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date and Read Time */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <i className="ri-calendar-line mr-1"></i>
                        {formatDate(post.published_at)}
                      </span>
                      {post.read_time && (
                        <span className="flex items-center">
                          <i className="ri-time-line mr-1"></i>
                          {post.read_time}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Author and CTA */}
                    <div className="flex items-center justify-between">
                      {post.author && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {post.author.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">{post.author.name}</span>
                        </div>
                      )}
                      
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm group-hover:translate-x-1 transition-transform"
                      >
                        Read more
                        <i className="ri-arrow-right-line ml-1"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <i className="ri-article-line text-6xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500">
                {selectedTag === 'all' 
                  ? 'No blog posts available at the moment.' 
                  : `No posts found for "${selectedTag}" category.`}
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center mt-16" data-aos="fade-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                Ready to Create Your Own ASMR Videos?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Put your knowledge to practice and start generating stunning AI-powered ASMR videos today.
              </p>
              <Link href="/create" className="btn-primary inline-flex items-center">
                <i className="ri-magic-line mr-2"></i>
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogContent