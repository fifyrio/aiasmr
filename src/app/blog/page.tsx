import React from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogContent from '@/components/BlogContent'

export const metadata = {
  title: 'Blog - AIASMR Video | AI ASMR Video Generation Tips & Guides',
  description: 'Explore guides, tips, and insights for creating stunning ASMR videos with AI technology. Learn about ASMR video generation, techniques, and best practices.',
  keywords: 'ASMR blog, AI video generation, ASMR tips, video creation guides, AI ASMR tutorials',
  alternates: {
    canonical: 'https://aiasmr.so/blog',
  },
  openGraph: {
    title: 'Blog - AIASMR Video',
    description: 'Explore guides, tips, and insights for creating stunning ASMR videos with AI technology',
    type: 'website',
    url: 'https://aiasmr.so/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - AIASMR Video',
    description: 'Explore guides, tips, and insights for creating stunning ASMR videos with AI technology',
  }
}

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <BlogContent />
      <Footer />
    </main>
  )
}