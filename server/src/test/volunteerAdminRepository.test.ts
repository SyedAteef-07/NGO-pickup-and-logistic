import { beforeEach, describe, expect, it, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('../db/pool', () => ({ getPool: () => ({ query }) }));

import { listEligibleVolunteerRows, listTeams, listVolunteers } from '../modules/volunteers/repository';

const ids = [
  '7b6e0f4e-1ed9-466a-97a9-314eb6f64aa5',
  '44bada71-76fd-41ad-a1af-b2cd9f2df902',
  '8d253313-d824-47a1-83dd-5f7dc5c84f60',
];
const rows = ids.map((id, index) => ({ id, created_at: new Date(`2026-10-0${index + 1}T10:00:00Z`) }));

beforeEach(() => { vi.clearAllMocks(); });

describe('Volunteer admin repository pagination', () => {
  it('uses parameterized filters and a stable created-at/id cursor for volunteers', async () => {
    query.mockResolvedValueOnce({ rows });
    const first = await listVolunteers({ limit: 2, search: 'Ada', status: 'ACTIVE', skill: 'pickup', teamId: ids[0] });
    expect(first.rows).toEqual(rows.slice(0, 2));
    expect(first.nextCursor).toEqual(expect.any(String));
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('ORDER BY v.created_at DESC, v.id DESC');
    expect(sql).toContain('app.team_members');
    expect(params).toEqual(['Ada', 'ACTIVE', 'pickup', ids[0], 3]);

    query.mockResolvedValueOnce({ rows: [rows[2]] });
    const second = await listVolunteers({ limit: 2, cursor: first.nextCursor! });
    expect(second.rows).toEqual([rows[2]]);
    expect(second.nextCursor).toBeNull();
    expect(query.mock.calls[1][0]).toContain('(v.created_at, v.id) <');
    expect(query.mock.calls[1][1]).toEqual([rows[1].created_at.toISOString(), ids[1], 3]);
  });

  it('rejects malformed cursors and paginates team summaries', async () => {
    await expect(listVolunteers({ limit: 2, cursor: 'invalid' })).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(query).not.toHaveBeenCalled();
    query.mockResolvedValueOnce({ rows });
    const result = await listTeams({ limit: 2, search: 'Alpha' });
    expect(result.rows).toEqual(rows.slice(0, 2));
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(query.mock.calls[0][0]).toContain('GROUP BY t.id ORDER BY t.created_at DESC, t.id DESC');
    expect(query.mock.calls[0][1]).toEqual(['Alpha', 3]);
  });
});

describe('Volunteer eligibility repository', () => {
  it('uses only volunteer status, availability slots and optional team membership', async () => {
    const startAt = new Date('2026-11-01T10:00:00Z');
    const endAt = new Date('2026-11-01T12:00:00Z');
    query.mockResolvedValue({ rows: [] });
    await listEligibleVolunteerRows(startAt, endAt, ids[0]);
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql.trimStart().startsWith('SELECT')).toBe(true);
    expect(sql).toContain("v.status = 'ACTIVE'");
    expect(sql).toContain("av.state = 'AVAILABLE'");
    expect(sql).toContain("uv.state = 'UNAVAILABLE'");
    expect(sql).toContain('FROM app.team_members');
    expect(params).toEqual([startAt, endAt, ids[0]]);
    await listEligibleVolunteerRows(startAt, endAt);
    expect(query.mock.calls[1][0]).not.toContain('FROM app.team_members');
    expect(query.mock.calls[1][1]).toEqual([startAt, endAt]);
  });
});
