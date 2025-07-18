import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 获取视频信息
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // 如果是Google Cloud Storage URL，需要特殊处理
    if (video.video_url.startsWith('gs://')) {
      // 这里需要实现Google Cloud Storage的下载逻辑
      // 或者返回一个签名的下载URL
      return NextResponse.json({
        success: true,
        downloadUrl: video.video_url,
        filename: `asmr-video-${videoId}.mp4`,
      });
    }

    // 如果是HTTP URL，直接返回
    return NextResponse.json({
      success: true,
      downloadUrl: video.video_url,
      filename: `asmr-video-${videoId}.mp4`,
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to get download link' },
      { status: 500 }
    );
  }
} 