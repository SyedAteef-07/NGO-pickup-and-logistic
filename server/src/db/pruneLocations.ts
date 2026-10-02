import { closePool, getPool } from './pool';

getPool().query('DELETE FROM app.vehicle_locations WHERE expires_at < now()')
  .then(result => console.info(JSON.stringify({ level: 'info', task: 'prune-locations', deleted: result.rowCount })))
  .catch(error => { console.error(JSON.stringify({ level: 'error', task: 'prune-locations', kind: error instanceof Error ? error.name : 'unknown' })); process.exitCode = 1; })
  .finally(() => closePool());
