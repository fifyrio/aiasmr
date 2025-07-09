import React from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function BlogPostNotFound() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="text-purple-600 text-6xl mb-6">
            <i className="ri-article-line"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/blog"
              className="btn-primary inline-flex items-center justify-center"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Blog
            </Link>
            <Link 
              href="/"
              className="btn-secondary inline-flex items-center justify-center"
            >
              <i className="ri-home-line mr-2"></i>
              Go Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}