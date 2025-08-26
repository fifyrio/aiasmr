'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogContent from '@/components/BlogContent'

export const dynamic = 'force-dynamic'

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <BlogContent />
      <Footer />
    </main>
  )
}