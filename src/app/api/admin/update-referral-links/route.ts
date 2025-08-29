import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - 批量更新所有推荐链接格式（从 /auth/signup?ref= 改为 ?ref=）
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 验证管理员权限（这里可以添加更严格的验证）
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 根据环境确定正确的base URL
    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
      baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://www.aiasmr.vip';
    } else {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    }

    // 获取所有需要更新的推荐代码记录
    const { data: referralCodes, error: fetchError } = await supabase
      .from('referral_codes')
      .select('id, user_id, referral_code, referral_link')
      .like('referral_link', '%/auth/signup?ref=%');

    if (fetchError) {
      console.error('Failed to fetch referral codes:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch referral codes' },
        { status: 500 }
      );
    }

    if (!referralCodes || referralCodes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No referral links need updating',
        updated: 0
      });
    }

    console.log(`[UpdateReferralLinks] Found ${referralCodes.length} links to update`);

    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 批量更新每个推荐链接
    for (const referralCode of referralCodes) {
      const newLink = `${baseUrl}?ref=${referralCode.referral_code}`;
      
      console.log(`Updating: ${referralCode.referral_link} → ${newLink}`);

      const { error: updateError } = await supabase
        .from('referral_codes')
        .update({
          referral_link: newLink,
          updated_at: new Date().toISOString()
        })
        .eq('id', referralCode.id);

      if (updateError) {
        console.error(`Failed to update referral code ${referralCode.id}:`, updateError);
        errorCount++;
        errors.push(`User ${referralCode.user_id}: ${updateError.message}`);
      } else {
        updatedCount++;
      }
    }

    const result = {
      success: true,
      message: `Updated ${updatedCount} referral links, ${errorCount} errors`,
      updated: updatedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined
    };

    console.log('[UpdateReferralLinks] Result:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Update referral links error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - 检查需要更新的推荐链接数量
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 查询需要更新的记录数量
    const { count, error: countError } = await supabase
      .from('referral_codes')
      .select('*', { count: 'exact', head: true })
      .like('referral_link', '%/auth/signup?ref=%');

    if (countError) {
      console.error('Failed to count referral codes:', countError);
      return NextResponse.json(
        { success: false, error: 'Failed to count referral codes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      needsUpdate: count || 0,
      message: `${count || 0} referral links need format update`
    });

  } catch (error) {
    console.error('Check referral links error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}