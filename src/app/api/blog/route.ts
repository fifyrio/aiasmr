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
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const tag = searchParams.get('tag')
  const status = searchParams.get('status') || 'published'
  
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        published_at,
        tags,
        status,
        view_count,
        author_id,
        profiles!blog_posts_author_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('status', status)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (tag && tag !== 'all') {
      query = query.contains('tags', [tag])
    }

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blog posts' },
        { status: 500 }
      )
    }

    // Transform data to match frontend expectations
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      thumbnail_url: post.thumbnail_url,
      published_at: post.published_at,
      tag: post.tags?.[0] || 'Article',
      status: post.status,
      view_count: post.view_count,
      author: {
        name: (post.profiles as any)?.full_name || 'Anonymous',
        avatar: (post.profiles as any)?.avatar_url
      },
      read_time: calculateReadTime(post.excerpt || '')
    }))

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total: count,
        hasMore: count ? offset + limit < count : false
      }
    })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      thumbnail_url,
      tags,
      status,
      meta_title,
      meta_description
    } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      )
    }

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert([
        {
          title,
          slug,
          excerpt,
          content,
          thumbnail_url,
          tags: tags || [],
          status: status || 'draft',
          meta_title,
          meta_description,
          author_id: session.user.id,
          published_at: status === 'published' ? new Date().toISOString() : null
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Blog post created successfully',
      post: newPost
    })
  } catch (error) {
    console.error('Error in blog POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateReadTime(text: string): string {
  const wordsPerMinute = 200
  const words = text.split(' ').length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}