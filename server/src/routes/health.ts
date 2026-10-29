import { Router } from 'express';
import { sendSuccess } from '../utils/response';
import { getPool } from '../db/pool';
import { HttpError } from '../middleware/errorHandler';
import { reportDevelopmentError } from '../utils/safeDiagnostics';

export const healthRouter = Router();
healthRouter.get('/', (_request, response) => {
  sendSuccess(response, { status: 'ok', timestamp: new Date().toISOString() });
});
healthRouter.get('/ready', async (_request, response, next) => {
  try {
    await getPool().query('SELECT 1');
    sendSuccess(response, { status: 'ready' });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    reportDevelopmentError(error, response.locals.requestId as string | undefined, 'PostgreSQL');
    next(new HttpError(503, 'DATABASE_UNAVAILABLE', 'Database is temporarily unavailable.'));
  }
});
