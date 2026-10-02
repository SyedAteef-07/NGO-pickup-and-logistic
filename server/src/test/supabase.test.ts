import { beforeEach, describe, expect, it, vi } from 'vitest';

const getUser = vi.hoisted(() => vi.fn());
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { getUser } }) }));
vi.mock('../config/env', () => ({
  env: { supabaseUrl: 'https://example.supabase.co', supabasePublishableKey: 'test-key' },
}));

import { verifySupabaseToken } from '../auth/supabase';

beforeEach(() => getUser.mockReset());

describe('Supabase token verification', () => {
  it('accepts only a confirmed identity returned by Auth', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'auth-id', email: 'test@example.com', email_confirmed_at: '2026-10-01T00:00:00Z' } }, error: null });
    await expect(verifySupabaseToken('token')).resolves.toEqual({ authUserId: 'auth-id', email: 'test@example.com' });
    expect(getUser).toHaveBeenCalledWith('token');
  });

  it('rejects invalid or unconfirmed sessions', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: { name: 'AuthApiError', status: 401 } });
    await expect(verifySupabaseToken('invalid')).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
    getUser.mockResolvedValueOnce({ data: { user: { id: 'auth-id', email: 'test@example.com', email_confirmed_at: null } }, error: null });
    await expect(verifySupabaseToken('unconfirmed')).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
  });

  it('reports an Auth network outage as unavailable', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { name: 'AuthRetryableFetchError', status: 0 } });
    await expect(verifySupabaseToken('token')).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' });
  });
});
