-- Free Credits System Database Schema
-- AIASMR Video Platform - Free Credits功能数据库设计
-- 包含每日签到、推荐奖励、统计功能

-- ===============================
-- 1. 每日签到系统表
-- ===============================

-- 用户签到记录表
CREATE TABLE public.user_check_ins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  check_in_date date NOT NULL,
  credits_earned integer NOT NULL DEFAULT 1,
  consecutive_days integer NOT NULL DEFAULT 1,
  is_bonus_reward boolean DEFAULT false, -- 连续签到奖励标识
  timezone text DEFAULT 'UTC', -- 用户时区
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_check_ins_pkey PRIMARY KEY (id),
  CONSTRAINT user_check_ins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, check_in_date)
);

-- 签到奖励配置表
CREATE TABLE public.check_in_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  day_sequence integer NOT NULL, -- 连续签到第N天 (1-7循环)
  credits_reward integer NOT NULL,
  is_special_reward boolean DEFAULT false,
  reward_title text,
  reward_description text,
  icon text, -- 奖励图标
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT check_in_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT unique_day_sequence UNIQUE (day_sequence),
  CONSTRAINT check_day_sequence_range CHECK (day_sequence >= 1 AND day_sequence <= 7)
);

-- ===============================
-- 2. 推荐奖励系统表
-- ===============================

-- 推荐代码表
CREATE TABLE public.referral_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  referral_link text NOT NULL,
  total_referrals integer DEFAULT 0,
  successful_referrals integer DEFAULT 0,
  total_credits_earned integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referral_codes_pkey PRIMARY KEY (id),
  CONSTRAINT referral_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_referral_code UNIQUE (user_id)
);

-- 推荐记录表
CREATE TABLE public.user_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL, -- 推荐人
  referred_user_id uuid, -- 被推荐人（注册后填入）
  referral_code text NOT NULL,
  referred_email text, -- 被推荐人邮箱
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'registered', 'converted', 'credited'])),
  credits_awarded integer DEFAULT 0,
  conversion_date timestamp with time zone, -- 转换为付费用户时间
  credited_date timestamp with time zone, -- 奖励发放时间
  ip_address inet,
  user_agent text,
  utm_source text, -- 推荐来源跟踪
  utm_medium text,
  utm_campaign text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_referrals_pkey PRIMARY KEY (id),
  CONSTRAINT user_referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 推荐奖励配置表
CREATE TABLE public.referral_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reward_type text NOT NULL CHECK (reward_type = ANY (ARRAY['registration', 'first_payment', 'subscription'])),
  credits_reward integer NOT NULL,
  minimum_spending integer DEFAULT 0, -- 最低消费要求（分）
  reward_title text,
  reward_description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referral_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT unique_reward_type UNIQUE (reward_type)
);

-- ===============================
-- 3. 用户活动统计表
-- ===============================

-- 用户Free Credits活动统计表
CREATE TABLE public.user_free_credits_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- 签到统计
  total_check_ins integer DEFAULT 0,
  current_consecutive_days integer DEFAULT 0,
  longest_consecutive_days integer DEFAULT 0,
  last_check_in_date date,
  total_check_in_credits integer DEFAULT 0,
  
  -- 推荐统计
  total_referrals_sent integer DEFAULT 0,
  successful_referrals integer DEFAULT 0,
  pending_referrals integer DEFAULT 0,
  total_referral_credits integer DEFAULT 0,
  
  -- 总计
  total_free_credits_earned integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_free_credits_stats_pkey PRIMARY KEY (id),
  CONSTRAINT user_free_credits_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_stats UNIQUE (user_id)
);

-- ===============================
-- 4. 索引优化
-- ===============================

-- 签到记录索引
CREATE INDEX idx_user_check_ins_user_id ON public.user_check_ins(user_id);
CREATE INDEX idx_user_check_ins_date ON public.user_check_ins(check_in_date DESC);
CREATE INDEX idx_user_check_ins_user_date ON public.user_check_ins(user_id, check_in_date DESC);

-- 推荐记录索引
CREATE INDEX idx_user_referrals_referrer_id ON public.user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referred_user_id ON public.user_referrals(referred_user_id);
CREATE INDEX idx_user_referrals_status ON public.user_referrals(status);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);

-- 推荐代码索引
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(referral_code);

-- ===============================
-- 5. 默认配置数据
-- ===============================

-- 插入默认签到奖励配置 (7天循环)
INSERT INTO public.check_in_rewards (day_sequence, credits_reward, reward_title, reward_description, is_special_reward) VALUES
(1, 1, 'Daily Bonus', 'Complete your first day check-in', false),
(2, 1, 'Day 2 Reward', 'Keep the streak going!', false),
(3, 2, 'Day 3 Bonus', 'Three days strong!', false),
(4, 2, 'Day 4 Reward', 'Consistency pays off', false),
(5, 3, 'Day 5 Bonus', 'Almost there!', false),
(6, 3, 'Day 6 Reward', 'One more day to weekly bonus', false),
(7, 5, 'Weekly Jackpot', 'Amazing! 7 days completed!', true);

-- 插入默认推荐奖励配置
INSERT INTO public.referral_rewards (reward_type, credits_reward, minimum_spending, reward_title, reward_description) VALUES
('registration', 5, 0, 'Registration Bonus', 'Earn 5 credits when someone signs up with your link'),
('first_payment', 30, 100, 'Payment Conversion', 'Earn 30 credits when referred user makes first purchase'),
('subscription', 50, 1000, 'Subscription Bonus', 'Earn 50 credits when referred user subscribes');

-- ===============================
-- 6. RLS (Row Level Security) 策略
-- ===============================

