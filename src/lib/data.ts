import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 创建服务端Supabase客户端
function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
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
}

// 视频类型定义
export interface FeaturedVideo {
  id: string
  title: string
  description: string
  thumbnail_url: string
  preview_url: string
  category: string
  duration: string
  views_count: number
  likes_count: number
  is_featured: boolean
  is_public: boolean
  created_at: string
  author?: {
    full_name: string
    avatar_url?: string
  }
}

// 获取精选视频数据
export async function getFeaturedVideos(): Promise<FeaturedVideo[]> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        preview_url,
        category,
        duration,
        views_count,
        likes_count,
        is_featured,
        is_public,
        created_at,
        user_profiles!videos_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'ready')
      .eq('is_public', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching featured videos:', error)
      return getFallbackVideos()
    }

    // 转换数据格式
    const transformedVideos: FeaturedVideo[] = (videos || []).map(video => ({
      id: video.id,
      title: video.title,
      description: video.description || '',
      thumbnail_url: video.thumbnail_url || '/api/placeholder/400/300',
      preview_url: video.preview_url || '/api/placeholder/video/1',
      category: video.category,
      duration: video.duration || '0:00',
      views_count: video.views_count || 0,
      likes_count: video.likes_count || 0,
      is_featured: video.is_featured,
      is_public: video.is_public,
      created_at: video.created_at,
      author: video.user_profiles ? {
        full_name: (video.user_profiles as any).full_name || 'Anonymous',
        avatar_url: (video.user_profiles as any).avatar_url
      } : undefined
    }))

    // 如果没有数据，返回fallback数据
    return transformedVideos.length > 0 ? transformedVideos : getFallbackVideos()

  } catch (error) {
    console.error('Failed to fetch featured videos:', error)
    return getFallbackVideos()
  }
}

// Fallback数据，确保页面始终有内容显示
function getFallbackVideos(): FeaturedVideo[] {
  return [
    {
      id: 'fallback-1',
      title: 'Honey Dripping',
      description: 'Sweet honey dripping ASMR with golden visuals',
      thumbnail_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Honey Dripping-1755053009500-ze5ex5.jpg',
      preview_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Honey Dripping-1755053009500-six44h.mp4',
      category: 'Object',
      duration: '4:25',
      views_count: 15200,
      likes_count: 1800,
      is_featured: true,
      is_public: true,
      created_at: new Date().toISOString(),
      author: {
        full_name: 'Sweet ASMR',
        avatar_url: '/api/placeholder/40/40'
      }
    },
    {
      id: 'fallback-2',
      title: 'Ice Crushing',
      description: 'Satisfying ice crushing and breaking sounds',
      thumbnail_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Ice Crushing-1755053014121-ejgufi.jpg',
      preview_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Ice Crushing-1755053014121-spq0f3.mp4',
      category: 'Ice',
      duration: '2:58',
      views_count: 11700,
      likes_count: 1100,
      is_featured: true,
      is_public: true,
      created_at: new Date().toISOString(),
      author: {
        full_name: 'Ice ASMR',
        avatar_url: '/api/placeholder/40/40'
      }
    },
    {
      id: 'fallback-3',
      title: 'Page Turning',
      description: 'Gentle page turning sounds from vintage books',
      thumbnail_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Page Turning-1755053018541-m8a4t3.jpg',
      preview_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Page Turning-1755053018541-x278su.mp4',
      category: 'Pages',
      duration: '6:12',
      views_count: 7300,
      likes_count: 654,
      is_featured: true,
      is_public: true,
      created_at: new Date().toISOString(),
      author: {
        full_name: 'Book ASMR',
        avatar_url: '/api/placeholder/40/40'
      }
    },
    {
      id: 'fallback-4',
      title: 'Soap Cutting ASMR',
      description: 'Satisfying soap cutting sounds with colorful soaps',
      thumbnail_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Soap Cutting ASMR-1755053021439-xs0t66.jpg',
      preview_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Soap Cutting ASMR-1755053021439-1qb6z5.mp4',
      category: 'Cutting',
      duration: '3:42',
      views_count: 12500,
      likes_count: 1200,
      is_featured: true,
      is_public: true,
      created_at: new Date().toISOString(),
      author: {
        full_name: 'ASMR Creator',
        avatar_url: '/api/placeholder/40/40'
      }
    },
    {
      id: 'fallback-5',
      title: 'Sponge Squeezing',
      description: 'Colorful sponge squeezing with water sounds',
      thumbnail_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Sponge Squeezing-1755053025168-wj4vfl.jpg',
      preview_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Sponge Squeezing-1755053025168-u6w4z4.mp4',
      category: 'Sponge',
      duration: '4:33',
      views_count: 9800,
      likes_count: 967,
      is_featured: true,
      is_public: true,
      created_at: new Date().toISOString(),
      author: {
        full_name: 'Sponge ASMR',
        avatar_url: '/api/placeholder/40/40'
      }
    },
    {
      id: 'fallback-6',
      title: 'Water Droplets',
      description: 'Relaxing water droplet sounds on different surfaces',
      thumbnail_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Water Droplets-1755053027738-2ri2pf.jpg',
      preview_url: 'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Water Droplets-1755053027738-q9s6zi.mp4',
      category: 'Water',
      duration: '5:18',
      views_count: 8900,
      likes_count: 892,
      is_featured: true,
      is_public: true,
      created_at: new Date().toISOString(),
      author: {
        full_name: 'Nature Sounds',
        avatar_url: '/api/placeholder/40/40'
      }
    }
  ]
}

// 获取网站统计数据
export async function getSiteStats() {
  try {
    const supabase = createServerSupabaseClient()
    
    const [videosCount, usersCount, totalViews] = await Promise.all([
      supabase
        .from('videos')
        .select('id', { count: 'exact' })
        .eq('status', 'ready')
        .eq('is_public', true),
      
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' }),
      
      supabase
        .from('videos')
        .select('views_count')
        .eq('status', 'ready')
        .eq('is_public', true)
    ])

    const totalViewsSum = totalViews.data?.reduce((sum, video) => sum + (video.views_count || 0), 0) || 0

    return {
      totalVideos: videosCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalViews: totalViewsSum,
      error: null
    }
  } catch (error) {
    console.error('Failed to fetch site stats:', error)
    return {
      totalVideos: 0,
      totalUsers: 0,
      totalViews: 0,
      error: 'Failed to fetch stats'
    }
  }
}

// 格式化数字显示
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}