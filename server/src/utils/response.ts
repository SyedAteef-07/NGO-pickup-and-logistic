import type { Response } from 'express';
import type { ApiFailure, ApiSuccess } from '@aaharaconnect/shared';

export function sendSuccess<T>(res: Response, data: T, status = 200): Response<ApiSuccess<T>> {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, status: number, code: string, message: string, options: { requestId?: string; details?: { field?: string; reason: string }[] } = {}): Response<ApiFailure> {
  return res.status(status).json({ success: false, error: { code, message, ...options } });
}
