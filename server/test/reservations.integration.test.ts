import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';

const testDatabaseName = process.env.TEST_DATABASE_URL ? decodeURIComponent(new URL(process.env.TEST_DATABASE_URL).pathname.slice(1)) : '';
const enabled = testDatabaseName.endsWith('_test') && process.env.ALLOW_TEST_DATABASE_MUTATION === 'true';

describe.skipIf(!enabled)('PostgreSQL reservation constraints', () => {
  it('blocks a person booked as volunteer and driver, and a vehicle booked twice', async () => {
    const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    try {
      const exists = await pool.query("SELECT to_regclass('app.resource_reservations') AS table_name");
      if (!exists.rows[0].table_name) {
        for (const name of readdirSync(resolve(process.cwd(), 'db/migrations')).filter(name => /^\d+_[a-z0-9_]+\.sql$/.test(name)).sort()) {
          await pool.query(readFileSync(resolve(process.cwd(), 'db/migrations', name), 'utf8'));
        }
      }
      const authId = randomUUID();
      const user = await pool.query<{ id: string }>('INSERT INTO app.app_users(auth_user_id) VALUES ($1) RETURNING id', [authId]);
      const person = await pool.query<{ id: string }>("INSERT INTO app.people(name) VALUES ('Dual-role test person') RETURNING id");
      const volunteer = await pool.query<{ id: string }>('INSERT INTO app.volunteers(person_id, registration_code) VALUES ($1, $2) RETURNING id', [person.rows[0].id, `TEST-${randomUUID()}`]);
      const driver = await pool.query<{ id: string }>('INSERT INTO app.drivers(person_id, licence_number, licence_expires_on) VALUES ($1, $2, $3) RETURNING id', [person.rows[0].id, `LIC-${randomUUID()}`, '2030-01-01']);
      const vehicle = await pool.query<{ id: string }>('INSERT INTO app.vehicles(registration_number, kind, capacity_kg) VALUES ($1, $2, $3) RETURNING id', [`REG-${randomUUID()}`, 'Test van', 200]);
      const donor = await pool.query<{ id: string }>('INSERT INTO app.donors(app_user_id) VALUES ($1) RETURNING id', [user.rows[0].id]);
      const assignments: string[] = [];
      for (let index = 0; index < 2; index++) {
        const food = await pool.query<{ id: string }>(`INSERT INTO app.food_requests(donor_id, source_name, source_type, pickup_address, prepared_at, ready_at, pickup_deadline, handling_requirements, donor_safety_declaration, contact_name, contact_phone_e164)
          VALUES ($1, 'Test', 'Event', 'Test address', now(), now(), now() + interval '4 hours', '', true, 'Contact', '+919000000000') RETURNING id`, [donor.rows[0].id]);
        const pickup = await pool.query<{ id: string }>("INSERT INTO app.pickups(food_request_id, window_starts_at, window_ends_at, delivery_address) VALUES ($1, now(), now() + interval '2 hours', 'Hub') RETURNING id", [food.rows[0].id]);
        const assignment = await pool.query<{ id: string }>('INSERT INTO app.assignments(pickup_id, driver_id, vehicle_id, role) VALUES ($1, $2, $3, $4) RETURNING id', [pickup.rows[0].id, driver.rows[0].id, vehicle.rows[0].id, 'Pickup']);
        assignments.push(assignment.rows[0].id);
      }
      await pool.query('INSERT INTO app.assignment_members(assignment_id, volunteer_id) VALUES ($1, $2)', [assignments[0], volunteer.rows[0].id]);
      const start = '2026-10-10T10:00:00Z';
      const end = '2026-10-10T12:00:00Z';
      await pool.query('INSERT INTO app.resource_reservations(assignment_id, person_id, starts_at, ends_at) VALUES ($1, $2, $3, $4)', [assignments[0], person.rows[0].id, start, end]);
      await expect(pool.query('INSERT INTO app.resource_reservations(assignment_id, person_id, starts_at, ends_at) VALUES ($1, $2, $3, $4)', [assignments[1], person.rows[0].id, start, end])).rejects.toMatchObject({ code: '23P01' });
      await pool.query('INSERT INTO app.resource_reservations(assignment_id, vehicle_id, starts_at, ends_at) VALUES ($1, $2, $3, $4)', [assignments[0], vehicle.rows[0].id, start, end]);
      await expect(pool.query('INSERT INTO app.resource_reservations(assignment_id, vehicle_id, starts_at, ends_at) VALUES ($1, $2, $3, $4)', [assignments[1], vehicle.rows[0].id, start, end])).rejects.toMatchObject({ code: '23P01' });
      await pool.query("UPDATE app.resource_reservations SET state = 'RELEASED', released_at = now() WHERE assignment_id = $1 AND person_id = $2", [assignments[0], person.rows[0].id]);
      await pool.query('INSERT INTO app.resource_reservations(assignment_id, person_id, starts_at, ends_at) VALUES ($1, $2, $3, $4)', [assignments[1], person.rows[0].id, start, end]);

      const first = await pool.connect();
      const second = await pool.connect();
      try {
        await first.query('BEGIN');
        await second.query('BEGIN');
        const nextStart = '2026-10-11T10:00:00Z';
        const nextEnd = '2026-10-11T12:00:00Z';
        await first.query('INSERT INTO app.resource_reservations(assignment_id, person_id, starts_at, ends_at) VALUES ($1, $2, $3, $4)', [assignments[0], person.rows[0].id, nextStart, nextEnd]);
        const competingInsert = second.query('INSERT INTO app.resource_reservations(assignment_id, person_id, starts_at, ends_at) VALUES ($1, $2, $3, $4)', [assignments[1], person.rows[0].id, nextStart, nextEnd]).then(() => null).catch(error => error);
        await first.query('COMMIT');
        const conflict = await competingInsert;
        expect(conflict).toMatchObject({ code: '23P01' });
        await second.query('ROLLBACK');
      } finally {
        first.release();
        second.release();
      }
    } finally { await pool.end(); }
  });
});
