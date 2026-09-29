import { Router } from 'express';
import { sendSuccess } from '../utils/response';

export const healthRouter = Router();
healthRouter.get('/', (_request, response) => {
  sendSuccess(response, { status: 'ok', timestamp: new Date().toISOString() });
});
