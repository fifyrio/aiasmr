import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - 处理通过推荐链接注册的用户
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { referralCode, newUserId } = await request.json();
    
    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_PARAMS', message: 'Referral code and user ID required' } },
        { status: 400 }
      );
    }

    // 查找推荐代码对应的推荐人
    const { data: referralCodeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('user_id, referral_code, total_referrals')
      .eq('referral_code', referralCode)
      .eq('is_active', true)
      .single();

    if (codeError || !referralCodeData) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REFERRAL_CODE', message: 'Invalid or inactive referral code' } },
        { status: 400 }
      );
    }

    // 检查新用户是否已经被推荐过（防止重复奖励）
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single();

    if (existingReferral) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_REFERRED', message: 'User already has a referrer' } },
        { status: 400 }
      );
    }

    // 获取新注册用户信息
    const { data: newUserProfile } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', newUserId)
      .single();

    // 记录推荐关系
    const { error: referralError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: referralCodeData.user_id,
        referred_user_id: newUserId,
        referral_code: referralCode,
        referred_email: newUserProfile?.email,
        status: 'registered',
        ip_address: request.ip,
        utm_source: 'referral_link'
      });

    if (referralError) {
      console.error('Failed to create referral record:', referralError);
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to record referral' } },
        { status: 500 }
      );
    }

    // 更新推荐代码统计
    const { error: updateError } = await supabase
      .from('referral_codes')
      .update({ 
        total_referrals: referralCodeData.total_referrals + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', referralCodeData.user_id);

    if (updateError) {
      console.error('Failed to update referral code stats:', updateError);
    }

    // 检查是否有注册奖励
    const { data: registrationReward } = await supabase
      .from('referral_rewards')
      .select('credits_reward')
      .eq('reward_type', 'registration')
      .eq('is_active', true)
      .single();

    // 如果有注册奖励，立即发放
    if (registrationReward && registrationReward.credits_reward > 0) {
      await processReferralReward({
        referrerId: referralCodeData.user_id,
        referredUserId: newUserId,
        rewardType: 'registration',
        creditsReward: registrationReward.credits_reward,
        supabase
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        referrerId: referralCodeData.user_id,
        registrationReward: registrationReward?.credits_reward || 0,
        message: 'Referral recorded successfully'
      }
    });

  } catch (error) {
    console.error('Referral registration error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process referral registration' } },
      { status: 500 }
    );
  }
}

// 处理推荐奖励发放
async function processReferralReward({
  referrerId,
  referredUserId,
  rewardType,
  creditsReward,
  supabase
}: {
  referrerId: string;
  referredUserId: string;
  rewardType: string;
  creditsReward: number;
  supabase: any;
}) {
  try {
    // 更新用户积分
    const { error: creditError } = await supabase.rpc('increment_user_credits', {
      user_id_param: referrerId,
      credit_amount: creditsReward
    });

    if (creditError) {
      console.error('Failed to update referrer credits:', creditError);
      return;
    }

    // 记录积分交易
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: referrerId,
        transaction_type: 'bonus',
        amount: creditsReward,
        description: `Referral ${rewardType} reward`,
        free_credits_type: 'referral'
      });

    if (transactionError) {
      console.error('Failed to record referral transaction:', transactionError);
    }

    // 更新推荐记录状态
    const { error: updateReferralError } = await supabase
      .from('user_referrals')
      .update({
        status: 'credited',
        credits_awarded: creditsReward,
        credited_date: new Date().toISOString()
      })
      .eq('referrer_id', referrerId)
      .eq('referred_user_id', referredUserId);

    if (updateReferralError) {
      console.error('Failed to update referral status:', updateReferralError);
    }

    // 更新推荐代码统计
    const { error: updateCodeError } = await supabase
      .from('referral_codes')
      .update({
        successful_referrals: supabase.raw('successful_referrals + 1'),
        total_credits_earned: supabase.raw(`total_credits_earned + ${creditsReward}`),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', referrerId);

    if (updateCodeError) {
      console.error('Failed to update referral code stats:', updateCodeError);
    }

    console.log(`Referral reward processed: ${creditsReward} credits to ${referrerId}`);

  } catch (error) {
    console.error('Error processing referral reward:', error);
  }
}