# AIASMR Video - Supabase 数据库设计文档

## 📋 项目概述

AIASMR Video 是一个基于AI的ASMR视频生成平台，用户可以通过文本提示和触发器选择来生成沉浸式的4K ASMR视频。本文档详细描述了Supabase数据库的完整设计。

## 🗄️ 数据库表结构

### 1. 用户管理相关表

#### 1.1 `profiles` - 用户档案表
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro')),
  credits_remaining INTEGER DEFAULT 20,
  total_credits_spent INTEGER DEFAULT 0,
  total_videos_created INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  language_preference TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.2 `subscriptions` - 订阅管理表
```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.3 `credit_transactions` - 积分交易记录表
```sql
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 视频内容相关表

#### 2.1 `videos` - 视频主表
```sql
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  triggers TEXT[] NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Cutting', 'Water', 'Whisper', 'Object', 'Ice', 'Sponge', 'Soap', 'Honey', 'Petals', 'Pages')),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  credit_cost INTEGER NOT NULL,
  duration TEXT,
  resolution TEXT DEFAULT '1080p',
  thumbnail_url TEXT,
  preview_url TEXT,
  download_url TEXT,
  file_size BIGINT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  generation_started_at TIMESTAMP WITH TIME ZONE,
  generation_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.2 `video_likes` - 视频点赞表
```sql
CREATE TABLE video_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);
```

#### 2.3 `video_shares` - 视频分享表
```sql
CREATE TABLE video_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  share_platform TEXT CHECK (share_platform IN ('twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'other')),
  share_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.4 `video_views` - 视频观看记录表
```sql
CREATE TABLE video_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  view_duration INTEGER, -- 观看时长（秒）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 内容管理相关表

#### 3.1 `categories` - 视频分类表
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  color_gradient TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.2 `triggers` - ASMR触发器表
```sql
CREATE TABLE triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color_gradient TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.3 `blog_posts` - 博客文章表
```sql
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  language TEXT DEFAULT 'en',
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.4 `faqs` - 常见问题表
```sql
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  language TEXT DEFAULT 'en',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 系统管理相关表

#### 4.1 `system_settings` - 系统设置表
```sql
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.2 `user_sessions` - 用户会话表
```sql
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.3 `api_logs` - API调用日志表
```sql
CREATE TABLE api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_body JSONB,
  response_status INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 索引设计

### 性能优化索引
```sql
-- 用户相关索引
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_plan_type ON profiles(plan_type);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- 视频相关索引
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_created_at ON videos(created_at);
CREATE INDEX idx_videos_is_public ON videos(is_public);
CREATE INDEX idx_videos_is_featured ON videos(is_featured);
CREATE INDEX idx_videos_views_count ON videos(views_count DESC);
CREATE INDEX idx_videos_likes_count ON videos(likes_count DESC);

-- 点赞和分享索引
CREATE INDEX idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX idx_video_likes_user_id ON video_likes(user_id);
CREATE INDEX idx_video_shares_video_id ON video_shares(video_id);

-- 观看记录索引
CREATE INDEX idx_video_views_video_id ON video_views(video_id);
CREATE INDEX idx_video_views_created_at ON video_views(created_at);

-- 订阅相关索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- 积分交易索引
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- 博客文章索引
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_language ON blog_posts(language);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- 全文搜索索引
CREATE INDEX idx_videos_title_description_gin ON videos USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_blog_posts_title_content_gin ON blog_posts USING gin(to_tsvector('english', title || ' ' || content));
```

## 🔒 Row Level Security (RLS) 策略

### 启用RLS
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
```

### 用户档案策略
```sql
-- 用户可以查看自己的档案
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的档案
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户可以插入自己的档案
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 视频策略
```sql
-- 公开视频所有人都可以查看
CREATE POLICY "Public videos are viewable by everyone" ON videos
  FOR SELECT USING (is_public = true);

-- 用户可以查看自己的所有视频
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建视频
CREATE POLICY "Users can create videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的视频
CREATE POLICY "Users can update own videos" ON videos
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的视频
CREATE POLICY "Users can delete own videos" ON videos
  FOR DELETE USING (auth.uid() = user_id);
```

### 点赞策略
```sql
-- 用户可以查看所有点赞
CREATE POLICY "Users can view all likes" ON video_likes
  FOR SELECT USING (true);

-- 用户可以创建点赞
CREATE POLICY "Users can create likes" ON video_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的点赞
CREATE POLICY "Users can delete own likes" ON video_likes
  FOR DELETE USING (auth.uid() = user_id);
```

### 订阅策略
```sql
-- 用户可以查看自己的订阅
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建订阅
CREATE POLICY "Users can create subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🔄 触发器函数

### 自动更新时间戳
```sql
-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 自动更新计数器
```sql
-- 更新视频点赞数
CREATE OR REPLACE FUNCTION update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE videos SET likes_count = likes_count + 1 WHERE id = NEW.video_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE videos SET likes_count = likes_count - 1 WHERE id = OLD.video_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_likes_count_trigger
    AFTER INSERT OR DELETE ON video_likes
    FOR EACH ROW EXECUTE FUNCTION update_video_likes_count();

-- 更新用户视频数量
CREATE OR REPLACE FUNCTION update_user_video_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET total_videos_created = total_videos_created + 1 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET total_videos_created = total_videos_created - 1 WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_video_count_trigger
    AFTER INSERT OR DELETE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_user_video_count();
```

## 📊 初始数据

### 插入默认分类
```sql
INSERT INTO categories (name, display_name, icon, color_gradient, description, sort_order) VALUES
('cutting', 'Cutting', '🔪', 'from-red-400 to-pink-400', 'Satisfying cutting and slicing sounds', 1),
('water', 'Water', '💧', 'from-blue-400 to-cyan-400', 'Water droplets and liquid sounds', 2),
('whisper', 'Whisper', '🤫', 'from-purple-400 to-indigo-400', 'Gentle whisper and soft sounds', 3),
('object', 'Object', '📦', 'from-gray-400 to-slate-500', 'Object manipulation and handling', 4),
('ice', 'Ice', '🧊', 'from-cyan-400 to-blue-500', 'Ice crushing and melting sounds', 5),
('sponge', 'Sponge', '🧽', 'from-yellow-400 to-orange-400', 'Sponge squeezing and cleaning', 6),
('soap', 'Soap', '🧼', 'from-green-400 to-emerald-500', 'Soap cutting and foaming', 7),
('honey', 'Honey', '🍯', 'from-amber-400 to-orange-500', 'Honey dripping and flowing', 8),
('petals', 'Petals', '🌸', 'from-pink-400 to-rose-500', 'Flower petals and nature sounds', 9),
('pages', 'Pages', '📄', 'from-brown-400 to-amber-500', 'Page turning and paper sounds', 10);
```

### 插入默认触发器
```sql
INSERT INTO triggers (name, display_name, icon, color_gradient, description, sort_order) VALUES
('soap', 'Soap', '🧼', 'from-blue-400 to-cyan-400', 'Soap cutting and foaming sounds', 1),
('sponge', 'Sponge', '🧽', 'from-yellow-400 to-orange-400', 'Sponge squeezing and cleaning', 2),
('ice', 'Ice', '🧊', 'from-cyan-400 to-blue-500', 'Ice crushing and melting', 3),
('water', 'Water', '💧', 'from-blue-500 to-teal-400', 'Water droplets and liquid', 4),
('honey', 'Honey', '🍯', 'from-amber-400 to-orange-500', 'Honey dripping and flowing', 5),
('cubes', 'Cubes', '⬜', 'from-gray-400 to-slate-500', 'Cube manipulation and stacking', 6),
('petals', 'Petals', '🌸', 'from-pink-400 to-rose-500', 'Flower petals and nature', 7),
('pages', 'Pages', '📄', 'from-green-400 to-emerald-500', 'Page turning and paper', 8);
```

### 插入系统设置
```sql
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('free_plan_credits', '20', 'number', 'Free plan initial credits', true),
('basic_plan_credits', '200', 'number', 'Basic plan monthly credits', true),
('pro_plan_credits', '400', 'number', 'Pro plan monthly credits', true),
('basic_plan_price', '13.9', 'number', 'Basic plan monthly price in USD', true),
('pro_plan_price', '19.9', 'number', 'Pro plan monthly price in USD', true),
('max_prompt_length', '500', 'number', 'Maximum prompt character length', true),
('generation_timeout_minutes', '5', 'number', 'Video generation timeout in minutes', false),
('max_video_duration_seconds', '300', 'number', 'Maximum video duration in seconds', true),
('supported_languages', '["en", "de", "es", "fr", "it", "jp", "kr", "cn"]', 'json', 'Supported languages', true);
```

## 🚀 部署建议

### 1. 数据库配置
- 启用连接池以处理高并发
- 配置适当的连接限制
- 设置合理的查询超时时间

### 2. 性能优化
- 定期分析慢查询
- 监控索引使用情况
- 设置适当的缓存策略

### 3. 备份策略
- 启用自动备份
- 设置跨区域备份
- 定期测试恢复流程

### 4. 监控告警
- 设置数据库性能监控
- 配置错误率告警
- 监控存储使用情况

## 📝 注意事项

1. **数据隐私**: 确保所有用户数据都受到RLS保护
2. **性能考虑**: 对于高流量场景，考虑使用读写分离
3. **扩展性**: 设计支持水平扩展的架构
4. **合规性**: 确保符合GDPR等数据保护法规
5. **安全性**: 定期更新安全策略和访问控制

---

*本文档最后更新: 2024年12月* 