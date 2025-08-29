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

**IMPORTANT**: Always use the correct table names as defined in database/SUPABASE_DATABASE_DESIGN.sql:

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

## SSR (Server-Side Rendering) Rules

**IMPORTANT**: Prioritize implementing SSR for SEO optimization on public-facing pages.

### Pages that MUST use SSR:
- All public pages (homepage, pricing, faq, terms, privacy, etc.)
- Product pages (/veo3, /create, /explore, etc.)
- Blog and content pages (/blog/*, /ai-asmr-prompts)
- Landing pages and SEO-critical routes

### Pages that should remain Client-Side Rendered:
- `/api/*` routes (API endpoints)
- `/auth/*` pages (authentication flows)
- `/my-videos/` (user dashboard, requires authentication)
- `/admin/*` pages (admin interface)

### Implementation Guidelines:
1. **Extract client-side logic** into separate components with `'use client'`
2. **Use Suspense boundaries** for loading states
3. **Include comprehensive SEO metadata** (title, description, Open Graph, etc.)
4. **Implement structured data (JSON-LD)** for better search engine understanding
5. **Maintain all interactive functionality** while enabling server-side rendering

## Translation Architecture Best Practices

**CRITICAL**: Proper separation of server-side and client-side translation responsibilities to avoid Next-intl FORMATTING_ERROR.

### 🚨 Common Error Pattern (AVOID):
```javascript
// ❌ WRONG: Server-side calling translations with interpolation placeholders
const translations = {
  credits: {
    remaining: t('create.credits.remaining'), // Missing {credits} parameter
    cost: t('create.credits.cost')            // Missing {credits} parameter
  }
}
// Result: IntlError: FORMATTING_ERROR
```

### ✅ Correct Architecture:

#### Server-Side Responsibilities (page.tsx):
```javascript
// ✅ ONLY handle static translations (no interpolation parameters)
const translations = {
  title: t('create.title'),                    // Static text
  subtitle: t('create.subtitle'),              // Static text
  labels: {
    prompt: t('create.prompt.label'),          // Static label
    generate: t('create.generate.button')      // Static button text
  }
  // ❌ DON'T include: t('create.credits.remaining') - requires {credits}
}
```

#### Client-Side Responsibilities (ClientComponent.tsx):
```javascript
// ✅ Handle ALL dynamic translations with real data
import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const tDynamic = useTranslations('create');
  const { credits } = useCredits();
  
  // ✅ Provide actual interpolation parameters
  const creditsText = tDynamic('credits.remaining', { credits: credits.credits });
  const costText = tDynamic('credits.cost', { credits: currentCredits });
  const progressText = tDynamic('progress.processing', { progress: progressPercent });
}
```

### Design Principles:

1. **Server-Side Rendering**:
   - ✅ Static content only (no user-specific data)
   - ✅ SEO metadata and structure
   - ❌ No translations requiring interpolation parameters

2. **Client-Side Rendering**:
   - ✅ All user-specific dynamic content
   - ✅ Real-time data with `useTranslations`
   - ✅ Proper loading states while data loads

3. **Data Flow Architecture**:
   ```
   Server → Static translations → Client
   Client → User data + useTranslations → Dynamic UI
   ```

### Translation Categorization:

| Type | Location | Example | Parameters |
|------|----------|---------|------------|
| **Static** | Server | `t('create.title')` | None |
| **Dynamic** | Client | `tDynamic('credits.remaining', {credits})` | Required |
| **Labels** | Server | `t('create.prompt.label')` | None |
| **Progress** | Client | `tDynamic('progress.processing', {progress})` | Required |

### Loading State Handling:
```javascript
// ✅ Show loading states for dynamic content
{creditsLoading ? 'Loading...' : tDynamic('credits.remaining', { credits: userCredits.credits })}
```

This architecture prevents all Next-intl FORMATTING_ERROR issues and ensures clean separation of concerns.

## Authentication Architecture Issues

**CRITICAL**: Google OAuth login functionality was accidentally removed during internationalization (i18n) implementation.

### Current Status:
- ✅ `AuthContext.tsx` has complete `signInWithGoogle()` implementation
- ✅ `AuthForm.tsx` (older component) has Google login UI and functionality  
- ❌ `LoginForm.tsx` and `SignupForm.tsx` (current components) missing Google login buttons
- ✅ Google OAuth is configured and working in backend/Supabase

### Root Cause:
During the i18n refactor (commit 80e4f88), new internationalized login/signup forms were created but Google login UI was not migrated from the original `AuthForm.tsx`.

### Required Fix:
1. Add Google login button to both `LoginForm.tsx` and `SignupForm.tsx`
2. Import and use `signInWithGoogle` from AuthContext
3. Add proper translation keys for Google login
4. Maintain consistent styling with existing purple theme

### Implementation Priority: HIGH
Google OAuth is a critical UX feature that significantly reduces signup friction. Users expect social login options in modern web applications.

## OAuth Callback Architecture Issues

**CRITICAL**: OAuth callback routes must be carefully configured for internationalized Next.js applications.

### Common Issues Found:

1. **Port Detection Problem**: 
   - OAuth callbacks hardcoded to port 3000
   - Next.js dev server often uses 3001 when 3000 is occupied
   - **Solution**: Dynamic port detection in callback routes

2. **i18n Middleware Interference**:
   - Middleware intercepting `/auth/callback` routes
   - OAuth providers expect exact callback URLs without locale prefixes
   - **Solution**: Exclude OAuth callbacks from i18n middleware matching

3. **Route Structure Conflicts**:
   - New i18n structure uses `/[locale]/auth/*` for user-facing pages
   - OAuth callbacks should remain at `/auth/callback` (no locale prefix)
   - **Solution**: Keep OAuth callbacks at root level, exclude from middleware

### Fixed Configuration:

```typescript
// middleware.ts - Exclude OAuth callbacks
matcher: ['/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',]

// callback/route.ts - Dynamic port detection  
const port = url.port || '3001'; // Detect actual port
redirectUrl = `http://localhost:${port}${next}`;
```

### Key Learnings:
- OAuth callbacks are external integrations and should not be localized
- Always use dynamic port detection in development environments
- Test OAuth flows in development with correct port configuration

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

## Mobile App Architecture Design

*Note: The following section contains architectural design documentation for extending this platform to mobile applications.*

### 📋 Overview
This architecture design describes a complete mobile application implementation for ASMR video generation functionality, based on analysis of this project, providing a secure, scalable frontend-backend separation solution.

### 🔐 Security Architecture Design

#### Three-Layer Architecture Pattern
```
┌─────────────────────┐
│   📱 React Native   │  ← Client (Mobile App)
│      Frontend       │    - User Interface
│                     │    - Local State Management
└─────────────────────┘    - JWT Token Storage
           │
           │ HTTPS + JWT
           ▼
┌─────────────────────┐
│   🔒 Backend API    │  ← Server (Node.js)
│      Server         │    - Business Logic
│                     │    - Authentication
└─────────────────────┘    - API Key Management
           │
           │ Server-to-Server
           ▼
┌─────────────────────┐
│  🌐 External APIs   │  ← Third-party Services
│   KIE • R2 • DB    │    - KIE Video Generation
│                     │    - Cloudflare R2 Storage
└─────────────────────┘    - Supabase Database
```

#### Security Principles
1. **Key Isolation**: All sensitive API keys stored only on backend server
2. **Minimum Privilege**: Mobile client only gets necessary user data access
3. **Request Validation**: All API requests require JWT authentication
4. **Cost Control**: Server controls video generation rate and user quotas
5. **Data Encryption**: HTTPS transmission, encrypted sensitive data storage

### 🛠 Technology Stack

#### Backend API Server
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi/Zod
- **Rate Limiting**: express-rate-limit
- **File Processing**: multer, sharp
- **HTTP Client**: axios
- **Environment**: dotenv

#### Mobile App
- **Framework**: Expo SDK 53 + React Native 0.79.5
- **State Management**: React Context + useReducer
- **HTTP Client**: fetch API + custom wrapper
- **Secure Storage**: expo-secure-store
- **File System**: expo-file-system
- **Navigation**: @react-navigation/native

### 🔄 Module Reuse Analysis

#### ✅ Directly Reusable Core Modules

From this project, the following modules can be reused:

##### 1. KIE API Client (`kie-veo3-client.ts`)
- **Functionality**: Video generation, status query, error handling
- **Reuse Rate**: 95% - only needs environment variable adaptation
- **File Path**: `src/lib/kie-veo3-client.ts`

##### 2. Video Processor (`video-processor.ts`)
- **Functionality**: Download, thumbnail generation, cloud storage upload
- **Reuse Rate**: 90% - needs FFmpeg-related code removal
- **File Path**: `src/lib/video-processor.ts`

##### 3. Credits Management System (`credits-manager.ts`)
- **Functionality**: Credit deduction, refunds, balance queries, transaction records
- **Reuse Rate**: 100% - complete reuse
- **File Path**: `src/lib/credits-manager.ts`

##### 4. R2 Cloud Storage (`r2-upload.ts`)
- **Functionality**: File upload, batch processing
- **Reuse Rate**: 80% - needs FFmpeg dependency removal
- **File Path**: `src/lib/r2-upload.ts`

##### 5. Supabase Integration
- **Functionality**: Database operations, authentication
- **Reuse Rate**: 100% - configuration files completely reusable
- **File Path**: `src/lib/supabase/`

### 🖥 Backend API Design

#### Project Structure
```
backend-api/
├── src/
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── videos.js         # Video management
│   │   ├── generate.js       # Video generation
│   │   └── credits.js        # Credits management
│   ├── services/
│   │   ├── kie-client.js     # KIE API client
│   │   ├── video-processor.js # Video processing
│   │   ├── credits-manager.js # Credits management
│   │   ├── storage.js        # R2 storage
│   │   └── auth-service.js   # Authentication service
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── rate-limit.js     # Request rate limiting
│   │   ├── validation.js     # Input validation
│   │   └── error-handler.js  # Error handling
│   ├── config/
│   │   ├── database.js       # Database configuration
│   │   ├── environment.js    # Environment variables
│   │   └── constants.js      # Constants definition
│   └── utils/
│       ├── logger.js         # Logging utilities
│       └── helpers.js        # Helper functions
├── package.json
├── .env.example
└── server.js                 # Server entry point
```

#### API Endpoints
```http
# Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout

# Video Generation
POST /api/videos/generate      # Initiate video generation
GET  /api/videos/status/:id    # Query generation status
GET  /api/videos               # Get user video list
GET  /api/videos/:id           # Get video details
DELETE /api/videos/:id         # Delete video

# Credits Management
GET  /api/credits/balance      # Get credits balance
GET  /api/credits/history      # Credits usage history
POST /api/credits/purchase     # Purchase credits

# User Management
GET  /api/user/profile         # Get user information
PUT  /api/user/profile         # Update user information
GET  /api/user/statistics      # User statistics data
```

### 📱 Mobile Integration

#### Project Structure
```
src/
├── services/
│   ├── api/
│   │   ├── client.js          # HTTP client wrapper
│   │   ├── auth-api.js        # Authentication API
│   │   ├── video-api.js       # Video API
│   │   └── credits-api.js     # Credits API
│   ├── auth/
│   │   ├── auth-service.js    # Authentication service
│   │   └── token-manager.js   # Token management
│   └── storage/
│       └── secure-storage.js  # Secure storage
├── contexts/
│   ├── AuthContext.js         # Authentication context
│   ├── VideoContext.js        # Video context
│   └── CreditsContext.js      # Credits context
├── hooks/
│   ├── useAuth.js             # Authentication hook
│   ├── useVideoGeneration.js  # Video generation hook
│   └── useCredits.js          # Credits hook
├── screens/
│   ├── VideoGenerationScreen.js
│   ├── VideoListScreen.js
│   └── CreditsScreen.js
└── components/
    ├── VideoPlayer.js
    ├── GenerationProgress.js
    └── CreditBalance.js
```

### 🔐 Security Measures

#### 1. Authentication & Authorization

##### JWT Token Management
```javascript
// services/auth/token-manager.js
import * as SecureStore from 'expo-secure-store';

export const TokenManager = {
  async saveToken(token) {
    await SecureStore.setItemAsync('auth_token', token);
  },

  async getToken() {
    return await SecureStore.getItemAsync('auth_token');
  },

  async clearToken() {
    await SecureStore.deleteItemAsync('auth_token');
  },

  async isTokenValid(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
```

#### 2. Request Rate Limiting
```javascript
// backend/middleware/rate-limit.js
const rateLimit = require('express-rate-limit');

// Video generation rate limit - max 5 per user per hour
const videoGenerationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.user.id,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many video generation requests. Please try again later.'
    }
  }
});
```

#### 3. Input Validation
```javascript
// backend/middleware/validation.js
const Joi = require('joi');

const videoGenerationSchema = Joi.object({
  prompt: Joi.string().min(10).max(500).required(),
  triggers: Joi.array().items(Joi.string().valid(
    'soap', 'sponge', 'ice', 'water', 'honey', 'cubes', 'petals', 'pages'
  )).max(3),
  duration: Joi.number().valid(5, 8).default(5),
  quality: Joi.string().valid('720p', '1080p').default('720p'),
  aspectRatio: Joi.string().valid('16:9', '4:3', '1:1', '3:4', '9:16').default('16:9'),
  imageUrl: Joi.string().uri().optional(),
});
```

### 🚀 Deployment Options

#### Backend API Server Deployment

##### Option 1: Vercel (Recommended)
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

##### Option 2: Railway
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Environment Variables (Extended)

#### Backend Environment Variables
```bash
# .env (Backend)
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key

# KIE API (same as current project)
KIE_API_KEY=your-kie-api-key
KIE_BASE_URL=https://api.kie.ai/api/v1

# Cloudflare R2 (same as current project)
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=asmr-videos
R2_ENDPOINT=https://your-domain.r2.cloudflarestorage.com

# Supabase (same as current project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Application Configuration
BASE_URL=https://your-api-domain.com
CALLBACK_URL=https://your-api-domain.com/api/kie-callback
```

#### Mobile App Configuration
```javascript
// config/environment.js
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key',
  },
  production: {
    API_BASE_URL: 'https://your-api-domain.com',
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key',
  },
};

export default ENV[process.env.NODE_ENV || 'development'];
```

### Template data
src/data/asmr_templates.json
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.