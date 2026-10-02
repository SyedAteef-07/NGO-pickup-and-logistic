import { z } from 'zod';
import { utcDateTimeSchema, uuidSchema } from './common';

export const volunteerStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
const availabilityFields = z.object({ startsAt: utcDateTimeSchema, endsAt: utcDateTimeSchema, state: z.enum(['AVAILABLE', 'UNAVAILABLE']) });
export const availabilityInputSchema = availabilityFields.refine(value => new Date(value.startsAt) < new Date(value.endsAt), { path: ['endsAt'], message: 'End must follow start.' });
export const availabilitySchema = availabilityFields.extend({ id: uuidSchema, volunteerId: uuidSchema });
export const volunteerSchema = z.object({ id: uuidSchema, personId: uuidSchema, registrationCode: z.string(), name: z.string(), phoneE164: z.string().nullable(), skills: z.array(z.string()), status: volunteerStatusSchema });
export const teamSchema = z.object({ id: uuidSchema, name: z.string(), leaderVolunteerId: uuidSchema.nullable(), memberIds: z.array(uuidSchema) });
export type Volunteer = z.infer<typeof volunteerSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type Team = z.infer<typeof teamSchema>;
export type CreateAvailabilityRequest = z.infer<typeof availabilityInputSchema>;
