import type { HeaderMap } from './types';

/** Header names whose values must never leak into logs/diagnostics. */
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'api-key',
  'refresh-token',
  'access-token',
  'x-auth-token',
  'otp',
  'x-otp',
]);

/**
 * Redact sensitive header values while keeping the keys (and safe values) visible.
 */
export function redactHeaders(headers: HeaderMap | undefined): HeaderMap {
  if (!headers) return {};
  const out: HeaderMap = {};
  for (const [key, value] of Object.entries(headers)) {
    out[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return out;
}

/** True when a header value must be redacted. */
export function isSensitiveHeader(name: string): boolean {
  return SENSITIVE_HEADERS.has(name.toLowerCase());
}
