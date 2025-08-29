require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixReferralLinks() {
  try {
    console.log('开始修复referral links...');
    
    // 获取所有referral codes
    const { data: referralCodes, error } = await supabase
      .from('referral_codes')
      .select('id, referral_code, referral_link');
    
    if (error) {
      console.error('获取referral codes失败:', error);
      return;
    }
    
    console.log(`找到 ${referralCodes.length} 个referral codes`);
    
    let updatedCount = 0;
    const productionBaseUrl = 'https://www.aiasmr.vip';
    
    for (const code of referralCodes) {
      // 检查是否包含localhost
      if (code.referral_link && code.referral_link.includes('localhost')) {
        const newReferralLink = `${productionBaseUrl}/auth/signup?ref=${code.referral_code}`;
        
        console.log(`修复: ${code.referral_link} -> ${newReferralLink}`);
        
        // 更新数据库
        const { error: updateError } = await supabase
          .from('referral_codes')
          .update({ referral_link: newReferralLink })
          .eq('id', code.id);
        
        if (updateError) {
          console.error(`更新失败 (ID: ${code.id}):`, updateError);
        } else {
          updatedCount++;
        }
      }
    }
    
    console.log(`修复完成! 更新了 ${updatedCount} 个referral links`);
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

// 运行修复脚本
fixReferralLinks();