-- Enable RLS on all tables
ALTER TABLE public.user_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_free_credits_stats ENABLE ROW LEVEL SECURITY;

-- 用户签到记录 RLS
CREATE POLICY "Users can view own check-ins" ON public.user_check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins" ON public.user_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 推荐代码 RLS
CREATE POLICY "Users can view own referral codes" ON public.referral_codes
  FOR ALL USING (auth.uid() = user_id);

-- 推荐记录 RLS
CREATE POLICY "Users can view own referrals" ON public.user_referrals
  FOR SELECT USING (
    auth.uid() = referrer_id OR 
    auth.uid() = referred_user_id
  );

CREATE POLICY "Users can insert referrals" ON public.user_referrals
  FOR INSERT WITH CHECK (true); -- 允许通过推荐链接注册

-- 用户统计 RLS
CREATE POLICY "Users can view own stats" ON public.user_free_credits_stats
  FOR ALL USING (auth.uid() = user_id);

-- ===============================
-- 7. 触发器和函数
-- ===============================

-- 更新用户统计的函数
CREATE OR REPLACE FUNCTION public.update_user_free_credits_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 插入或更新用户统计
  INSERT INTO public.user_free_credits_stats (
    user_id,
    total_check_ins,
    current_consecutive_days,
    longest_consecutive_days,
    last_check_in_date,
    total_check_in_credits,
    total_free_credits_earned
  )
  VALUES (
    NEW.user_id,
    1,
    NEW.consecutive_days,
    NEW.consecutive_days,
    NEW.check_in_date,
    NEW.credits_earned,
    NEW.credits_earned
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_check_ins = user_free_credits_stats.total_check_ins + 1,
    current_consecutive_days = NEW.consecutive_days,
    longest_consecutive_days = GREATEST(user_free_credits_stats.longest_consecutive_days, NEW.consecutive_days),
    last_check_in_date = NEW.check_in_date,
    total_check_in_credits = user_free_credits_stats.total_check_in_credits + NEW.credits_earned,
    total_free_credits_earned = user_free_credits_stats.total_free_credits_earned + NEW.credits_earned,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 签到记录插入后触发统计更新
CREATE TRIGGER trigger_update_checkin_stats
  AFTER INSERT ON public.user_check_ins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_free_credits_stats();

-- 生成推荐码的函数
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id_param uuid)
RETURNS text AS $$
DECLARE
  code_length constant int := 8;
  possible_chars constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
  existing_code_count int;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..code_length LOOP
      result := result || substr(possible_chars, floor(random() * length(possible_chars) + 1)::int, 1);
    END LOOP;
    
    SELECT COUNT(*) INTO existing_code_count 
    FROM public.referral_codes 
    WHERE referral_code = result;
    
    EXIT WHEN existing_code_count = 0;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 自动为新用户创建推荐码的函数
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code text;
  base_url text := 'https://aiasmr.video';
BEGIN
  new_code := public.generate_referral_code(NEW.id);
  
  INSERT INTO public.referral_codes (
    user_id,
    referral_code,
    referral_link
  ) VALUES (
    NEW.id,
    new_code,
    base_url || '/register?ref=' || new_code
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 用户注册后自动创建推荐码
CREATE TRIGGER trigger_create_referral_code
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_referral_code();

-- ===============================
-- 8. 扩展credit_transactions表
-- ===============================

-- 为现有的credit_transactions表添加Free Credits相关字段
ALTER TABLE public.credit_transactions 
ADD COLUMN IF NOT EXISTS check_in_id uuid REFERENCES public.user_check_ins(id),
ADD COLUMN IF NOT EXISTS referral_id uuid REFERENCES public.user_referrals(id),
ADD COLUMN IF NOT EXISTS free_credits_type text CHECK (free_credits_type = ANY (ARRAY['check_in', 'referral', 'bonus']));

-- 为Free Credits交易创建索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_checkin ON public.credit_transactions(check_in_id) WHERE check_in_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_credit_transactions_referral ON public.credit_transactions(referral_id) WHERE referral_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_credit_transactions_free_type ON public.credit_transactions(free_credits_type) WHERE free_credits_type IS NOT NULL;

-- ===============================
-- 9. 视图用于查询优化
-- ===============================

-- 用户签到统计视图
CREATE OR REPLACE VIEW public.v_user_checkin_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(s.total_check_ins, 0) as total_check_ins,
  COALESCE(s.current_consecutive_days, 0) as current_consecutive_days,
  COALESCE(s.longest_consecutive_days, 0) as longest_consecutive_days,
  s.last_check_in_date,
  COALESCE(s.total_check_in_credits, 0) as total_check_in_credits,
  CASE 
    WHEN s.last_check_in_date = CURRENT_DATE THEN true 
    ELSE false 
  END as checked_in_today
FROM auth.users u
LEFT JOIN public.user_free_credits_stats s ON u.id = s.user_id;

-- 用户推荐统计视图
CREATE OR REPLACE VIEW public.v_user_referral_summary AS
SELECT 
  u.id as user_id,
  u.email,
  rc.referral_code,
  rc.referral_link,
  COALESCE(rc.total_referrals, 0) as total_referrals,
  COALESCE(rc.successful_referrals, 0) as successful_referrals,
  COALESCE(rc.total_credits_earned, 0) as total_referral_credits,
  COALESCE(s.pending_referrals, 0) as pending_referrals
FROM auth.users u
LEFT JOIN public.referral_codes rc ON u.id = rc.user_id
LEFT JOIN public.user_free_credits_stats s ON u.id = s.user_id;

-- ===============================
-- 10. 用户积分管理函数
-- ===============================

-- 增加用户积分的函数
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