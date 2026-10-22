import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';

export type VerifiedIdentity = { authUserId: string; email: string };

let adminClient: ReturnType<typeof createClient> | undefined;

function getSupabaseAdminClient() {
  if (!env.supabaseUrl || !env.supabaseSecretKey) {
    throw new HttpError(
      503,
      'SERVICE_UNAVAILABLE',
      'Volunteer invitation is not configured.'
    );
  }

  if (!adminClient) {
    adminClient = createClient(
      env.supabaseUrl,
      env.supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return adminClient;
}

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

export type InvitedSupabaseUser = {
  authUserId: string;
  inviteNonce: string;
};

export async function inviteSupabaseUserByEmail(
  email: string,
  name: string
): Promise<InvitedSupabaseUser> {
  const supabase = getSupabaseAdminClient();
  const inviteNonce = randomUUID();

  try {
    const { data, error } =
      await supabase.auth.admin.inviteUserByEmail(email.trim().toLowerCase(), {
        data: { name, aaharaconnectInviteNonce: inviteNonce },
        ...(env.volunteerInviteRedirectUrl ? { redirectTo: env.volunteerInviteRedirectUrl } : {}),
      });

    if (error) {
      const duplicate =
        ['email_exists', 'user_already_exists'].includes(error.code ?? '')
        || /already.*registered|already.*exists/i.test(error.message);

      if (duplicate) {
        throw new HttpError(
          409,
          'RESOURCE_CONFLICT',
          'An authentication account already exists for this email.'
        );
      }

      throw new HttpError(
        503,
        'SERVICE_UNAVAILABLE',
        'The volunteer invitation could not be created.'
      );
    }

    if (!data.user?.id) {
      throw new HttpError(
        503,
        'SERVICE_UNAVAILABLE',
        'The authentication provider did not return an invited user.'
      );
    }

    // Supabase may successfully re-invite an existing unconfirmed user. Its
    // existing metadata does not contain this request's fresh nonce, so never
    // provision or compensate that account as though it were newly created.
    if (data.user.user_metadata?.aaharaconnectInviteNonce !== inviteNonce) {
      throw new HttpError(409, 'RESOURCE_CONFLICT', 'An authentication account already exists for this email.');
    }

    return { authUserId: data.user.id, inviteNonce };
  } catch (error) {
    if (error instanceof HttpError) throw error;

    throw new HttpError(
      503,
      'SERVICE_UNAVAILABLE',
      'The authentication service is unavailable.'
    );
  }
}

export async function revokeNewSupabaseInvite(invited: InvitedSupabaseUser): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.getUserById(invited.authUserId);
    if (error || data.user?.user_metadata?.aaharaconnectInviteNonce !== invited.inviteNonce) return false;
    const removed = await supabase.auth.admin.deleteUser(invited.authUserId);
    return !removed.error;
  } catch {
    return false;
  }
}
