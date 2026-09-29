import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { apiRouter } from './routes';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use((request, response, next) => {
  const started = Date.now();
  response.on('finish', () => console.info(`[api] ${request.method} ${request.originalUrl.split('?')[0]} ${response.statusCode} ${Date.now() - started}ms`));
  next();
});
app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);
