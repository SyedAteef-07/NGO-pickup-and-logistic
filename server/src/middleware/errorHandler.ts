import type { ErrorRequestHandler } from 'express';
import { sendError } from '../utils/response';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: { field?: string; reason: string }[]) { super(message); }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const requestId = response.locals.requestId as string | undefined;
  if (error instanceof HttpError) { sendError(response, error.status, error.code, error.message, { requestId, details: error.details }); return; }
  if (error instanceof SyntaxError && 'body' in error) { sendError(response, 400, 'INVALID_JSON', 'Request body must be valid JSON.', { requestId }); return; }
  const kind = error instanceof Error ? error.name : 'unknown';
  console.error(JSON.stringify({ level: 'error', requestId, kind, message: 'Unhandled API error' }));
  sendError(response, 500, 'INTERNAL_ERROR', 'Something went wrong.', { requestId });
};
