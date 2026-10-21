import 'dotenv/config';
import { randomInt, randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it, vi } from 'vitest';

const { identity } = vi.hoisted(() => ({ identity: { authUserId: '' } }));
vi.mock('../src/auth/supabase', () => ({
  verifySupabaseToken: vi.fn(async () => ({ authUserId: identity.authUserId, email: 'volunteer@example.test' })),
}));

import { app } from '../src/app';
import { closePool, getPool } from '../src/db/pool';

const testUrl = process.env.TEST_DATABASE_URL;
let testDatabaseName = '';
try {
  testDatabaseName = testUrl ? decodeURIComponent(new URL(testUrl).pathname.slice(1)) : '';
} catch {
  // A malformed test URL never enables database mutation.
}
const enabled = testDatabaseName.endsWith('_test')
  && process.env.ALLOW_TEST_DATABASE_MUTATION === 'true'
  && process.env.DATABASE_URL === testUrl;
if (process.env.CI && !enabled) {
  throw new Error('CI volunteer integration tests require DATABASE_URL and TEST_DATABASE_URL to name the same dedicated _test database and ALLOW_TEST_DATABASE_MUTATION=true.');
}

afterAll(async () => { if (enabled) await closePool(); });

describe.skipIf(!enabled)('Volunteer self-profile persistence', () => {
  it('updates only the linked person and retains volunteer-owned status and identifiers', async () => {
    identity.authUserId = randomUUID();
    const initialPhone = `+919${String(randomInt(1_000_000_000)).padStart(9, '0')}`;
    const nextPhone = `+918${String(randomInt(1_000_000_000)).padStart(9, '0')}`;
    const registrationCode = `VOL-${randomUUID()}`;
    let appUserId: string | undefined;
    let personId: string | undefined;
    let volunteerId: string | undefined;

    try {
      appUserId = (await getPool().query<{ id: string }>(
        `INSERT INTO app.app_users(auth_user_id, role) VALUES ($1, 'VOLUNTEER') RETURNING id`,
        [identity.authUserId]
      )).rows[0].id;
      personId = (await getPool().query<{ id: string }>(
        `INSERT INTO app.people(app_user_id, name, phone_e164) VALUES ($1, 'Arjun Rao', $2) RETURNING id`,
        [appUserId, initialPhone]
      )).rows[0].id;
      volunteerId = (await getPool().query<{ id: string }>(
        `INSERT INTO app.volunteers(person_id, registration_code, skills, status)
         VALUES ($1, $2, ARRAY['Food Handling'], 'ACTIVE') RETURNING id`,
        [personId, registrationCode]
      )).rows[0].id;

      const updated = await request(app).patch('/api/v1/volunteers/me')
        .set('Authorization', 'Bearer integration-token')
        .send({ name: 'Arjun Kumar', phoneE164: nextPhone });
      expect(updated.status).toBe(200);
      expect(updated.body.data).toMatchObject({ id: volunteerId, personId, registrationCode, name: 'Arjun Kumar', phoneE164: nextPhone, status: 'ACTIVE' });

      const stored = (await getPool().query<{
        name: string; phone_e164: string; registration_code: string; status: string; skills: string[];
      }>(
        `SELECT p.name, p.phone_e164, v.registration_code, v.status, v.skills
         FROM app.volunteers v JOIN app.people p ON p.id = v.person_id WHERE v.id = $1`,
        [volunteerId]
      )).rows[0];
      expect(stored).toEqual({ name: 'Arjun Kumar', phone_e164: nextPhone, registration_code: registrationCode, status: 'ACTIVE', skills: ['Food Handling'] });
    } finally {
      if (volunteerId) await getPool().query('DELETE FROM app.volunteers WHERE id = $1', [volunteerId]);
      if (personId) await getPool().query('DELETE FROM app.people WHERE id = $1', [personId]);
      if (appUserId) await getPool().query('DELETE FROM app.app_users WHERE id = $1', [appUserId]);
    }
  });
});
