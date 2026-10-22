import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createClient, invite, getUserById, deleteUser, testEnv } = vi.hoisted(() => ({
  createClient: vi.fn(), invite: vi.fn(), getUserById: vi.fn(), deleteUser: vi.fn(),
  testEnv: {
    supabaseUrl: 'https://example.supabase.co',
    supabasePublishableKey: 'test-publishable-key',
    supabaseSecretKey: 'test-server-only-secret',
    volunteerInviteRedirectUrl: 'https://example.org/accept-invite',
  },
}))
vi.mock('@supabase/supabase-js', () => ({ createClient }))
vi.mock('../config/env', () => ({ env: testEnv }))

import { inviteSupabaseUserByEmail, revokeNewSupabaseInvite } from '../auth/supabase'

beforeEach(() => {
  vi.resetAllMocks()
  testEnv.supabaseSecretKey = 'test-server-only-secret'
  testEnv.volunteerInviteRedirectUrl = 'https://example.org/accept-invite'
  createClient.mockReturnValue({ auth: { admin: { inviteUserByEmail: invite, getUserById, deleteUser } } })
  invite.mockImplementation(async (_email: string, options: { data: Record<string, unknown> }) => ({
    data: { user: { id: 'a0458efe-a4be-43da-a4ed-c290ac3b48cd', user_metadata: options.data } },
    error: null,
  }))
  getUserById.mockResolvedValue({ data: { user: null }, error: null })
  deleteUser.mockResolvedValue({ error: null })
})

describe('server-only Supabase volunteer invitations', () => {
  it('uses the privileged client lazily, normalizes email and marks this request', async () => {
    const result = await inviteSupabaseUserByEmail('  NEW@Example.com ', 'New Volunteer')
    expect(result.authUserId).toBe('a0458efe-a4be-43da-a4ed-c290ac3b48cd')
    expect(result.inviteNonce).toBeTruthy()
    expect(createClient).toHaveBeenCalledWith(testEnv.supabaseUrl, testEnv.supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
    expect(invite).toHaveBeenCalledWith('new@example.com', {
      data: { name: 'New Volunteer', aaharaconnectInviteNonce: result.inviteNonce },
      redirectTo: 'https://example.org/accept-invite',
    })
  })

  it('does not require the optional redirect and never sends a password to the provider', async () => {
    testEnv.volunteerInviteRedirectUrl = undefined as unknown as string
    await inviteSupabaseUserByEmail('new@example.com', 'New Volunteer')
    const options = invite.mock.calls[0]?.[1]
    expect(options).not.toHaveProperty('redirectTo')
    expect(options).not.toHaveProperty('password')
  })

  it('fails only the invitation operation when the secret is absent', async () => {
    testEnv.supabaseSecretKey = undefined as unknown as string
    await expect(inviteSupabaseUserByEmail('new@example.com', 'New')).rejects.toMatchObject({
      status: 503, code: 'SERVICE_UNAVAILABLE',
    })
    expect(invite).not.toHaveBeenCalled()
  })

  it('never treats a successful re-invite of an existing unconfirmed user as a new account', async () => {
    invite.mockResolvedValueOnce({ data: { user: { id: 'existing', user_metadata: {} } }, error: null })
    await expect(inviteSupabaseUserByEmail('old@example.com', 'Old')).rejects.toMatchObject({
      status: 409, code: 'RESOURCE_CONFLICT',
    })
  })

  it('maps duplicate-email and other provider failures to controlled responses', async () => {
    invite.mockResolvedValueOnce({ data: { user: null }, error: { code: 'email_exists', message: 'existing', status: 422 } })
      .mockResolvedValueOnce({ data: { user: null }, error: { code: 'other', message: 'provider internals', status: 500 } })
      .mockRejectedValueOnce(new Error('network internals'))
    await expect(inviteSupabaseUserByEmail('old@example.com', 'Old')).rejects.toMatchObject({ status: 409, code: 'RESOURCE_CONFLICT' })
    await expect(inviteSupabaseUserByEmail('new@example.com', 'New')).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' })
    await expect(inviteSupabaseUserByEmail('new@example.com', 'New')).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' })
  })

  it('deletes only when the auth account still carries this request nonce', async () => {
    const invited = await inviteSupabaseUserByEmail('new@example.com', 'New')
    getUserById.mockResolvedValueOnce({ data: { user: { user_metadata: { aaharaconnectInviteNonce: invited.inviteNonce } } }, error: null })
    expect(await revokeNewSupabaseInvite(invited)).toBe(true)
    expect(deleteUser).toHaveBeenCalledWith(invited.authUserId)

    getUserById.mockResolvedValueOnce({ data: { user: { user_metadata: { aaharaconnectInviteNonce: 'different' } } }, error: null })
    expect(await revokeNewSupabaseInvite(invited)).toBe(false)
    expect(deleteUser).toHaveBeenCalledTimes(1)
  })
})
