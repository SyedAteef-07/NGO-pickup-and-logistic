import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const phoneE164Schema = z.string().regex(/^\+[1-9][0-9]{7,14}$/, 'Use an E.164 phone number.');
export const utcDateTimeSchema = z.string().datetime({ offset: true });
export const pageQuerySchema = z.object({ cursor: z.string().optional(), limit: z.coerce.number().int().min(1).max(100).default(25) });
export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR', 'INVALID_JSON', 'UNAUTHENTICATED', 'FORBIDDEN', 'NOT_FOUND',
  'RESOURCE_CONFLICT', 'INVALID_TRANSITION', 'VERSION_CONFLICT', 'SERVICE_UNAVAILABLE', 'INTERNAL_ERROR',
]);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: { code: ApiErrorCode | string; message: string; details?: { field?: string; reason: string }[]; requestId?: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
export type Page<T> = { items: T[]; nextCursor: string | null };
