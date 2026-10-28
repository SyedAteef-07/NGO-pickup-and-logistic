import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listOwnAssignments, transitionOwnAssignment } from './assignments';
import { getCurrentAccessToken } from './auth';
import { apiRequest } from './client';

vi.mock('./auth', () => ({ getCurrentAccessToken: vi.fn() }));
vi.mock('./client', () => ({ apiRequest: vi.fn() }));

const assignment = {
  id: 'a3333333-3333-4000-8000-000000000001',
  pickupId: 'c0000000-0000-4000-8000-000000000001',
  status: 'PENDING', version: 2, volunteerIds: [], teamId: null,
  driverId: 'd0000000-0000-4000-8000-000000000001',
  vehicleId: 'e0000000-0000-4000-8000-000000000001',
};

describe('mobile Volunteer assignments API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentAccessToken).mockResolvedValue('test-access-token');
  });

  it('reads only the authenticated Volunteer assignment list with a bearer token', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [assignment], nextCursor: null });
    await expect(listOwnAssignments()).resolves.toEqual([assignment]);
    expect(apiRequest).toHaveBeenCalledWith('assignments/me', {
      headers: { Authorization: 'Bearer test-access-token' },
    });
  });

  it('submits an allowed action with the current version and no client role or user identity', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ ...assignment, status: 'ACCEPTED', version: 3 });
    await transitionOwnAssignment(assignment.id, { action: 'ACCEPT', expectedVersion: 2 });
    expect(apiRequest).toHaveBeenCalledWith(`assignments/${assignment.id}/status`, {
      method: 'PATCH', headers: { Authorization: 'Bearer test-access-token' },
      body: { action: 'ACCEPT', expectedVersion: 2 },
    });
  });
});
