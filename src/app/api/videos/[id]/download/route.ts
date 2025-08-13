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
      .select('id, title, download_url, preview_url, file_size')
      .eq('id', videoId)
      .single();

    if (error || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // 使用 download_url 或者 preview_url 作为下载链接
    const downloadUrl = video.download_url || video.preview_url;
    
    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Video download URL not available' },
        { status: 404 }
      );
    }

    // 生成文件名
    const filename = video.title 
      ? `${video.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.mp4`
      : `asmr-video-${videoId}.mp4`;

    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl,
      filename: filename,
      fileSize: video.file_size,
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to get download link' },
      { status: 500 }
    );
  }
} 