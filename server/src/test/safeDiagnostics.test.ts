import { afterEach, describe, expect, it, vi } from 'vitest';
import { isDatabaseConnectionError, reportDevelopmentError } from '../utils/safeDiagnostics';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('safe development diagnostics', () => {
  it('logs a safe subsystem and code without error details', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const output = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = Object.assign(new Error('do-not-log database password'), { code: 'ENOTFOUND' });

    reportDevelopmentError(error, 'request-123');

    const entry = JSON.parse(String(output.mock.calls[0][0]));
    expect(entry).toMatchObject({ subsystem: 'PostgreSQL', errorClass: 'Error', code: 'ENOTFOUND', requestId: 'request-123' });
    expect(JSON.stringify(entry)).not.toContain('do-not-log database password');
    expect(entry.stack).toBeUndefined();
  });

  it('recognizes connection failures without treating SQL errors as connectivity failures', () => {
    expect(isDatabaseConnectionError(Object.assign(new Error(), { code: 'ETIMEDOUT' }))).toBe(true);
    expect(isDatabaseConnectionError(Object.assign(new Error(), { code: '08006' }))).toBe(true);
    expect(isDatabaseConnectionError(Object.assign(new Error(), { code: '42P01' }))).toBe(false);
  });

  it('does not emit diagnostics outside development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const output = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    reportDevelopmentError(new Error('private detail'), 'request-456');
    expect(output).not.toHaveBeenCalled();
  });
});
