# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Project name: `ai-asmr-video`
   - Database password: (generate a strong password)
   - Region: (choose closest to your users)

## 2. Get Environment Variables

After project creation, go to Settings > API:

1. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
2. Copy `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Copy `service_role secret key` → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Update .env.local

Replace the placeholder values in `.env.local`:

```env
# Replace with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Generate a random string for NextAuth
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for later setup)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 4. Database Schema (Optional - for later)

When ready, create these tables in Supabase SQL Editor:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video generations table
CREATE TABLE video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  trigger_tags TEXT[],
  status TEXT DEFAULT 'pending',
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own generations" ON video_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations" ON video_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 5. Enable Google OAuth (For Stage 2)

1. Go to Authentication > Providers in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## 6. Test Authentication

After updating `.env.local`:

1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/auth/login`
3. Try email/password signup
4. Check Supabase Auth dashboard for new users

## Troubleshooting

- **Invalid URL Error**: Make sure your `NEXT_PUBLIC_SUPABASE_URL` doesn't have trailing slashes
- **Missing Environment Variables**: Restart your development server after updating `.env.local`
- **Build Errors**: The app requires valid Supabase credentials to build