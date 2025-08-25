import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Get actual successful videos count from videos table
    const { count: successfulVideosCount, error: videosCountError } = await supabase
      .from('videos')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'ready');

    if (videosCountError) {
      console.warn('Failed to fetch successful videos count:', videosCountError);
    }

    // Enhance profile with actual successful videos count
    const enhancedProfile = {
      ...profile,
      total_videos_created: successfulVideosCount || 0, // Override with actual count
      total_videos_created_legacy: profile.total_videos_created // Keep legacy field for reference
    };

    return NextResponse.json({
      success: true,
      profile: enhancedProfile,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}