import type { AppUser } from '@aaharaconnect/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import { apiRequest } from './client';

export function getCurrentAppUser(accessToken: string): Promise<AppUser> {
  return apiRequest<AppUser>('me', { headers: { Authorization: `Bearer ${accessToken}` } });
}

let client: SupabaseClient | undefined;

export function isLiveAuthConfigured(): boolean {
  return !!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.EXPO_PUBLIC_API_BASE_URL);
}

function getAuthClient(): SupabaseClient {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase Auth is not configured.');
  if (!client) {
    client = createClient(url, key, {
      auth: {
        ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    if (Platform.OS !== 'web') {
      AppState.addEventListener('change', state => {
        if (state === 'active') client?.auth.startAutoRefresh();
        else client?.auth.stopAutoRefresh();
      });
    }
  }
  return client;
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  const auth = getAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('A confirmed email session is required.');
  try {
    return await getCurrentAppUser(data.session.access_token);
  } catch (cause) {
    await auth.auth.signOut();
    throw cause;
  }
}

export async function restoreAppUser(): Promise<AppUser | null> {
  if (!isLiveAuthConfigured()) return null;
  const auth = getAuthClient();
  const { data, error } = await auth.auth.getSession();
  if (error || !data.session) return null;
  return getCurrentAppUser(data.session.access_token);
}

export async function signOut(): Promise<void> {
  if (client) await client.auth.signOut();
}
