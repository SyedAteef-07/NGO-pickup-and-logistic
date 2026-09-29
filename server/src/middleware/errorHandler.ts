import type { ErrorRequestHandler } from 'express';
import { sendError } from '../utils/response';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof HttpError) { sendError(response, error.status, error.code, error.message); return; }
  if (error instanceof SyntaxError && 'body' in error) { sendError(response, 400, 'INVALID_JSON', 'Request body must be valid JSON.'); return; }
  console.error('[api] Unhandled error:', error);
  sendError(response, 500, 'INTERNAL_ERROR', 'Something went wrong.');
};
