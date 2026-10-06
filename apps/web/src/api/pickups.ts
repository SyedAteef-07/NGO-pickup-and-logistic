import type { Pickup } from '@aaharaconnect/shared';
import { apiRequest } from './client';

export type PickupPage = { items: Pickup[]; nextCursor: string | null };

export function listLivePickups(accessToken: string): Promise<PickupPage> {
  return apiRequest<PickupPage>('pickups?limit=10', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
