-- 更新数据库SQL语句
-- 用于修复推荐系统中缺少的increment_user_credits函数

-- 1. 创建increment_user_credits函数
CREATE OR REPLACE FUNCTION public.increment_user_credits(
  user_id_param uuid,
  credit_amount integer
)
RETURNS void AS $$
BEGIN
  -- 更新用户积分
  UPDATE public.user_profiles 
  SET credits = credits + credit_amount,
      updated_at = now()
  WHERE id = user_id_param;
  
  -- 如果没有更新任何行，说明用户不存在
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 验证函数是否创建成功
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'increment_user_credits' 
AND routine_schema = 'public';

-- 3. 检查推荐奖励配置是否存在，如果不存在则创建
INSERT INTO public.referral_rewards (
  reward_type, 
  credits_reward, 
  minimum_spending, 
  reward_title, 
  reward_description,
  is_active
) VALUES 
  ('registration', 5, 0, 'Registration Bonus', 'Earn 5 credits when someone signs up with your link', true),
  ('first_payment', 30, 100, 'Payment Conversion', 'Earn 30 credits when referred user makes first purchase', true),
  ('subscription', 50, 1000, 'Subscription Bonus', 'Earn 50 credits when referred user subscribes', true)
ON CONFLICT (reward_type) DO NOTHING;

-- 4. 验证推荐奖励配置
SELECT * FROM public.referral_rewards WHERE is_active = true;

-- 5. 检查推荐码表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'referral_codes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. 检查用户推荐记录表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_referrals' 
AND table_schema = 'public'
ORDER BY ordinal_position;
