const { createClient } = require('@supabase/supabase-js');

/**
 * Create Supabase client for server-side operations
 * Uses service role key for full database access
 */
const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Check SUPABASE_URL and SUPABASE_SERVICE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Create Supabase client for user-scoped operations
 * Uses anon key with RLS (Row Level Security)
 */
const createSupabaseClientAnon = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check SUPABASE_URL and SUPABASE_ANON_KEY');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

module.exports = {
  createSupabaseClient,
  createSupabaseClientAnon
};