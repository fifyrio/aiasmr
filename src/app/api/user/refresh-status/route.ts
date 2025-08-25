import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
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

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent completed order if no subscription
    let recentOrder = null;
    if (subError) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!orderError) {
        recentOrder = orderData;
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        credits: profile.credits || 0,
        planType: profile.plan_type || 'free',
        totalCreditsSpent: profile.total_credits_spent || 0,
        totalVideosCreated: successfulVideosCount || 0 // Use actual count from videos table
      },
      subscription: subscription || null,
      recentOrder: recentOrder || null
    });

  } catch (error) {
    console.error('Error refreshing user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}