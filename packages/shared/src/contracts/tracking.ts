import { z } from 'zod';
import { utcDateTimeSchema, uuidSchema } from './common';

// Module 4 owns consent and observations, never the canonical vehicle registry.
export const trackingConsentInputSchema = z.object({ pickupId: uuidSchema, consent: z.literal(true) });
export const vehicleLocationInputSchema = z.object({
  pickupId: uuidSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  recordedAt: utcDateTimeSchema,
});
export type TrackingConsentInput = z.infer<typeof trackingConsentInputSchema>;
export type VehicleLocationInput = z.infer<typeof vehicleLocationInputSchema>;
