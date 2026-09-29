import type { ApiResponse } from '@aaharaconnect/shared';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export class ApiClientError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

/** Future mobile services should use this client instead of calling fetch in screens. */
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new ApiClientError(0, 'MISSING_API_URL', 'Set EXPO_PUBLIC_API_BASE_URL in apps/mobile/.env.');

  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`, {
      ...options, headers, body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiClientError(0, 'NETWORK_ERROR', 'Could not reach the API.');
  }

  if (response.status === 204 && response.ok) return undefined as T;

  let payload: ApiResponse<T>;
  try { payload = await response.json() as ApiResponse<T>; }
  catch { throw new ApiClientError(response.status, 'INVALID_RESPONSE', 'The API returned invalid JSON.'); }
  if (!payload || typeof payload !== 'object' || !('success' in payload)) {
    throw new ApiClientError(response.status, 'INVALID_RESPONSE', 'The API returned an unexpected response.');
  }
  if (!response.ok || !payload.success) {
    const error = payload.success ? { code: 'HTTP_ERROR', message: `Request failed (${response.status}).` } : payload.error;
    throw new ApiClientError(response.status, error.code, error.message);
  }
  return payload.data;
}
