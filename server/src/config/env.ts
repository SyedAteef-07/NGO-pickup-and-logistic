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
  databaseSsl: process.env.DATABASE_SSL === 'true' || (nodeEnv === 'production' && process.env.DATABASE_SSL !== 'false'),
  databaseSslCaPath: process.env.DATABASE_SSL_CA_PATH || undefined,
  supabaseUrl: process.env.SUPABASE_URL || undefined,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || undefined,
  locationRetentionDays: Number(process.env.LOCATION_RETENTION_DAYS ?? 30),
} as const;

if (!Number.isInteger(env.locationRetentionDays) || env.locationRetentionDays < 1 || env.locationRetentionDays > 365) {
  throw new Error('LOCATION_RETENTION_DAYS must be an integer from 1 to 365.');
}
if (env.supabaseUrl && !/^https:\/\//.test(env.supabaseUrl)) throw new Error('SUPABASE_URL must use https.');
if (env.nodeEnv === 'production' && (!env.databaseUrl || !env.supabaseUrl || !env.supabasePublishableKey || !process.env.CORS_ORIGIN)) {
  throw new Error('Production requires DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and CORS_ORIGIN.');
}
if (env.nodeEnv === 'production' && !env.databaseSsl) throw new Error('Production database TLS cannot be disabled.');
