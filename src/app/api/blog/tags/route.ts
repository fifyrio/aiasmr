import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('tags')
      .eq('status', 'published')
      .not('tags', 'is', null)

    if (error) {
      console.error('Error fetching blog tags:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blog tags' },
        { status: 500 }
      )
    }

    // Extract and count unique tags
    const tagCounts: { [key: string]: number } = {}
    
    posts?.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (typeof tag === 'string') {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        })
      }
    })

    // Sort tags by count (descending) and format response
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({
        name: tag,
        count,
        slug: tag.toLowerCase().replace(/\s+/g, '-')
      }))

    return NextResponse.json({
      tags: sortedTags
    })
  } catch (error) {
    console.error('Error in blog tags API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}