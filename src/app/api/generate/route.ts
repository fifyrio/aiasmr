import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, triggers } = await request.json();

    if (!prompt || !triggers || triggers.length === 0) {
      return NextResponse.json(
        { error: 'Prompt and triggers are required' },
        { status: 400 }
      );
    }

    // 使用Mock视频跑通流程
    console.log('Generating mock video for prompt:', prompt);
    console.log('Selected triggers:', triggers);
    
    // 模拟API处理时间
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 返回Mock视频URL
    const videoUrl = `https://aiasmr.vip/cut-apple.mp4`;
    const provider = 'mock';

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
      metadata: {
        prompt,
        triggers,
        generatedAt: new Date().toISOString(),
        provider: provider,
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