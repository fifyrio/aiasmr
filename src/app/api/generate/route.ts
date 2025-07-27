import { NextRequest, NextResponse } from 'next/server';
import { createKieVeo3Client } from '@/lib/kie-veo3-client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, triggers, aspectRatio = '16:9', duration = 5, quality = '720p', imageUrl } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating video with KIE Runway API');
    console.log('Original prompt:', prompt);
    console.log('Selected triggers:', triggers);
    console.log('Duration:', duration);
    console.log('Quality:', quality);
    console.log('Aspect ratio:', aspectRatio);
    console.log('Image URL:', imageUrl);
    
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
    
    // Get base URL for callback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    console.log('Enhanced prompt:', enhancedPrompt);
    
    // Generate video using KIE Runway API
    const result = await kieClient.generateVideo({
      prompt: enhancedPrompt,
      duration: duration as 5 | 8,
      quality: quality as '720p' | '1080p',
      aspectRatio: aspectRatio as '16:9' | '9:16',
      imageUrl: imageUrl,
      callBackUrl: `${baseUrl}/api/kie-callback`
    });

    console.log('KIE API result:', result);
    
    if (!result || !result.taskId) {
      console.error('Invalid KIE API response - missing taskId:', result);
      throw new Error('KIE API返回无效响应，缺少taskId');
    }

    // Store initial video record in database
    try {
      const supabase = createClient();
      
      // Get current user (optional - you might handle this differently)
      const { data: { user } } = await supabase.auth.getUser();
      
      const videoRecord = {
        task_id: result.taskId,
        user_id: user?.id || null,
        prompt: prompt,
        enhanced_prompt: enhancedPrompt,
        triggers: triggers ? JSON.stringify(triggers) : null,
        aspect_ratio: aspectRatio,
        duration: duration,
        quality: quality,
        image_url: imageUrl || null,
        status: 'pending',
        provider: 'kie-runway',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: dbError } = await supabase
        .from('videos')
        .insert(videoRecord);
      
      if (dbError) {
        console.error('Error storing video record:', dbError);
        // Don't fail the entire request if database insert fails
      } else {
        console.log('Video record stored successfully:', result.taskId);
      }
      
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Continue execution even if database operation fails
    }

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status || 'pending',
      metadata: {
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        triggers,
        aspectRatio,
        duration,
        quality,
        imageUrl,
        generatedAt: new Date().toISOString(),
        provider: 'kie-runway',
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