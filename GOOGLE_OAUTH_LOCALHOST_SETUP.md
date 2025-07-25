# Google OAuth Localhost Setup Guide

## Current Issue
Google OAuth login doesn't work in localhost development environment because the redirect URLs are not properly configured for localhost.

## Solution

### 1. Update Google Cloud Console Settings

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Select your OAuth 2.0 client ID.

#### Authorized JavaScript origins
Add these URLs:
- `http://localhost:3000`
- `https://www.aiasmr.vip` (for production)

#### Authorized redirect URIs
Add these URLs:
- `http://localhost:3000/auth/callback`
- `https://www.aiasmr.vip/auth/callback` (for production)

### 2. Environment Variables Check

Ensure your `.env.local` file has:

```bash
# Environment-specific URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTION_URL=https://www.aiasmr.vip

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xwthsruuafryyqspqyss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Debug Page

Visit `http://localhost:3000/debug-auth` to see the current configuration and verify all settings are correct.

### 4. Test the Login

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Login with Google"
4. Should redirect to Google OAuth and back to your app

### 5. Common Issues

#### Issue: "redirect_uri_mismatch" error
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches `http://localhost:3000/auth/callback`

#### Issue: "unauthorized_client" error  
**Solution**: Check that your Google Client ID is correct and the JavaScript origins include `http://localhost:3000`

#### Issue: Still redirecting to production URL
**Solution**: Clear your browser cache and cookies, restart the development server

### 6. Production vs Development

The application now automatically detects the environment:
- **Development** (`NODE_ENV=development`): Uses `http://localhost:3000`
- **Production** (`NODE_ENV=production`): Uses `https://www.aiasmr.vip`

### 7. Verification Steps

1. Check environment detection: Visit `/debug-auth`
2. Verify callback URL: Should show `http://localhost:3000/auth/callback` in development
3. Test Google login: Should work without redirect errors
4. Check browser console: Should show correct redirect URLs in logs

## Files Modified

- `src/lib/environment.ts` - Environment detection utilities
- `src/contexts/AuthContext.tsx` - Updated Google OAuth redirect handling
- `src/app/auth/callback/route.ts` - Improved callback handling
- `src/app/debug-auth/page.tsx` - Debug page for troubleshooting
- `.env.local` - Updated environment variables