import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - 获取用户签到状态和历史
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // 获取用户今天是否已签到
    const { data: todayCheckIn } = await supabase
      .from('user_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('check_in_date', today)
      .single();

    // 获取用户统计信息
    const { data: userStats } = await supabase
      .from('user_free_credits_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 获取本月签到记录
    const { data: monthlyCheckIns } = await supabase
      .from('user_check_ins')
      .select('check_in_date, credits_earned, consecutive_days')
      .eq('user_id', user.id)
      .gte('check_in_date', startOfMonth)
      .lte('check_in_date', endOfMonth)
      .order('check_in_date', { ascending: true });

    // 获取签到奖励配置
    const { data: rewards } = await supabase
      .from('check_in_rewards')
      .select('*')
      .eq('is_active', true)
      .order('day_sequence', { ascending: true });

    // 计算下一个签到的奖励
    const currentConsecutiveDays = userStats?.current_consecutive_days || 0;
    const nextDay = (currentConsecutiveDays % 7) + 1; // 7天循环
    const todayReward = rewards?.find(r => r.day_sequence === nextDay)?.credits_reward || 1;

    // 准备日历数据
    const calendar = (monthlyCheckIns || []).map(checkIn => ({
      date: checkIn.check_in_date,
      checked: true,
      reward: checkIn.credits_earned
    }));

    // 准备下周奖励预览
    const nextRewards = rewards?.slice(nextDay - 1, nextDay + 2).map(reward => ({
      day: reward.day_sequence,
      reward: reward.credits_reward,
      isSpecial: reward.is_special_reward
    })) || [];

    const responseData = {
      canCheckIn: !todayCheckIn, // 今天没签到就可以签到
      checkedInToday: !!todayCheckIn,
      consecutiveDays: userStats?.current_consecutive_days || 0,
      longestStreak: userStats?.longest_consecutive_days || 0,
      totalCheckIns: userStats?.total_check_ins || 0,
      todayReward,
      calendar,
      nextRewards
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Check-in GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch check-in data' } },
      { status: 500 }
    );
  }
}

// POST - 执行签到操作
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 检查今天是否已经签到
    const { data: todayCheckIn } = await supabase
      .from('user_check_ins')
      .select('id')
      .eq('user_id', user.id)
      .eq('check_in_date', today)
      .single();

    if (todayCheckIn) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_CHECKED_IN', message: 'Already checked in today' } },
        { status: 400 }
      );
    }

    // 获取用户昨天是否签到（判断连续天数）
    const { data: yesterdayCheckIn } = await supabase
      .from('user_check_ins')
      .select('consecutive_days')
      .eq('user_id', user.id)
      .eq('check_in_date', yesterday)
      .single();

    // 计算连续签到天数
    const consecutiveDays = yesterdayCheckIn ? yesterdayCheckIn.consecutive_days + 1 : 1;

    // 获取奖励配置 (7天循环)
    const rewardDay = ((consecutiveDays - 1) % 7) + 1;
    const { data: rewardConfig } = await supabase
      .from('check_in_rewards')
      .select('credits_reward, is_special_reward')
      .eq('day_sequence', rewardDay)
      .eq('is_active', true)
      .single();

    const creditsEarned = rewardConfig?.credits_reward || 1;
    const isSpecialReward = rewardConfig?.is_special_reward || false;

    // 插入签到记录
    const { data: checkInRecord, error: checkInError } = await supabase
      .from('user_check_ins')
      .insert({
        user_id: user.id,
        check_in_date: today,
        credits_earned: creditsEarned,
        consecutive_days: consecutiveDays,
        is_bonus_reward: isSpecialReward
      })
      .select('id')
      .single();

    if (checkInError) {
      console.error('Check-in insert error:', checkInError);
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to record check-in' } },
        { status: 500 }
      );
    }

    // 使用积分管理系统添加积分
    const { addCredits } = await import('@/lib/credits-manager');
    const creditResult = await addCredits(
      user.id,
      creditsEarned,
      `Daily check-in reward (Day ${consecutiveDays})`,
      'bonus',
      {
        checkInId: checkInRecord?.id,
        freeCreditsType: 'check_in'
      }
    );

    if (!creditResult.success) {
      console.error('Credit addition failed:', creditResult.error);
      // 回滚签到记录
      await supabase
        .from('user_check_ins')
        .delete()
        .eq('id', checkInRecord?.id);
      
      return NextResponse.json(
        { success: false, error: { code: 'CREDIT_ERROR', message: 'Failed to add credits' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        creditsEarned,
        consecutiveDays,
        isSpecialReward,
        message: `Successfully checked in! Earned ${creditsEarned} credits.`
      }
    });

  } catch (error) {
    console.error('Check-in POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process check-in' } },
      { status: 500 }
    );
  }
}