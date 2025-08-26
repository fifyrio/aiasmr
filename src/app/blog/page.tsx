'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogContent from '@/components/BlogContent'

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <BlogContent />
      <Footer />
    </main>
  )
}