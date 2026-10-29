import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelFoodRequest, createFoodRequest, getFoodRequest, listOwnFoodRequests } from './foodRequests';
import { getCurrentAccessToken } from './auth';
import { apiRequest } from './client';

vi.mock('./auth', () => ({ getCurrentAccessToken: vi.fn() }));
vi.mock('./client', () => ({ apiRequest: vi.fn() }));

const input = {
  sourceName: 'Test Event', sourceType: 'Event', pickupAddress: 'Test Hall',
  preparedAt: '2026-10-28T10:00:00.000Z', readyAt: '2026-10-28T10:30:00.000Z',
  pickupDeadline: '2026-10-28T12:00:00.000Z',
  contactName: 'Test Donor', contactPhoneE164: '+919876543210',
  handlingRequirements: '', donorSafetyDeclaration: true as const,
  items: [{ foodType: 'Meals', quantity: 10, unit: 'MEALS' as const, handlingRequirements: '' }],
  estimatedWeightKg: null,
};
const request = { ...input, id: 'a3333333-3333-4000-8000-000000000001', donorId: 'd3333333-3333-4000-8000-000000000001', status: 'SUBMITTED', safetyReview: 'PENDING' };

describe('mobile Donor food request API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentAccessToken).mockResolvedValue('fake-token');
  });

  it('submits the existing contract with the real session bearer header and no client identity', async () => {
    vi.mocked(apiRequest).mockResolvedValue(request);
    await expect(createFoodRequest(input)).resolves.toEqual(request);
    expect(apiRequest).toHaveBeenCalledWith('food-requests', {
      method: 'POST', headers: { Authorization: 'Bearer fake-token' }, body: input,
    });
    expect(input).not.toHaveProperty('donorId');
    expect(input).not.toHaveProperty('role');
  });

  it('lists only the signed-in donor requests', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [request], nextCursor: null });
    await expect(listOwnFoodRequests()).resolves.toEqual([request]);
    expect(apiRequest).toHaveBeenCalledWith('food-requests', { headers: { Authorization: 'Bearer fake-token' } });
  });

  it('reads and cancels a request by ID through the protected API', async () => {
    vi.mocked(apiRequest).mockResolvedValue(request);
    await getFoodRequest(request.id);
    await cancelFoodRequest(request.id);
    expect(apiRequest).toHaveBeenCalledWith(`food-requests/${request.id}`, { headers: { Authorization: 'Bearer fake-token' } });
    expect(apiRequest).toHaveBeenCalledWith(`food-requests/${request.id}/cancel`, {
      method: 'POST', headers: { Authorization: 'Bearer fake-token' },
    });
  });
});
