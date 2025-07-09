import React from 'react'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogPostContent from '@/components/BlogPostContent'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Fetch blog post from API
async function getBlogPost(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/blog/${slug}`, {
      cache: 'no-store' // Disable caching for development
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.post
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
  }
  
  // Fallback to mock data
  const mockPosts = [
    {
      id: '1',
      title: 'How to Create ASMR Videos with AI',
      slug: 'how-to-create-asmr-videos-with-ai',
      excerpt: 'Generate stunning ASMR videos from text prompts using cutting-edge AI technology. Learn the complete process step by step.',
      content: `
        <p>Creating ASMR videos has never been easier with the power of artificial intelligence. In this comprehensive guide, we'll walk you through the complete process of generating stunning ASMR videos from simple text prompts.</p>
        
        <h2>What is AI-Generated ASMR?</h2>
        <p>AI-generated ASMR represents a revolutionary approach to creating relaxing content. Using advanced machine learning models, our platform can transform text descriptions into realistic, high-quality ASMR videos that trigger autonomous sensory meridian response.</p>
        
        <h2>Getting Started</h2>
        <p>The process is remarkably simple:</p>
        <ol>
          <li><strong>Choose your trigger:</strong> Select from our comprehensive library of ASMR triggers including soap cutting, water sounds, whispers, and more.</li>
          <li><strong>Write your prompt:</strong> Describe the scene you want to create. Be specific about colors, textures, and movements.</li>
          <li><strong>Select duration:</strong> Choose your preferred video length (up to 8 seconds for premium quality).</li>
          <li><strong>Generate:</strong> Let our AI work its magic and create your personalized ASMR video.</li>
        </ol>
        
        <h2>Writing Effective Prompts</h2>
        <p>The key to creating amazing ASMR videos lies in crafting descriptive, detailed prompts. Here are some tips:</p>
        <ul>
          <li>Be specific about colors, textures, and materials</li>
          <li>Include sensory details like transparency, glossiness, or roughness</li>
          <li>Describe the movement or action clearly</li>
          <li>Consider the camera angle and lighting</li>
        </ul>
        
        <h2>Advanced Techniques</h2>
        <p>Once you've mastered the basics, try these advanced techniques:</p>
        <ul>
          <li><strong>Layered descriptions:</strong> Combine multiple elements for complex scenes</li>
          <li><strong>Emotional context:</strong> Include mood-setting descriptions</li>
          <li><strong>Technical details:</strong> Specify camera movements or lighting conditions</li>
        </ul>
        
        <h2>Best Practices</h2>
        <p>To get the most out of your AI ASMR creation experience:</p>
        <ul>
          <li>Start with simple prompts and gradually increase complexity</li>
          <li>Experiment with different trigger combinations</li>
          <li>Use descriptive adjectives to enhance the sensory experience</li>
          <li>Consider your target audience's preferences</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>AI-generated ASMR opens up endless possibilities for content creators. Whether you're a beginner or an experienced creator, our platform makes it easy to produce high-quality ASMR videos that engage and relax your audience.</p>
        
        <p>Ready to start creating? Visit our <a href="/create" class="text-purple-600 hover:text-purple-800 font-medium">creation page</a> and begin your AI ASMR journey today.</p>
      `,
      thumbnail_url: '/api/placeholder/800/400',
      hero_image_url: '/api/placeholder/1200/600',
      published_at: '2024-01-15T10:00:00Z',
      tag: 'Tutorial',
      status: 'published',
      author: {
        name: 'AI ASMR Team',
        avatar: '/api/placeholder/40/40',
        bio: 'The AI ASMR team is dedicated to advancing the field of AI-generated relaxation content.'
      },
      read_time: '5 min read',
      featured: true,
      meta_title: 'How to Create ASMR Videos with AI - Complete Guide',
      meta_description: 'Learn how to generate stunning ASMR videos using AI technology. Complete step-by-step guide with tips and best practices.'
    },
    // Add more mock posts as needed
  ]

  return mockPosts.find(post => post.slug === slug)
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found - AIASMR Video',
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: post.meta_title || `${post.title} - AIASMR Video`,
    description: post.meta_description || post.excerpt,
    keywords: `ASMR, AI video generation, ${post.tag}, tutorial, guide`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author.name],
      images: [
        {
          url: post.hero_image_url || post.thumbnail_url,
          width: 1200,
          height: 600,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.hero_image_url || post.thumbnail_url]
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <BlogPostContent post={post} />
      <Footer />
    </main>
  )
}

// Generate static paths for known blog posts
export async function generateStaticParams() {
  // This would typically fetch from your database
  const slugs = [
    'how-to-create-asmr-videos-with-ai',
    'best-asmr-triggers-for-relaxation',
    'ai-video-generation-technology-explained',
    'creating-commercial-asmr-content',
    'asmr-video-optimization-tips',
    'future-of-ai-in-asmr-creation'
  ]

  return slugs.map((slug) => ({
    slug,
  }))
}