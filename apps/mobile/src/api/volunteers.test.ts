import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listOwnVolunteerTeams } from './volunteers';
import { getCurrentAccessToken } from './auth';
import { apiRequest } from './client';

vi.mock('./auth', () => ({ getCurrentAccessToken: vi.fn() }));
vi.mock('./client', () => ({ apiRequest: vi.fn() }));

describe('mobile Volunteer team API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('reads only the authenticated Volunteer teams with the current bearer token', async () => {
    vi.mocked(getCurrentAccessToken).mockResolvedValue('test-access-token');
    vi.mocked(apiRequest).mockResolvedValue({ items: [{ id: 'team-1', name: 'Test Rescue Team', isLeader: true }], nextCursor: null });

    await expect(listOwnVolunteerTeams()).resolves.toEqual([{ id: 'team-1', name: 'Test Rescue Team', isLeader: true }]);
    expect(apiRequest).toHaveBeenCalledWith('volunteers/me/teams', { headers: { Authorization: 'Bearer test-access-token' } });
  });
});
