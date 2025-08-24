import { NextRequest, NextResponse } from 'next/server';
import { createKieVeo3Client } from '@/lib/kie-veo3-client';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/credits-manager';

export async function POST(request: NextRequest) {
  try {
    const { prompt, triggers, aspectRatio = '16:9', duration = 5, quality = '720p', imageUrl, waterMark = '', provider = 'veo3' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate duration/quality combination
    if (duration === 8 && quality === '1080p') {
      return NextResponse.json(
        { error: '8-second videos cannot be generated in 1080p resolution' },
        { status: 400 }
      );
    }

    console.log(`Generating video with KIE ${provider.toUpperCase()} API`);
    console.log('Original prompt:', prompt);
    console.log('Selected triggers:', triggers);
    console.log('Duration:', duration);
    console.log('Quality:', quality);
    console.log('Aspect ratio:', aspectRatio);
    console.log('Image URL:', imageUrl);
    console.log('Water mark:', waterMark);
    console.log('Provider:', provider);
    
    // Create KIE Veo3 client
    const kieClient = createKieVeo3Client();
    
    // Enhance prompt with ASMR context and triggers
    let enhancedPrompt = `ASMR video: ${prompt}`;
    
    // Add trigger-specific enhancements
    if (triggers && triggers.length > 0) {
      const triggerDescriptions = {
        soap: 'soap cutting and squishing sounds',
        sponge: 'sponge squeezing and soft textures',
        ice: 'ice cracking and melting sounds',
        water: 'gentle water flowing and dripping',
        honey: 'viscous honey pouring and dripping',
        cubes: 'satisfying cube cutting and arrangements',
        petals: 'soft flower petals and gentle touches',
        pages: 'paper rustling and page turning sounds'
      };
      
      const triggerEnhancements = triggers
        .map((trigger: string) => triggerDescriptions[trigger as keyof typeof triggerDescriptions])
        .filter(Boolean)
        .join(', ');
      
      if (triggerEnhancements) {
        enhancedPrompt += `, featuring ${triggerEnhancements}`;
      }
    }
    
    enhancedPrompt += '. High quality, smooth camera movement, relaxing atmosphere, 4K resolution, soft lighting, calming ambiance.';
    
    // Get base URL for callback - use production URL in production
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://www.aiasmr.vip'
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Use provider-specific callback URLs
    const callbackUrl = provider === 'veo3' 
      ? `${baseUrl}/api/kie-veo-callback`
      : `${baseUrl}/api/kie-runway-callback`;
    
    console.log('Enhanced prompt:', enhancedPrompt);
    console.log('Callback URL:', callbackUrl);
    
    // Generate video using KIE API (Runway or VEO3)
    const result = await kieClient.generateVideo({
      prompt: enhancedPrompt,
      duration: duration as 5 | 8,
      quality: quality as '720p' | '1080p',
      aspectRatio: aspectRatio as '16:9' | '4:3' | '1:1' | '3:4' | '9:16',
      imageUrl: imageUrl,
      waterMark: waterMark || '',
      callBackUrl: callbackUrl,
      provider: provider as 'runway' | 'veo3'
    });

    console.log('KIE API result:', result);
    
    if (!result || !result.taskId) {
      console.error('Invalid KIE API response - missing taskId:', result);
      throw new Error('KIE API返回无效响应，缺少taskId');
    }

    // Deduct credits immediately after successful KIE API call
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const creditResult = await deductCredits(
        user.id, 
        20, 
        'Video generation',
        result.taskId
      );

      if (!creditResult.success) {
        console.error('Failed to deduct credits:', creditResult.error);
        return NextResponse.json(
          { error: creditResult.error || 'Failed to deduct credits' },
          { status: 400 }
        );
      }

      console.log(`💳 Credits deducted successfully. Remaining: ${creditResult.remainingCredits}`);
    }

    console.log('Video generation initiated and credits deducted...');

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status || 'pending',
      creditsDeducted: 20,
      metadata: {
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        triggers,
        aspectRatio,
        duration,
        quality,
        imageUrl,
        generatedAt: new Date().toISOString(),
        provider: `kie-${provider}`,
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