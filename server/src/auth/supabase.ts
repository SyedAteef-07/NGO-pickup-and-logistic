import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';

export type VerifiedIdentity = { authUserId: string; email: string };

export async function verifySupabaseToken(token: string): Promise<VerifiedIdentity> {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new HttpError(503, 'SERVICE_UNAVAILABLE', 'Authentication is not configured.');
  }
  const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  // getUser(token) asks Supabase Auth to verify the token; do not decode unverified claims.
  let result: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try { result = await supabase.auth.getUser(token); }
  catch { throw new HttpError(503, 'SERVICE_UNAVAILABLE', 'Authentication service is unavailable.'); }
  const { data, error } = result;
  if (error?.status === 0 || error?.name === 'AuthRetryableFetchError') {
    throw new HttpError(503, 'SERVICE_UNAVAILABLE', 'Authentication service is unavailable.');
  }
  if (error || !data.user?.id || !data.user.email || !data.user.email_confirmed_at) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'A verified email session is required.');
  }
  return { authUserId: data.user.id, email: data.user.email };
}
