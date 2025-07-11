'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import AOS from 'aos'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  thumbnail_url: string
  hero_image_url?: string
  published_at: string
  tag: string
  status: string
  author: {
    name: string
    avatar?: string
    bio?: string
  }
  read_time?: string
  featured?: boolean
  meta_title?: string
  meta_description?: string
}

interface BlogPostContentProps {
  post: BlogPost
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ post }) => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  // Since we only have one blog post, we'll show suggested next steps instead
  const relatedPosts = []

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative">
        {/* Hero Image */}
        <div className="h-96 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div data-aos="fade-up">
              <div className="mb-4">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Back to Blog
                </Link>
              </div>
              <div className="flex items-center justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(post.tag)}`}>
                  {post.tag}
                </span>
                {post.featured && (
                  <span className="ml-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                {post.excerpt}
              </p>
            </div>
          </div>
        </div>

        {/* Article Meta */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4" data-aos="fade-up">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(post.published_at)}</p>
                  </div>
                </div>
                {post.read_time && (
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="ri-time-line mr-1"></i>
                    {post.read_time}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <i className="ri-heart-line"></i>
                  <span className="text-sm">Like</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <i className="ri-share-line"></i>
                  <span className="text-sm">Share</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                  <i className="ri-bookmark-line"></i>
                  <span className="text-sm">Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none" data-aos="fade-up">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl" data-aos="fade-up">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-medium">
                  {post.author.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.author.name}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {post.author.bio || `${post.author.name} is a content creator and AI enthusiast passionate about making technology accessible to everyone.`}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8" data-aos="fade-up">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              Ready to Create Your Own ASMR Videos?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Put this knowledge into practice and start generating your own AI-powered ASMR content today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create" className="btn-primary inline-flex items-center justify-center">
                <i className="ri-magic-line mr-2"></i>
                Start Creating
              </Link>
              <Link href="/explore" className="btn-secondary inline-flex items-center justify-center">
                <i className="ri-compass-line mr-2"></i>
                Explore Videos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              What&apos;s Next?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Now that you understand ASMR videos, explore our platform and start creating your own content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              data-aos="fade-up"
              data-aos-delay="0"
            >
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <i className="ri-magic-line text-4xl mb-2 opacity-80"></i>
                  <p className="text-sm opacity-80">Start Creating</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Create Your First ASMR Video
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Use our AI platform to generate your first ASMR video with just a text prompt. No equipment needed!
                </p>
                
                <Link
                  href="/create"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  Start creating
                  <i className="ri-arrow-right-line ml-1"></i>
                </Link>
              </div>
            </article>

            <article
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <i className="ri-compass-line text-4xl mb-2 opacity-80"></i>
                  <p className="text-sm opacity-80">Explore Gallery</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Explore AI-Generated Videos
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Browse our gallery of AI-generated ASMR videos for inspiration and to see what&apos;s possible.
                </p>
                
                <Link
                  href="/explore"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  Explore gallery
                  <i className="ri-arrow-right-line ml-1"></i>
                </Link>
              </div>
            </article>

            <article
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <i className="ri-price-tag-3-line text-4xl mb-2 opacity-80"></i>
                  <p className="text-sm opacity-80">View Plans</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Choose Your Plan
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Select from our flexible pricing plans to get more credits and unlock premium features.
                </p>
                
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  View pricing
                  <i className="ri-arrow-right-line ml-1"></i>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogPostContent