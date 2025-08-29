# Free Credits Feature Documentation

## 📋 Overview

The Free Credits feature allows users to earn additional credits through two main mechanisms:
1. **Daily Check-in System** - Users can check-in daily to earn credits with consecutive day bonuses
2. **Referral System** - Users can earn credits by referring new users who make purchases

## 🎯 Features

### ✅ Daily Check-in System
- **7-day reward cycle** with increasing rewards for consecutive days
- **Calendar view** showing check-in history for the current month
- **Streak tracking** with longest consecutive days display
- **Automatic reset** if user misses a day
- **Special rewards** for completing weekly cycles

### ✅ Referral System
- **Unique referral links** generated for each user
- **Social sharing** integration (Twitter, Facebook, LinkedIn, WhatsApp, Telegram)
- **30 credits reward** for each successful paid conversion
- **Real-time statistics** (completed, pending, earned)
- **Recent referrals tracking** with status updates

### ✅ Multi-language Support
- English, Chinese, French, German translations
- Consistent UI across all supported languages

### ✅ Responsive Design
- Mobile-friendly interface
- Touch-optimized components
- Adaptive layouts for all screen sizes

## 🏗️ Technical Architecture

### Database Schema
```sql
-- Check-in related tables
user_check_ins          -- Daily check-in records
check_in_rewards        -- Reward configuration (7-day cycle)
user_free_credits_stats -- User activity statistics

-- Referral related tables  
referral_codes          -- User referral codes and links
user_referrals         -- Referral tracking records
referral_rewards       -- Referral reward configuration

-- Integration with existing system
credit_transactions    -- Extended with free credits metadata
```

### API Endpoints
```
GET  /api/free-credits/check-in           # Get check-in status and history
POST /api/free-credits/check-in           # Perform daily check-in

GET  /api/free-credits/referral           # Get referral data and stats  
POST /api/free-credits/referral           # Record referral invitation
POST /api/free-credits/referral/register  # Process new user registration
```

### Frontend Components
```
/free-credits/
├── page.tsx                    # Main page with SSR metadata
├── FreeCreditsClient.tsx       # Main client component  
└── components/
    ├── CheckInSection.tsx      # Check-in calendar and controls
    └── ReferralSection.tsx     # Referral links and sharing
```

## 🔄 User Workflow

### Daily Check-in Flow
1. User visits `/free-credits` page
2. Check-in calendar shows current month with previous check-ins
3. If not checked-in today, "Check In" button is available
4. User clicks check-in → API call → Credits added → UI updated
5. Success notification shows credits earned

### Referral Flow  
1. User gets unique referral link from `/free-credits` page
2. User shares link via social media or direct copy
3. New user registers using referral link → Referral recorded
4. New user makes first purchase → Referrer gets 30 credits
5. Statistics update in real-time

## 🎨 UI/UX Design

### Check-in Section
- **Calendar Grid**: 7x6 grid showing current month
- **Stats Display**: Consecutive days, today's reward
- **Progress Indicators**: Visual feedback for streaks
- **Reward Preview**: Shows upcoming rewards

### Referral Section  
- **Link Management**: Copy-to-clipboard functionality
- **Social Sharing**: Pre-filled share messages
- **Statistics Dashboard**: Visual stats with progress indicators
- **Recent Activity**: List of recent referral attempts

## 🔧 Configuration

### Check-in Rewards (7-day cycle)
```sql
Day 1: 1 credit   (regular)
Day 2: 1 credit   (regular) 
Day 3: 2 credits  (regular)
Day 4: 2 credits  (regular)
Day 5: 3 credits  (regular)
Day 6: 3 credits  (regular) 
Day 7: 5 credits  (special bonus)
```

### Referral Rewards
```sql
Registration: 5 credits  (when user signs up)
First Payment: 30 credits (when user makes purchase) 
Subscription: 50 credits (when user subscribes)
```

## 🚀 Integration Points

### Authentication
- Uses existing `AuthContext` for user management
- Requires user login to access features
- Integrates with Supabase authentication

