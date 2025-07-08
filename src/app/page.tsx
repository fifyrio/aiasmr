import React from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import FeaturedVideos from '@/components/FeaturedVideos'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <FeaturedVideos />
      <Footer />
    </main>
  )
}