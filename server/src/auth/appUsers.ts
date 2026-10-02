import type { AppUser, AppRole } from '@aaharaconnect/shared';
import { getPool, withTransaction } from '../db/pool';
import { HttpError } from '../middleware/errorHandler';

type AppUserRow = { id: string; auth_user_id: string; role: AppRole; display_name: string | null };
function toContract(row: AppUserRow): AppUser {
  return { id: row.id, authUserId: row.auth_user_id, role: row.role, displayName: row.display_name };
}

export async function findOrCreateAppUser(authUserId: string): Promise<AppUser> {
  await getPool().query(`
    INSERT INTO app.app_users(auth_user_id, role) VALUES ($1, 'DONOR')
    ON CONFLICT (auth_user_id) DO NOTHING`, [authUserId]);
  const result = await getPool().query<AppUserRow>('SELECT id, auth_user_id, role, display_name, disabled_at FROM app.app_users WHERE auth_user_id = $1', [authUserId]);
  const row = result.rows[0] as AppUserRow & { disabled_at: Date | null };
  if (row.disabled_at) throw new HttpError(403, 'FORBIDDEN', 'This account is disabled.');
  return toContract(row);
}

export async function setAppUserRole(id: string, role: AppRole, actorUserId: string): Promise<AppUser> {
  return withTransaction(async client => {
    const actor = await client.query<{ role: AppRole; disabled_at: Date | null }>('SELECT role, disabled_at FROM app.app_users WHERE id = $1', [actorUserId]);
    if (actor.rows[0]?.role !== 'ADMIN' || actor.rows[0].disabled_at) throw new HttpError(403, 'FORBIDDEN', 'Administrator access is required.');
    const current = await client.query<AppUserRow>('SELECT id, auth_user_id, role, display_name FROM app.app_users WHERE id = $1 FOR UPDATE', [id]);
    const user = current.rows[0];
    if (!user) throw new HttpError(404, 'NOT_FOUND', 'Application user not found.');
    if (id === actorUserId && role !== 'ADMIN') throw new HttpError(409, 'RESOURCE_CONFLICT', 'An administrator cannot remove their own administrator access.');
    if (user.role === role) return toContract(user);
    const updated = await client.query<AppUserRow>('UPDATE app.app_users SET role = $2, updated_at = now() WHERE id = $1 RETURNING id, auth_user_id, role, display_name', [id, role]);
    await client.query('INSERT INTO app.user_role_events(app_user_id, actor_user_id, from_role, to_role) VALUES ($1, $2, $3, $4)', [id, actorUserId, user.role, role]);
    return toContract(updated.rows[0]);
  });
}
