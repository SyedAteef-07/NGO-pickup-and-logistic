import { z } from 'zod';
import { uuidSchema } from './common';

export const vehicleStatusSchema = z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']);
export const vehicleSizeCategorySchema = z.enum(['SMALL', 'MEDIUM', 'LARGE']);
export const vehicleConditionSchema = z.enum(['GOOD', 'NEEDS_SERVICE', 'UNSAFE']);
export const vehicleSchema = z.object({
  id: uuidSchema,
  registrationNumber: z.string(),
  kind: z.string(),
  capacityKg: z.number().positive(),
  status: vehicleStatusSchema,
  sizeCategory: vehicleSizeCategorySchema.nullable().optional(),
  indicativeMaxVessels: z.number().int().positive().nullable().optional(),
});
export const driverSchema = z.object({ id: uuidSchema, personId: uuidSchema, licenceNumber: z.string(), licenceExpiresOn: z.string().date(), status: z.enum(['ACTIVE', 'INACTIVE']) });
export const vehicleMaintenanceRecordSchema = z.object({
  id: uuidSchema,
  vehicleId: uuidSchema,
  servicedOn: z.string().date(),
  condition: vehicleConditionSchema,
  summary: z.string().min(1),
  nextServiceDueOn: z.string().date().nullable(),
  recordedBy: uuidSchema.nullable(),
});
export const createVehicleMaintenanceRecordSchema = vehicleMaintenanceRecordSchema.omit({ id: true, vehicleId: true, recordedBy: true }).extend({
  nextServiceDueOn: z.string().date().nullable().optional(),
});
export type Vehicle = z.infer<typeof vehicleSchema>;
export type Driver = z.infer<typeof driverSchema>;
export type VehicleMaintenanceRecord = z.infer<typeof vehicleMaintenanceRecordSchema>;
export type CreateVehicleMaintenanceRecord = z.infer<typeof createVehicleMaintenanceRecordSchema>;
// Keep old imports working while the tracking contracts live in their own module file.
export { trackingConsentInputSchema, vehicleLocationInputSchema } from './tracking';
export type { TrackingConsentInput, VehicleLocationInput } from './tracking';
