import type { QueryParams, QueryValue } from './types';

/** Parameter names whose values are redacted in diagnostics/logs. */
const SENSITIVE_PARAM_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'apikey',
  'api_key',
  'key',
  'secret',
  'password',
  'otp',
  'code',
]);

/**
 * Serialize query params into a URLSearchParams instance.
 * - skips null/undefined/'' values
 * - array values repeat the key (foo=1&foo=2)
 */
export function serializeQuery(params?: QueryParams): URLSearchParams {
  const search = new URLSearchParams();
  if (!params) return search;
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          search.append(key, String(item));
        }
      }
    } else if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  return search;
}

/**
 * Build a sanitized URL string for diagnostics.
 * Redacts the values of sensitive query keys (keeps the keys visible) using a
 * literal `[REDACTED]` marker (readable, not URL-encoded).
 */
export function sanitizeUrl(baseUrl: string, path: string, params?: QueryParams): string {
  let url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  if (!params) return url;

  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    const isSensitive = SENSITIVE_PARAM_KEYS.has(key.toLowerCase());
    const display = (v: QueryValue) =>
      isSensitive ? '[REDACTED]' : v === undefined || v === null ? '' : String(v);
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') parts.push(`${key}=${display(item)}`);
      }
    } else if (value !== undefined && value !== null && value !== '') {
      parts.push(`${key}=${display(value)}`);
    }
  }
  return parts.length ? `${url}?${parts.join('&')}` : url;
}
