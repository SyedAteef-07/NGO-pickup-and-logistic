import { z } from 'zod';
import { uuidSchema } from './common';

export const appRoleSchema = z.enum(['ADMIN', 'VOLUNTEER', 'DONOR']);
export type AppRole = z.infer<typeof appRoleSchema>;
export const appUserSchema = z.object({ id: uuidSchema, authUserId: uuidSchema, role: appRoleSchema, displayName: z.string().nullable() });
export type AppUser = z.infer<typeof appUserSchema>;
