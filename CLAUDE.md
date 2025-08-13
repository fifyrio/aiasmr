# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI ASMR video generation platform called "AIASMR Video" that allows users to create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos using KIE API integration.

## Current Status

- **Phase**: Active development
- **Implementation**: KIE API integration, credit management, video processing
- **Key Features**: Real-time polling, credit system, Cloudflare R2 storage

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14.0.1 with React 18.2.0 and TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.5 with PostCSS and SCSS
- **Components**: AOS for animations, Swiper for sliders, FSLightbox for modals
- **Icons**: RemixIcon library

### Backend Services
- KIE API integration for video generation
- User authentication and credit management
- Video processing and storage (Cloudflare R2)
- Subscription and payment processing
- Real-time status polling

### Database Schema (Supabase PostgreSQL)

**IMPORTANT**: Always use the correct table names as defined in SUPABASE_DATABASE_DESIGN.sql:

#### Core Tables:
- `user_profiles` (NOT `profiles`) - User information and credits
- `videos` - Video records and metadata
- `credit_transactions` - Credit usage/refund tracking
- `subscriptions` - User subscription management
- `orders` - Payment and purchase records

#### Key Fields Reference:

**user_profiles table:**
```sql
id uuid PRIMARY KEY
email text
credits integer DEFAULT 20
total_credits_spent integer DEFAULT 0
total_videos_created integer DEFAULT 0
plan_type text DEFAULT 'free' CHECK (plan_type = ANY (ARRAY['free', 'basic', 'pro']))
```

**videos table:**
```sql
id uuid PRIMARY KEY
user_id uuid REFERENCES auth.users(id)
title text NOT NULL
prompt text NOT NULL
triggers ARRAY NOT NULL
category text NOT NULL
status text DEFAULT 'processing' CHECK (status = ANY (ARRAY['processing', 'ready', 'failed']))
credit_cost integer NOT NULL
duration text
resolution text DEFAULT '1080p'
quality text DEFAULT '720p' CHECK (quality = ANY (ARRAY['720p', '1080p']))
aspect_ratio text DEFAULT '16:9' CHECK (aspect_ratio = ANY (ARRAY['16:9', '4:3', '1:1', '3:4', '9:16']))
preview_url text
download_url text
thumbnail_url text
file_size bigint
provider text DEFAULT 'kie-runway'
```

**credit_transactions table:**
```sql
id uuid PRIMARY KEY
user_id uuid -- References auth.users(id)
transaction_type text CHECK (transaction_type = ANY (ARRAY['purchase', 'usage', 'refund', 'bonus']))
amount integer NOT NULL
description text
video_id uuid REFERENCES videos(id)
subscription_id uuid REFERENCES subscriptions(id)
```

### Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Video Generation Workflow

1. **User initiates generation** → KIE API call
2. **Immediate credit deduction** → 20 credits from user_profiles.credits
3. **Real-time polling** → Direct KIE API status checks
4. **Success**: Download video + thumbnail → Upload to R2 → Save to videos table
5. **Failure**: Automatic credit refund to user account

## Credit Management

- **Deduction**: Immediate when KIE API call succeeds (20 credits)
- **Refund**: Automatic for failed generations  
- **Tracking**: Complete transaction log in credit_transactions
- **Table**: Use `user_profiles.credits` (NOT `profiles.credits_remaining`)

## Important Implementation Notes

- **Table Names**: Always use `user_profiles` (NOT `profiles`)
- **KIE Integration**: Use provided video_url and image_url (no FFmpeg needed)
- **File Storage**: Cloudflare R2 for both videos and thumbnails
- **Polling**: Direct KIE API polling, no database task tracking
- **Credits**: 20 credits per video generation (Runway cost)

## Environment Variables Required

```env
# KIE API
KIE_API_KEY=your_kie_api_key
KIE_BASE_URL=https://api.kie.ai/api/v1

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_endpoint.com
```