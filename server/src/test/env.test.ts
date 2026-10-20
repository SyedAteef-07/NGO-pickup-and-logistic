import { describe, expect, it } from 'vitest';
import { parseDatabaseUrl } from '../config/env';

describe('parseDatabaseUrl', () => {
  it('returns undefined for empty or missing values', () => {
    expect(parseDatabaseUrl(undefined)).toBeUndefined();
    expect(parseDatabaseUrl('')).toBeUndefined();
    expect(parseDatabaseUrl('   ')).toBeUndefined();
  });

  it('accepts valid postgresql: and postgres: URLs', () => {
    expect(parseDatabaseUrl('postgresql://user:pass@localhost:5432/mydb')).toBe('postgresql://user:pass@localhost:5432/mydb');
    expect(parseDatabaseUrl('postgres://user:pass@remotehost:5432/postgres')).toBe('postgres://user:pass@remotehost:5432/postgres');
  });

  it('rejects unsupported protocols with a clear message', () => {
    expect(() => parseDatabaseUrl('http://localhost:5432/mydb')).toThrow('DATABASE_URL protocol must be postgresql: or postgres:.');
    expect(() => parseDatabaseUrl('mysql://user:pass@localhost:3306/mydb')).toThrow('DATABASE_URL protocol must be postgresql: or postgres:.');
  });

  it('rejects malformed URLs without leaking sensitive contents', () => {
    const sensitive = 'not-a-valid-url-with-secret-password-12345';
    expect(() => parseDatabaseUrl(sensitive)).toThrow('DATABASE_URL must be a valid PostgreSQL connection URL.');
    try {
      parseDatabaseUrl(sensitive);
    } catch (error) {
      expect((error as Error).message).not.toContain('secret-password-12345');
    }
  });
});
