import type { AppUser } from '@aaharaconnect/shared';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { apiRequest } from './client';

export function getCurrentAppUser(accessToken: string): Promise<AppUser> {
  return apiRequest<AppUser>('me', { headers: { Authorization: `Bearer ${accessToken}` } });
}

let client: SupabaseClient | undefined;

export function isLiveAuthConfigured(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY && import.meta.env.VITE_API_BASE_URL);
}

function getAuthClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase Auth is not configured.');
  client ??= createClient(url, key, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
  return client;
}

export async function signInAsAdmin(email: string, password: string): Promise<AppUser> {
  const auth = getAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('A confirmed email session is required.');
  try {
    const user = await getCurrentAppUser(data.session.access_token);
    if (user.role !== 'ADMIN') throw new Error('Administrator access is required.');
    return user;
  } catch (cause) {
    await auth.auth.signOut();
    throw cause;
  }
}

export async function restoreAdminSession(): Promise<AppUser | null> {
  if (!isLiveAuthConfigured()) return null;
  const auth = getAuthClient();
  const { data, error } = await auth.auth.getSession();
  if (error || !data.session) return null;
  const user = await getCurrentAppUser(data.session.access_token);
  if (user.role !== 'ADMIN') {
    await auth.auth.signOut();
    return null;
  }
  return user;
}

export async function signOutAdmin(): Promise<void> {
  if (client) await client.auth.signOut();
}
