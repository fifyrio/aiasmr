import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { videoId, userId } = await request.json();

    if (!videoId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the original video to copy its settings
    const { data: originalVideo, error: fetchError } = await supabase
      .from('videos')
      .select('title, prompt, triggers, category, credit_cost, quality, aspect_ratio, resolution')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !originalVideo) {
      return NextResponse.json(
        { error: 'Original video not found' },
        { status: 404 }
      );
    }

    // Check user has enough credits
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, total_credits_spent')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (userProfile.credits < originalVideo.credit_cost) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Update the original video status to processing
    const { error: updateError } = await supabase
      .from('videos')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Failed to update video status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update video status' },
        { status: 500 }
      );
    }

    // Deduct credits immediately (in a real implementation, you would also call the KIE API here)
    const { error: creditError } = await supabase
      .from('user_profiles')
      .update({ 
        credits: userProfile.credits - originalVideo.credit_cost,
        total_credits_spent: (userProfile.total_credits_spent || 0) + originalVideo.credit_cost
      })
      .eq('id', userId);

    if (creditError) {
      console.error('Failed to deduct credits:', creditError);
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      );
    }

    // Record credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'usage',
        amount: -originalVideo.credit_cost,
        description: `Video regeneration: ${originalVideo.title}`,
        video_id: videoId
      });

    // TODO: In a real implementation, here you would:
    // 1. Call KIE API to regenerate the video
    // 2. Set up polling to check generation status
    // 3. Update video with new URLs when complete

    return NextResponse.json({
      success: true,
      message: 'Video regeneration started'
    });

  } catch (error) {
    console.error('Video regeneration error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate video' },
      { status: 500 }
    );
  }
}