# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI ASMR video generation platform called "AIASMR Video" that allows users to create high-quality, AI-powered ASMR videos from text prompts, images, or reference videos. The platform is currently in the planning/documentation phase.

## Current Status

- **Phase**: Planning and documentation
- **Implementation**: Not yet started
- **Key Documents**: 
  - `doc.md` - Complete Product Requirements Document
  - `技术栈.md` - Technology stack reference

## Planned Architecture

Based on the PRD and tech stack documentation:

### Frontend (Next.js)
- **Framework**: Next.js 14.0.1 with React 18.2.0 and TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.5 with PostCSS and SCSS
- **Components**: AOS for animations, Swiper for sliders, FSLightbox for modals
- **Icons**: RemixIcon library

### Core Pages Structure
- Home Page: Hero section, featured videos, CTAs
- Create Page: Prompt input, trigger selection, generation progress
- Explore Page: Video grid with filters and interactions
- Pricing Page: Three-tier subscription plans
- Blog Page: Educational content for SEO

### Backend Services (Planned)
- User authentication and credit management
- AI generation pipeline with queue-based processing
- Video storage and metadata management
- Subscription and payment processing (Stripe/PayPal)
- Multi-language support (8+ languages)

### Development Commands (When Implemented)

Since this is a Next.js project, these will be the standard commands:
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks (if configured)
```

## Key Features to Implement

1. **AI Generation Pipeline**: Text/image to ASMR video conversion
2. **Credit System**: Usage-based access control
3. **Multi-tier Subscriptions**: Free, Basic ($13.9/month), Pro ($19.9/month)
4. **Video Management**: 4K output, looped content, download capabilities
5. **Internationalization**: Support for EN/DE/ES/FR/IT/JP/KR/CN

## Development Phases

1. **Phase 1 (MVP)**: Create page, AI backend, user auth, video generation
2. **Phase 2**: Explore page, blog system, FAQ
3. **Phase 3**: Subscriptions, payments, multi-language
4. **Phase 4**: SEO optimization, CDN, analytics

## Technical Considerations

- Performance: Support thousands of concurrent users
- Security: HTTPS, input sanitization, JWT authentication
- Scalability: Modular AI model expansion
- Monitoring: Error logging, payment tracking
- Storage: AWS S3 + CDN for media delivery
- Database: PostgreSQL + Redis for caching/queuing

## Important Notes

- Age restriction: 18+ users only
- Commercial use only for paid users
- Average generation time: 1-2 minutes (up to 4 during peak)
- 7-day refund policy for subscriptions
- Email-only support: support@aiasmr.vip