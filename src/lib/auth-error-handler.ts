import { NextResponse } from 'next/server'
import { AuthError } from '@supabase/supabase-js'

/**
 * Handles Supabase auth errors consistently across API routes
 */
export function handleAuthError(error: any): NextResponse {
  // Check if it's a Supabase AuthError
  if (error?.code === 'refresh_token_not_found' || 
      error?.message?.includes('refresh') || 
      error?.message?.includes('token')) {
    
    console.log('Refresh token error handled:', error.message)
    
    return NextResponse.json(
      { 
        error: 'Authentication expired', 
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'Please sign in again' 
      },
      { status: 401 }
    )
  }

  // Handle other auth errors
  if (error?.__isAuthError || error?.code) {
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        code: error.code || 'AUTH_ERROR',
        message: error.message || 'Authentication required' 
      },
      { status: 401 }
    )
  }

  // Not an auth error, let it bubble up
  throw error
}

/**
 * Wraps an API handler with auth error handling
 */
export function withAuthErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      // Try to handle as auth error first
      try {
        return handleAuthError(error)
      } catch {
        // Not an auth error, rethrow
        throw error
      }
    }
  }
}