import { Router } from 'express';
import { sendSuccess } from '../utils/response';
import { getPool } from '../db/pool';
import { HttpError } from '../middleware/errorHandler';

export const healthRouter = Router();
healthRouter.get('/', (_request, response) => {
  sendSuccess(response, { status: 'ok', timestamp: new Date().toISOString() });
});
healthRouter.get('/ready', async (_request, response, next) => {
  try {
    await getPool().query('SELECT 1');
    sendSuccess(response, { status: 'ready' });
  } catch (_error) { next(new HttpError(503, 'SERVICE_UNAVAILABLE', 'Database is not ready.')); }
});
