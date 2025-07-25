import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBaseUrl, isDevelopment } from '@/lib/environment'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Determine redirect URL based on environment
      let redirectUrl: string;
      
      if (isDevelopment) {
        // For development, always use localhost
        redirectUrl = `http://localhost:3000${next}`;
      } else {
        // For production, check forwarded host or use origin
        const forwardedHost = request.headers.get('x-forwarded-host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        
        if (forwardedHost) {
          redirectUrl = `${protocol}://${forwardedHost}${next}`;
        } else {
          redirectUrl = `${origin}${next}`;
        }
      }
      
      console.log(`Auth callback redirecting to: ${redirectUrl}`);
      return NextResponse.redirect(redirectUrl);
    }
    
    console.error('Auth callback error:', error);
  }

  // Return the user to an error page with instructions
  const errorRedirectUrl = isDevelopment 
    ? `http://localhost:3000/auth/auth-code-error`
    : `${origin}/auth/auth-code-error`;
    
  return NextResponse.redirect(errorRedirectUrl);
}