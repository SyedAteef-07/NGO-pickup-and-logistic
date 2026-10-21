import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it, vi } from 'vitest';

const { identity } = vi.hoisted(() => ({ identity: { authUserId: '' } }));
vi.mock('../src/auth/supabase', () => ({
  verifySupabaseToken: vi.fn(async () => ({ authUserId: identity.authUserId, email: 'volunteer@example.test' })),
}));

import { app } from '../src/app';
import { closePool, getPool } from '../src/db/pool';
import { assertVolunteerAssignable, getVolunteerAvailabilityForWindow, listEligibleVolunteers } from '../src/modules/volunteers/service';

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

describe.skipIf(!enabled)('Volunteer availability persistence', () => {
  it('persists own slot changes and cannot update another volunteer slot', async () => {
    const users: { authUserId: string; appUserId: string; personId: string; volunteerId: string }[] = [];
    const appUserIds: string[] = [];
    const personIds: string[] = [];
    const volunteerIds: string[] = [];
    let teamId: string | undefined;
    try {
      for (const name of ['Own volunteer', 'Other volunteer']) {
        const authUserId = randomUUID();
        const appUserId = (await getPool().query<{ id: string }>(
          `INSERT INTO app.app_users(auth_user_id, role) VALUES ($1, 'VOLUNTEER') RETURNING id`, [authUserId]
        )).rows[0].id;
        appUserIds.push(appUserId);
        const personId = (await getPool().query<{ id: string }>(
          `INSERT INTO app.people(app_user_id, name) VALUES ($1, $2) RETURNING id`, [appUserId, name]
        )).rows[0].id;
        personIds.push(personId);
        const volunteerId = (await getPool().query<{ id: string }>(
          `INSERT INTO app.volunteers(person_id, registration_code) VALUES ($1, $2) RETURNING id`,
          [personId, `VOL-${randomUUID()}`]
        )).rows[0].id;
        volunteerIds.push(volunteerId);
        users.push({ authUserId, appUserId, personId, volunteerId });
      }
      teamId = (await getPool().query<{ id: string }>(
        'INSERT INTO app.teams(name, leader_volunteer_id) VALUES ($1, $2) RETURNING id',
        [`Team-${randomUUID()}`, users[0].volunteerId]
      )).rows[0].id;
      await getPool().query('INSERT INTO app.team_members(team_id, volunteer_id) VALUES ($1, $2)', [teamId, users[0].volunteerId]);
      identity.authUserId = users[0].authUserId;
      const body = { startsAt: '2026-11-01T10:00:00Z', endsAt: '2026-11-01T12:00:00Z', state: 'AVAILABLE' };
      const created = await request(app).post('/api/v1/volunteers/me/availability')
        .set('Authorization', 'Bearer integration-token').send(body);
      expect(created.status).toBe(201);
      expect(created.body.data.volunteerId).toBe(users[0].volunteerId);
      expect(await getVolunteerAvailabilityForWindow(
        users[0].volunteerId, new Date('2026-11-01T10:30:00Z'), new Date('2026-11-01T11:30:00Z')
      )).toMatchObject({ isAvailable: true, status: 'ACTIVE' });
      const window = { startAt: new Date('2026-11-01T10:30:00Z'), endAt: new Date('2026-11-01T11:30:00Z') };
      expect(await assertVolunteerAssignable({ volunteerId: users[0].volunteerId, ...window })).toMatchObject({ isAvailable: true });
      expect((await listEligibleVolunteers({ ...window, teamId })).map(volunteer => volunteer.id)).toEqual([users[0].volunteerId]);

      const otherSlotId = (await getPool().query<{ id: string }>(
        `INSERT INTO app.volunteer_availability(volunteer_id, starts_at, ends_at, state)
         VALUES ($1, $2, $3, 'AVAILABLE') RETURNING id`,
        [users[1].volunteerId, body.startsAt, body.endsAt]
      )).rows[0].id;
      expect((await listEligibleVolunteers({ ...window, teamId })).map(volunteer => volunteer.id)).toEqual([users[0].volunteerId]);
      const forbidden = await request(app).patch(`/api/v1/volunteers/me/availability/${otherSlotId}`)
        .set('Authorization', 'Bearer integration-token')
        .send({ ...body, state: 'UNAVAILABLE' });
      expect(forbidden.status).toBe(404);

      const replaced = await request(app).patch(`/api/v1/volunteers/me/availability/${created.body.data.id}`)
        .set('Authorization', 'Bearer integration-token')
        .send({ startsAt: '2026-11-01T11:00:00Z', endsAt: '2026-11-01T13:00:00Z', state: 'UNAVAILABLE' });
      expect(replaced.status).toBe(200);
      const stored = (await getPool().query<{ volunteer_id: string; state: string; starts_at: Date; ends_at: Date }>(
        `SELECT volunteer_id, state, starts_at, ends_at FROM app.volunteer_availability WHERE id = $1`,
        [created.body.data.id]
      )).rows[0];
      expect(stored.volunteer_id).toBe(users[0].volunteerId);
      expect(stored.state).toBe('UNAVAILABLE');
      expect(stored.starts_at.toISOString()).toBe('2026-11-01T11:00:00.000Z');
      expect(stored.ends_at.toISOString()).toBe('2026-11-01T13:00:00.000Z');
      expect(await getVolunteerAvailabilityForWindow(
        users[0].volunteerId, new Date('2026-11-01T11:00:00Z'), new Date('2026-11-01T12:00:00Z')
      )).toMatchObject({ isAvailable: false });
      await expect(assertVolunteerAssignable({ volunteerId: users[0].volunteerId, ...window }))
        .rejects.toMatchObject({ status: 409 });
      expect(await listEligibleVolunteers({ ...window, teamId })).toEqual([]);

      const ownList = await request(app).get('/api/v1/volunteers/me/availability')
        .set('Authorization', 'Bearer integration-token');
      expect(ownList.status).toBe(200);
      expect(ownList.body.data.items.map((slot: { id: string }) => slot.id)).toEqual([created.body.data.id]);
      const otherStored = (await getPool().query<{ state: string }>(
        'SELECT state FROM app.volunteer_availability WHERE id = $1', [otherSlotId]
      )).rows[0];
      expect(otherStored.state).toBe('AVAILABLE');
    } finally {
      if (teamId) {
        await getPool().query('DELETE FROM app.team_members WHERE team_id = $1', [teamId]);
        await getPool().query('DELETE FROM app.teams WHERE id = $1', [teamId]);
      }
      for (const id of volunteerIds.reverse()) await getPool().query('DELETE FROM app.volunteer_availability WHERE volunteer_id = $1', [id]);
      for (const id of volunteerIds) await getPool().query('DELETE FROM app.volunteers WHERE id = $1', [id]);
      for (const id of personIds.reverse()) await getPool().query('DELETE FROM app.people WHERE id = $1', [id]);
      for (const id of appUserIds.reverse()) await getPool().query('DELETE FROM app.app_users WHERE id = $1', [id]);
    }
  });
});
