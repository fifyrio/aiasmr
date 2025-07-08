# AIASMR Video – Pricing Page Requirements

## 🎯 Purpose

Display clear, comparative subscription options for AIASMR Video to encourage trial, upgrade, and professional plan purchases. Support users with transparent pricing, feature breakdowns, and call-to-action buttons.

---

## 1. Plan Overview

The pricing page presents **three** tiers:

### 1.1 AI ASMR Trial
- **Price**: $7.9 (original $9.9)
- **Credits**: 100 credits (one-time)
- **Video Limit**: 10 videos
- **Cost Breakdown**:
  - $0.79 per video
  - $0.079 per credit
- **Key Features**:
  - Google Veo 3 ASMR support
  - Max 8s video duration
  - 720p resolution
  - Binaural audio effects
  - ASMR trigger library
  - ❌ No commercial usage rights
- **CTA Button**: “Try AI ASMR ⚡”

### 1.2 AI ASMR Basic
- **Price**: $19.9/month (original $24.9)
- **Credits**: 301/month
- **Video Limit**: 30 videos
- **Cost Breakdown**:
  - $0.66 per video
  - $0.066 per credit
- ⚠️ *Note: Price increase coming soon*
- **Key Features**:
  - Google Veo 3 ASMR support
  - Max 8s video duration
  - 720p resolution
  - Whisper & voice sync
  - Binaural audio effects
  - ASMR trigger library
  - ✅ Commercial usage rights
  - Standard processing
  - Basic support
  - Global availability
- **CTA Button**: “Subscribe to Basic ⚡”

### 1.3 AI ASMR Pro
- **Price**: $49.9/month (original $59.9)
- **Credits**: 1001/month
- **Video Limit**: 100 videos
- **Cost Breakdown**:
  - $0.50 per video
  - $0.050 per credit
- **Includes all Basic features**, plus:
  - 1080p video resolution
  - Advanced whisper sync
  - Premium binaural audio
  - Full ASMR trigger library
  - Fastest processing
  - ✅ Commercial usage rights
  - Priority support
  - Global availability
- **CTA Button**: “Subscribe to Pro ⚡”

---

## 2. Functional Requirements

| Component           | Description |
|--------------------|-------------|
| Pricing Table       | Display plans side-by-side with full feature breakdown |
| Feature Icons       | Use visual checkmarks, crosses, and highlights to signal availability |
| Discount Labels     | Show original and discounted prices with clear emphasis |
| Price Breakdown     | Display per-video and per-credit cost |
| CTAs                | Prominent buttons for subscription/trial for each tier |
| Responsive Layout   | Stack vertically on mobile; remain side-by-side on desktop |
| Sticky Header (Optional) | Persistent pricing call-to-action while scrolling |

---

## 3. Backend & API Integration

- `GET /api/pricing-plans`  
  Returns plan name, pricing, included features, credit limit, video resolution, and support level

- `POST /api/subscribe`  
  Handles subscription purchase with payment details and selected tier

- `GET /api/user-plan`  
  Returns current subscription and usage data for logged-in user

---

## 4. Non-Functional Requirements

- **Performance**: Fast page load (<1s)
- **Accessibility**: Screen-reader-friendly pricing table
- **Localization**: Support for i18n-ready plan titles and descriptions
- **SEO**: Include pricing metadata and structured data
- **Security**: Secure Stripe or payment provider integration

---

## 5. Future Enhancements

- Toggle between monthly / annual billing
- Currency localization (USD, EUR, etc.)
- Feature comparison tooltips or modals
- Credit auto top-up option
- Referral-based discounts or coupons

---

## 🎯 Summary

The pricing page for AIASMR Video must clearly present the value and differences between Trial, Basic, and Pro tiers—guiding users toward commitment based on their goals (exploration, content creation, professional use). It plays a critical role in revenue conversion and user onboarding.