### Credits System
- Extends existing `credits-manager.ts` with `addCredits()` function
- All credit additions are logged in `credit_transactions` table
- Real-time balance updates via `useCredits` hook

### Navigation
- Added "Free Credits" link to main navigation
- Visible only to authenticated users
- Includes gift emoji icon for visual appeal

## 📱 Mobile Optimization

- **Responsive Grid**: Calendar adapts to mobile screens
- **Touch Interactions**: Optimized button sizes and touch targets  
- **Mobile Sharing**: Native share functionality where available
- **Swipe Gestures**: Smooth scrolling and interactions

## 🔐 Security Features

- **Rate Limiting**: Prevents abuse of check-in and referral systems
- **Input Validation**: All API inputs validated and sanitized
- **RLS Policies**: Row-level security on all database tables
- **CSRF Protection**: Built-in Next.js CSRF protection

## 📊 Analytics & Tracking

- **User Engagement**: Check-in frequency and streak analysis
- **Referral Performance**: Conversion rates and attribution
- **Credit Distribution**: Monitoring of earned vs spent credits
- **Feature Usage**: Page visits and interaction tracking

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Supabase database with schema applied
- Environment variables configured

### Installation
```bash
# Install dependencies (if not already done)
npm install react-hot-toast

# Apply database schema  
psql -f database/free_credits_schema.sql

# Start development server
npm run dev
```

### Environment Variables
```env
# Required for referral links
NEXT_PUBLIC_BASE_URL=https://aiasmr.vip

# Supabase configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Daily check-in works correctly
- [ ] Calendar shows proper check-in history  
- [ ] Consecutive day tracking accurate
- [ ] Referral link generation and copying
- [ ] Social sharing buttons functional
- [ ] Credits properly added to user account
- [ ] Multi-language switching works
- [ ] Mobile responsive design
- [ ] Toast notifications appear
- [ ] Authentication flow secure

### API Testing
```bash
# Test check-in endpoint
curl -X GET /api/free-credits/check-in

# Test referral endpoint  
curl -X GET /api/free-credits/referral
```

## 🚀 Deployment

### Database Migration
1. Apply the schema in `database/free_credits_schema.sql`
2. Ensure all RLS policies are enabled
3. Verify default reward configurations are inserted

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Vercel or preferred platform
3. Verify environment variables are set
4. Test functionality in production environment

## 📈 Future Enhancements

### Planned Features
- **Weekly/Monthly Challenges**: Special events for bonus credits
- **Achievement System**: Badges for milestones  
- **Referral Tiers**: Higher rewards for more referrals
- **Social Features**: Leaderboards and community challenges
- **Email Notifications**: Reminder emails for check-ins

### Technical Improvements
- **Push Notifications**: Browser notifications for check-in reminders
- **PWA Support**: Progressive Web App features
- **Analytics Dashboard**: Admin panel for monitoring
- **A/B Testing**: Optimize reward structures
- **API Rate Limiting**: More sophisticated throttling

## 🐛 Troubleshooting

### Common Issues

1. **Check-in not working**
   - Verify user is authenticated
   - Check timezone settings
   - Ensure database connectivity

2. **Referral links not generating**  
   - Check environment variables
   - Verify user profile exists
   - Check database permissions

3. **Credits not being added**
   - Check credits-manager integration
   - Verify transaction logging
   - Review API error logs

### Debug Mode
Set `NODE_ENV=development` to enable detailed error logging and debug information.

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Daily check-in system with 7-day reward cycle
- ✅ Referral system with social sharing
- ✅ Multi-language support (EN, ZH, FR, DE)
- ✅ Mobile-responsive design
- ✅ Integration with existing credit system
- ✅ Toast notification system
- ✅ Comprehensive database schema

## 👥 Contributors

- **Architecture & Database**: System design and database schema
- **Frontend Development**: React components and UI implementation  
- **Backend API**: REST endpoints and business logic
- **Internationalization**: Multi-language support
- **Testing & QA**: Quality assurance and testing

---

**Note**: This feature is designed to encourage user engagement and retention through gamification while providing real value through the credit rewards system.