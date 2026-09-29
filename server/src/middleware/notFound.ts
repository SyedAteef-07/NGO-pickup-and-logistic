import type { RequestHandler } from 'express';
import { sendError } from '../utils/response';

export const notFound: RequestHandler = (_request, response) => {
  sendError(response, 404, 'NOT_FOUND', 'The requested endpoint does not exist.');
};
