import type { AppRole, AppUser } from '@aaharaconnect/shared';
import type { RequestHandler } from 'express';
import { HttpError } from './errorHandler';

export function requireRole(...roles: AppRole[]): RequestHandler {
  return (_request, response, next) => {
    const user = response.locals.appUser as AppUser | undefined;
    if (!user) { next(new HttpError(401, 'UNAUTHENTICATED', 'Authentication required.')); return; }
    if (!roles.includes(user.role)) { next(new HttpError(403, 'FORBIDDEN', 'This role cannot perform that action.')); return; }
    next();
  };
}
