import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBaseUrl, isDevelopment } from '@/lib/environment'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Ensure redirect path starts with / and has default locale if needed
      if (!next.startsWith('/')) {
        next = '/' + next;
      }
      
      // For successful authentication, redirect to home page by default
      if (next === '/') {
        next = '/'; // This will use default locale due to middleware
      }
      
      // Determine redirect URL based on environment
      let redirectUrl: string;
      
      if (isDevelopment) {
        // For development, detect the current port dynamically
        const url = new URL(request.url);
        const port = url.port || '3001'; // Default to 3001 since that's common for Next.js when 3000 is taken
        redirectUrl = `http://localhost:${port}${next}`;
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
  let errorRedirectUrl: string;
  if (isDevelopment) {
    const url = new URL(request.url);
    const port = url.port || '3001';
    errorRedirectUrl = `http://localhost:${port}/auth/login?error=callback_error`;
  } else {
    errorRedirectUrl = `${origin}/auth/login?error=callback_error`;
  }
    
  return NextResponse.redirect(errorRedirectUrl);
}