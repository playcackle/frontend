import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Use PKCE so OAuth (Discord) returns `?code=` to /auth/callback,
      // which the callback exchanges via exchangeCodeForSession().
      flowType: 'pkce',
      // We exchange the code manually in the callback, so don't let the
      // client auto-consume it first (that would make the manual call fail).
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
}
