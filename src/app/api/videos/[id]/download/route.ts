import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const { searchParams } = new URL(request.url);
    const proxy = searchParams.get('proxy') === 'true';
    
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

    // If proxy is requested, stream the video file
    if (proxy) {
      try {
        const videoResponse = await fetch(downloadUrl);
        
        if (!videoResponse.ok) {
          throw new Error(`Failed to fetch video: ${videoResponse.status}`);
        }

        const headers = new Headers();
        headers.set('Content-Type', videoResponse.headers.get('Content-Type') || 'video/mp4');
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Copy content length if available
        if (videoResponse.headers.has('Content-Length')) {
          headers.set('Content-Length', videoResponse.headers.get('Content-Length')!);
        }

        return new NextResponse(videoResponse.body, {
          status: 200,
          headers,
        });
      } catch (proxyError) {
        console.error('Proxy download failed:', proxyError);
        return NextResponse.json(
          { error: 'Failed to proxy video download' },
          { status: 500 }
        );
      }
    }

    // Otherwise, return download info
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