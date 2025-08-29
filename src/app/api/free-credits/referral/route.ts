import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - 获取用户推荐数据
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

    // 获取或创建用户推荐代码
    let { data: referralCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 如果用户没有推荐代码，创建一个
    if (!referralCode) {
      const code = await generateReferralCode();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiasmr.vip';
      const referralLink = `${baseUrl}/auth/signup?ref=${code}`;

      const { data: newReferralCode, error: insertError } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          referral_code: code,
          referral_link: referralLink
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create referral code:', insertError);
        return NextResponse.json(
          { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create referral code' } },
          { status: 500 }
        );
      }

      referralCode = newReferralCode;
    }

    // 获取推荐统计
    const { data: referralStats } = await supabase
      .from('user_referrals')
      .select('status, credits_awarded, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    // 获取最近推荐记录（脱敏邮箱）
    const { data: recentReferrals } = await supabase
      .from('user_referrals')
      .select('referred_email, status, credits_awarded, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // 计算统计数据
    const stats = {
      completed: referralStats?.filter(r => r.status === 'credited').length || 0,
      pending: referralStats?.filter(r => ['pending', 'registered', 'converted'].includes(r.status)).length || 0,
      earned: referralStats?.reduce((sum, r) => sum + (r.credits_awarded || 0), 0) || 0
    };

    const responseData = {
      referralCode: referralCode.referral_code,
      referralLink: referralCode.referral_link,
      totalReferrals: referralCode.total_referrals,
      successfulReferrals: referralCode.successful_referrals,
      pendingReferrals: stats.pending,
      totalCreditsEarned: referralCode.total_credits_earned,
      stats,
      recentReferrals: recentReferrals?.map(r => ({
        email: r.referred_email || 'anonymous@user.com',
        status: r.status,
        creditsEarned: r.credits_awarded || 0,
        createdAt: r.created_at
      })) || []
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Referral GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch referral data' } },
      { status: 500 }
    );
  }
}

// POST - 记录推荐邀请（当用户分享链接时可选调用）
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { email, platform } = await request.json();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // 获取用户推荐代码
    const { data: referralCode } = await supabase
      .from('referral_codes')
      .select('referral_code')
      .eq('user_id', user.id)
      .single();

    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_REFERRAL_CODE', message: 'No referral code found' } },
        { status: 400 }
      );
    }

    // 可选：记录分享行为（用于统计分析）
    if (email) {
      // 检查是否已经邀请过这个邮箱
      const { data: existingReferral } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('referred_email', email)
        .single();

      if (!existingReferral) {
        // 记录新的推荐邀请
        const { error: referralError } = await supabase
          .from('user_referrals')
          .insert({
            referrer_id: user.id,
            referral_code: referralCode.referral_code,
            referred_email: email,
            status: 'pending'
          });

        if (referralError) {
          console.error('Failed to record referral:', referralError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Referral recorded successfully'
    });

  } catch (error) {
    console.error('Referral POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record referral' } },
      { status: 500 }
    );
  }
}

// 生成唯一的推荐代码
async function generateReferralCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8;
  
  // 简单的代码生成逻辑，实际生产中应该确保唯一性
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}