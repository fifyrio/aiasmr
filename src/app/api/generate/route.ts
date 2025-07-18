import { NextRequest, NextResponse } from 'next/server';
import { veo2API } from '@/lib/google-veo2';

export async function POST(request: NextRequest) {
  try {
    const { prompt, triggers } = await request.json();

    if (!prompt || !triggers || triggers.length === 0) {
      return NextResponse.json(
        { error: 'Prompt and triggers are required' },
        { status: 400 }
      );
    }

    // 检查环境变量配置
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('Missing Google Cloud configuration');
      return NextResponse.json(
        { error: 'Video generation service is not properly configured' },
        { status: 500 }
      );
    }

    // 检查API配额
    try {
      const quota = await veo2API.checkQuota();
      if (quota.remaining <= 0) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    } catch (quotaError) {
      console.warn('Quota check failed, proceeding with generation:', quotaError);
    }

    // 调用Google Veo2 API生成视频
    let videoUrl: string;
    try {
      videoUrl = await veo2API.generateASMRVideo(prompt, triggers);
    } catch (veo2Error) {
      console.error('Veo2 API error:', veo2Error);
      
      // 如果Veo2 API失败，返回模拟视频（开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock video for development environment');
        videoUrl = `/api/video/mock-${Date.now()}.mp4`;
      } else {
        return NextResponse.json(
          { error: 'Failed to generate video. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
      metadata: {
        prompt,
        triggers,
        generatedAt: new Date().toISOString(),
        provider: 'google-veo2',
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}