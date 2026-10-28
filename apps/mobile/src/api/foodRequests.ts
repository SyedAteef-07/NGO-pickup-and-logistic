import type { CreateFoodRequest, FoodRequest, Page, PickupStatus } from '@aaharaconnect/shared';
import { getCurrentAccessToken } from './auth';
import { apiRequest } from './client';

async function authHeaders() {
  return { Authorization: `Bearer ${await getCurrentAccessToken()}` };
}

export type DonorFoodRequest = FoodRequest & {
  pickup?: { id: string; status: PickupStatus; windowStartsAt: string; windowEndsAt: string; deliveryAddress: string } | null;
};

export async function createFoodRequest(input: CreateFoodRequest): Promise<DonorFoodRequest> {
  return apiRequest<DonorFoodRequest>('food-requests', {
    method: 'POST', headers: await authHeaders(), body: input,
  });
}

export async function listOwnFoodRequests(): Promise<DonorFoodRequest[]> {
  const page = await apiRequest<Page<DonorFoodRequest>>('food-requests', { headers: await authHeaders() });
  return page.items;
}

export async function getFoodRequest(id: string): Promise<DonorFoodRequest> {
  return apiRequest<DonorFoodRequest>(`food-requests/${encodeURIComponent(id)}`, { headers: await authHeaders() });
}

export async function cancelFoodRequest(id: string): Promise<DonorFoodRequest> {
  return apiRequest<DonorFoodRequest>(`food-requests/${encodeURIComponent(id)}/cancel`, {
    method: 'POST', headers: await authHeaders(),
  });
}
