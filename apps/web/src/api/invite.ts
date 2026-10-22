import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type InviteAuth = Pick<SupabaseClient['auth'], 'getSession' | 'getUser' | 'verifyOtp' | 'updateUser' | 'signOut'>

// This one-page session never shares the persistent Admin browser session.
// URL detection is needed for Supabase's default invite confirmation callback.
export function createInviteAuth(): InviteAuth | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: true,
      flowType: 'implicit',
    },
  }).auth
}
