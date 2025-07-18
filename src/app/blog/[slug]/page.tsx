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
      title: 'What is ASMR Video? The Complete Guide to Relaxing Content',
      slug: 'what-is-asmr-video-complete-guide',
      excerpt: 'Discover the fascinating world of ASMR videos - from understanding what they are to creating your own AI-generated content. Learn about triggers, benefits, and proven templates.',
      content: `
        <p>ASMR (Autonomous Sensory Meridian Response) videos are content designed to trigger pleasant, tingling sensations in viewers. These videos have revolutionized the way we approach relaxation and stress relief in the digital age.</p>
        
        <h2>What is ASMR Video?</h2>
        <p>ASMR videos are carefully crafted audiovisual experiences that typically feature:</p>
        <ul>
          <li><strong>Gentle sounds</strong> like whispering, tapping, or cutting</li>
          <li><strong>Visual triggers</strong> such as slow movements and close-ups</li>
          <li><strong>Relaxing scenarios</strong> that promote calmness and sleep</li>
          <li><strong>Repetitive actions</strong> that create soothing patterns</li>
        </ul>
        <p>ASMR videos help people relax, reduce stress, and improve sleep quality through carefully crafted audiovisual experiences.</p>
        
        <h2>Why ASMR Videos Are So Popular</h2>
        
        <h3>1. Stress Relief & Relaxation</h3>
        <p>ASMR videos provide instant stress relief in our fast-paced world, offering a natural way to unwind after busy days. The gentle, repetitive nature of ASMR content triggers the body's relaxation response, helping viewers transition from a state of stress to calm.</p>
        
        <h3>2. Sleep Aid</h3>
        <p>Many people use ASMR videos as bedtime routines, with the gentle sounds and visuals helping them fall asleep faster. The consistent, predictable nature of ASMR triggers creates an ideal environment for sleep preparation.</p>
        
        <h3>3. Accessibility</h3>
        <p>Unlike meditation or other relaxation methods, ASMR videos require no special skills—just watch and listen. This makes them accessible to anyone, regardless of experience with relaxation techniques.</p>
        
        <h3>4. Personalized Experience</h3>
        <p>With countless ASMR triggers available, everyone can find content that specifically works for them. From cutting and tapping to whispering and roleplays, there's an ASMR style for every preference.</p>
        
        <h3>5. Growing Community</h3>
        <p>The ASMR community is welcoming and supportive, creating a sense of belonging for viewers and creators alike. This community aspect enhances the overall experience and encourages exploration of different ASMR styles.</p>
        
        <h2>How to Make ASMR Videos</h2>
        
        <h3>Traditional Method</h3>
        <p>The traditional approach involves:</p>
        <ul>
          <li><strong>Equipment Setup:</strong> Professional microphones, cameras, and lighting</li>
          <li><strong>Recording:</strong> Capture high-quality audio and video simultaneously</li>
          <li><strong>Editing:</strong> Sync audio/video, color correction, and post-production</li>
          <li><strong>Publishing:</strong> Upload to platforms like YouTube</li>
        </ul>
        
        <h3>AI-Powered Method (Recommended)</h3>
        <p>Our innovative approach simplifies the process:</p>
        <ol>
          <li>Write a detailed text prompt describing your ASMR scene</li>
          <li>AI generates the video with synchronized ASMR audio from your text</li>
          <li>Download and share your professional-quality content</li>
        </ol>
        
        <h2>ASMR Video Prompt Templates</h2>
        <p>Use these proven templates to create engaging ASMR content:</p>
        
        <h3>Basic Template</h3>
        <blockquote>
          <p>Realistic 4K footage close-up of a [INSTRUMENT] [ACTION] a [COLOR] [MATERIAL] [OBJECT] on a [SURFACE]. It [SECONDARY LOOP ACTION]. The inside of the [OBJECT] is also [MATERIAL]. The sound is ASMR style.</p>
        </blockquote>
        
        <h3>Popular Examples</h3>
        
        <h4>Cutting ASMR:</h4>
        <blockquote>
          <p>Realistic 4K footage close-up of a knife cutting a purple crystal apple on a wooden cutting board. It glistens in the light. The inside of the apple is also crystal. The sound is ASMR style.</p>
        </blockquote>
        
        <h4>Nature ASMR:</h4>
        <blockquote>
          <p>Realistic 4K footage close-up of raindrops falling on green moss on a stone surface. It creates gentle ripples. The moss is soft and vibrant. The sound is ASMR style.</p>
        </blockquote>
        
        <h4>Satisfying ASMR:</h4>
        <blockquote>
          <p>Realistic 4K footage close-up of hands squeezing a pink foam ball on a marble table. It slowly returns to shape. The foam is soft and smooth. The sound is ASMR style.</p>
        </blockquote>
        
        <h3>Template Variables</h3>
        <ul>
          <li><strong>[INSTRUMENT]:</strong> knife, scissors, hands, spoon</li>
          <li><strong>[ACTION]:</strong> cutting, slicing, squeezing, tapping</li>
          <li><strong>[COLOR]:</strong> purple, golden, transparent, rainbow</li>
          <li><strong>[MATERIAL]:</strong> crystal, foam, ice, honey</li>
          <li><strong>[OBJECT]:</strong> apple, cube, sphere, flower</li>
          <li><strong>[SURFACE]:</strong> wooden board, marble table, glass plate</li>
          <li><strong>[SECONDARY LOOP ACTION]:</strong> glistens, sparkles, flows, bounces</li>
        </ul>
        
        <h2>Start Creating Today</h2>
        <p>Ready to make your own ASMR videos? Our AI platform makes it simple:</p>
        <ul>
          <li><strong>No equipment needed</strong> - just write a creative text prompt</li>
          <li><strong>Professional quality</strong> - 4K output with perfect audio sync</li>
          <li><strong>Fast generation</strong> - videos ready in minutes from text alone</li>
          <li><strong>Multiple formats</strong> - perfect for YouTube, TikTok, Instagram</li>
        </ul>
        
        <p>Transform your ideas into relaxing ASMR content with the power of artificial intelligence. Whether you're a content creator looking to expand your repertoire or someone curious about the world of ASMR, our platform provides everything you need to get started.</p>
        
        <p>Ready to begin your ASMR journey? <a href="/create" class="text-purple-600 hover:text-purple-800 font-medium">Create your first AI ASMR video</a> and discover the endless possibilities of AI-generated relaxation content.</p>
      `,
      thumbnail_url: '/api/placeholder/800/400',
      hero_image_url: '/api/placeholder/1200/600',
      published_at: '2024-01-20T10:00:00Z',
      tag: 'Guide',
      status: 'published',
      author: {
        name: 'AI ASMR Team',
        avatar: '/api/placeholder/40/40',
        bio: 'The AI ASMR team is dedicated to advancing the field of AI-generated relaxation content and helping creators discover new possibilities.'
      },
      read_time: '8 min read',
      featured: true,
      meta_title: 'What is ASMR Video? Complete Guide to Relaxing Content Creation',
      meta_description: 'Discover the fascinating world of ASMR videos - from understanding what they are to creating your own AI-generated content. Learn about triggers, benefits, and proven templates.'
    }
  ]

  return mockPosts.find(post => post.slug === slug)
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found - AIASMR Video',
      description: 'The requested blog post could not be found.',
      alternates: {
        canonical: 'https://aiasmr.so/blog',
      },
    }
  }

  return {
    title: post.meta_title || `${post.title} - AIASMR Video`,
    description: post.meta_description || post.excerpt,
    keywords: `ASMR, AI video generation, ${post.tag}, tutorial, guide`,
    alternates: {
      canonical: `https://aiasmr.so/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://aiasmr.so/blog/${params.slug}`,
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
    'what-is-asmr-video-complete-guide'
  ]

  return slugs.map((slug) => ({
    slug,
  }))
}