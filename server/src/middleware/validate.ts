import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { HttpError } from './errorHandler';

export function validateBody<T extends z.ZodType>(schema: T): RequestHandler {
  return (request, response, next) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      next(new HttpError(400, 'VALIDATION_ERROR', 'Request body is invalid.', parsed.error.issues.map(issue => ({ field: issue.path.join('.'), reason: issue.message }))));
      return;
    }
    response.locals.validatedBody = parsed.data;
    next();
  };
}
