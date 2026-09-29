import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.info(`[api] Listening on http://localhost:${env.port}/api/v1`);
});

function shutdown(signal: string) {
  console.info(`[api] ${signal} received; closing server.`);
  server.close(error => {
    if (error) { console.error('[api] Shutdown failed:', error); process.exitCode = 1; }
    else console.info('[api] Server stopped.');
  });
}
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
