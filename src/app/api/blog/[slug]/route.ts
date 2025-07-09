import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail_url,
        published_at,
        tags,
        status,
        view_count,
        meta_title,
        meta_description,
        author_id,
        profiles!blog_posts_author_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', post.id)

    // Transform data to match frontend expectations
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      thumbnail_url: post.thumbnail_url,
      published_at: post.published_at,
      tag: post.tags?.[0] || 'Article',
      status: post.status,
      view_count: (post.view_count || 0) + 1,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      author: {
        name: (post.profiles as any)?.full_name || 'Anonymous',
        avatar: (post.profiles as any)?.avatar_url,
        bio: `${(post.profiles as any)?.full_name || 'Anonymous'} is a content creator and AI enthusiast passionate about making technology accessible to everyone.`
      },
      read_time: calculateReadTime(post.content || ''),
      featured: post.tags?.includes('featured') || false
    }

    return NextResponse.json({ post: transformedPost })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
      excerpt,
      content,
      thumbnail_url,
      tags,
      status,
      meta_title,
      meta_description
    } = body

    // Check if post exists and user has permission
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id, author_id, published_at')
      .eq('slug', params.slug)
      .single()

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    if (existingPost.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (excerpt) updateData.excerpt = excerpt
    if (content) updateData.content = content
    if (thumbnail_url) updateData.thumbnail_url = thumbnail_url
    if (tags) updateData.tags = tags
    if (status) updateData.status = status
    if (meta_title) updateData.meta_title = meta_title
    if (meta_description) updateData.meta_description = meta_description

    // Set published_at if status is changing to published
    if (status === 'published' && !(existingPost as any).published_at) {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', existingPost.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Blog post updated successfully',
      post: updatedPost
    })
  } catch (error) {
    console.error('Error in blog PUT API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if post exists and user has permission
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id, author_id')
      .eq('slug', params.slug)
      .single()

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    if (existingPost.author_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', existingPost.id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Error in blog DELETE API:', error)
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