import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it, vi } from 'vitest';

const { identity } = vi.hoisted(() => ({ identity: { authUserId: '' } }));
vi.mock('../src/auth/supabase', () => ({
  verifySupabaseToken: vi.fn(async () => ({ authUserId: identity.authUserId, email: 'admin@example.test' })),
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

describe.skipIf(!enabled)('ADMIN Volunteer Management persistence', () => {
  it('lists volunteer records and manages canonical team membership without assignment writes', async () => {
    const appUserIds: string[] = [];
    const personIds: string[] = [];
    const volunteerIds: string[] = [];
    const teamIds: string[] = [];
    const namePrefix = `AdminTest-${randomUUID()}`;
    try {
      identity.authUserId = randomUUID();
      appUserIds.push((await getPool().query<{ id: string }>(
        `INSERT INTO app.app_users(auth_user_id, role) VALUES ($1, 'ADMIN') RETURNING id`, [identity.authUserId]
      )).rows[0].id);
      for (const suffix of ['One', 'Two']) {
        personIds.push((await getPool().query<{ id: string }>(
          'INSERT INTO app.people(name) VALUES ($1) RETURNING id', [`${namePrefix}-${suffix}`]
        )).rows[0].id);
        volunteerIds.push((await getPool().query<{ id: string }>(
          'INSERT INTO app.volunteers(person_id, registration_code) VALUES ($1, $2) RETURNING id',
          [personIds[personIds.length - 1], `VOL-${randomUUID()}`]
        )).rows[0].id);
      }

      const roster = await request(app).get('/api/v1/volunteers').query({ search: namePrefix, status: 'ACTIVE' })
        .set('Authorization', 'Bearer integration-token');
      expect(roster.status).toBe(200);
      expect(roster.body.data.items.map((item: { id: string }) => item.id).sort()).toEqual([...volunteerIds].sort());
      const detail = await request(app).get(`/api/v1/volunteers/${volunteerIds[0]}`)
        .set('Authorization', 'Bearer integration-token');
      expect(detail.status).toBe(200);
      expect(detail.body.data.name).toBe(`${namePrefix}-One`);

      const created = await request(app).post('/api/v1/teams').set('Authorization', 'Bearer integration-token')
        .send({ name: namePrefix, leaderVolunteerId: volunteerIds[0], memberIds: [volunteerIds[0]] });
      expect(created.status).toBe(201);
      teamIds.push(created.body.data.id);
      const updated = await request(app).patch(`/api/v1/teams/${teamIds[0]}`)
        .set('Authorization', 'Bearer integration-token')
        .send({ memberIds: volunteerIds });
      expect(updated.status).toBe(200);
      expect(updated.body.data.memberIds.sort()).toEqual([...volunteerIds].sort());
      const stored = (await getPool().query<{ volunteer_id: string }>(
        'SELECT volunteer_id FROM app.team_members WHERE team_id = $1', [teamIds[0]]
      )).rows.map(row => row.volunteer_id).sort();
      expect(stored).toEqual([...volunteerIds].sort());
      const secondTeam = await request(app).post('/api/v1/teams').set('Authorization', 'Bearer integration-token')
        .send({ name: `${namePrefix}-other`, memberIds: [volunteerIds[0]] });
      if (secondTeam.status === 201) teamIds.push(secondTeam.body.data.id);
      expect(secondTeam.status).toBe(409);
      expect((await getPool().query<{ count: string }>(
        'SELECT count(*)::text AS count FROM app.teams WHERE name = $1', [`${namePrefix}-other`]
      )).rows[0].count).toBe('0');
    } finally {
      for (const id of [...teamIds].reverse()) {
        await getPool().query('DELETE FROM app.team_members WHERE team_id = $1', [id]);
        await getPool().query('DELETE FROM app.teams WHERE id = $1', [id]);
      }
      for (const id of [...volunteerIds].reverse()) await getPool().query('DELETE FROM app.volunteers WHERE id = $1', [id]);
      for (const id of [...personIds].reverse()) await getPool().query('DELETE FROM app.people WHERE id = $1', [id]);
      for (const id of [...appUserIds].reverse()) await getPool().query('DELETE FROM app.app_users WHERE id = $1', [id]);
    }
  });
});
