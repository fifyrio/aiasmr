import { NextRequest, NextResponse } from 'next/server';
import { createKieVeo3Client } from '@/lib/kie-veo3-client';

export async function POST(request: NextRequest) {
  try {
    const { prompt, triggers, aspectRatio = '16:9', model = 'veo3', imageUrls } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating video with KIE Veo3 for prompt:', prompt);
    console.log('Selected triggers:', triggers);
    
    // Create KIE Veo3 client
    const kieClient = createKieVeo3Client();
    
    // Enhance prompt with ASMR context
    const asmrPrompt = `ASMR video: ${prompt}. High quality, smooth camera movement, relaxing atmosphere, 4K resolution, soft lighting.`;
    
    // Get base URL for callback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Generate video using KIE Veo3
    const result = await kieClient.generateVideo({
      prompt: asmrPrompt,
      model: model as 'veo3' | 'veo3_fast',
      aspectRatio: aspectRatio as '16:9' | '9:16',
      imageUrls: imageUrls,
      watermark: 'AIASMR',
      callBackUrl: `${baseUrl}/api/kie-callback`
    });

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      metadata: {
        prompt,
        triggers,
        aspectRatio,
        model,
        generatedAt: new Date().toISOString(),
        provider: 'kie-veo3',
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate video' },
      { status: 500 }
    );
  }
}