import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const videoId = params.id;

    // Check if video belongs to user
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('id, user_id')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !video) {
      return NextResponse.json(
        { error: 'Video not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the video
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Video deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}