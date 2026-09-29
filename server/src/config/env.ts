import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
if (!['development', 'test', 'production'].includes(nodeEnv)) {
  throw new Error('NODE_ENV must be development, test, or production.');
}

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',').map(origin => origin.trim()).filter(Boolean);
if (corsOrigins.length === 0 || corsOrigins.some(origin => !/^https?:\/\//.test(origin))) {
  throw new Error('CORS_ORIGIN must contain one or more http(s) origins.');
}

export const env = {
  port,
  nodeEnv,
  corsOrigins,
  databaseUrl: process.env.DATABASE_URL || undefined,
} as const;
