/**
 * Normalized error model for @minisource/api-core.
 *
 * Every transport failure is normalized into one of these discriminated
 * union members. Safe backend fields (code, requestId, correlationId,
 * retryAfter, status) are preserved; raw backend messages are only used
 * when they are deemed user-safe or when no better message is available.
 */

export type ApiErrorKind =
  | 'validation'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'timeout'
  | 'cancelled'
  | 'network'
  | 'server'
  | 'invalid_response';

interface ApiErrorBase {
  kind: ApiErrorKind;
  /** User-safe message (never contains secrets or internal stack traces). */
  message: string;
  /** Machine-readable error code from the backend when available. */
  code?: string;
  /** HTTP status when the error came from an HTTP response. */
  status?: number;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  /** Seconds to wait before retrying (429 Retry-After). */
  retryAfter?: number;
  /** Validation field errors when the backend provides them. */
  fieldErrors?: Record<string, string[]>;
  /** Whether this error is safe to retry (network/timeout/5xx/429 only). */
  retryable: boolean;
  /** Underlying cause (never serialized; debugging only). */
  cause?: unknown;
}

export type ApiError =
  | (ApiErrorBase & { kind: 'validation'; fieldErrors?: Record<string, string[]> })
  | (ApiErrorBase & { kind: 'unauthenticated' })
  | (ApiErrorBase & { kind: 'forbidden' })
  | (ApiErrorBase & { kind: 'not_found' })
  | (ApiErrorBase & { kind: 'conflict' })
  | (ApiErrorBase & { kind: 'rate_limited'; retryAfter?: number })
  | (ApiErrorBase & { kind: 'timeout' })
  | (ApiErrorBase & { kind: 'cancelled' })
  | (ApiErrorBase & { kind: 'network' })
  | (ApiErrorBase & { kind: 'server' })
  | (ApiErrorBase & { kind: 'invalid_response' });

/** Backend error envelope commonly produced by MiniSource services. */
export interface BackendErrorEnvelope {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    fields?: Record<string, string[]> | unknown;
  };
  requestId?: string;
  correlationId?: string;
  traceId?: string;
}

const SAFE_DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  validation: 'The submitted data is invalid.',
  unauthenticated: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to perform this action.',
  not_found: 'The requested resource was not found.',
  conflict: 'The request conflicts with the current state.',
  rate_limited: 'Too many requests. Please try again shortly.',
  timeout: 'The request timed out. Please try again.',
  cancelled: 'The request was cancelled.',
  network: 'Could not reach the server. Check your connection and try again.',
  server: 'The server encountered an unexpected error.',
  invalid_response: 'The server returned an unexpected response.',
};

function pickSafeMessage(kind: ApiErrorKind, backendMessage?: string): string {
  if (backendMessage && backendMessage.length > 0 && backendMessage.length <= 500) {
    return backendMessage;
  }
  return SAFE_DEFAULT_MESSAGES[kind];
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    typeof (value as ApiError).message === 'string'
  );
}

function parseBackendEnvelope(body: unknown): BackendErrorEnvelope {
  if (typeof body === 'object' && body !== null) {
    return body as BackendErrorEnvelope;
  }
  return {};
}

/** Create a normalized ApiError from a backend error envelope. */
export function createApiError(
  kind: ApiErrorKind,
  options: {
    status?: number;
    backendMessage?: string;
    code?: string;
    requestId?: string;
    correlationId?: string;
    traceId?: string;
    retryAfter?: number;
    fieldErrors?: Record<string, string[]>;
    cause?: unknown;
  } = {},
): ApiError {
  const retryable =
    kind === 'network' || kind === 'timeout' || kind === 'server' || kind === 'rate_limited';
  const base: ApiErrorBase = {
    kind,
    message: pickSafeMessage(kind, options.backendMessage),
    code: options.code,
    status: options.status,
    requestId: options.requestId,
    correlationId: options.correlationId,
    traceId: options.traceId,
    retryAfter: options.retryAfter,
    fieldErrors: options.fieldErrors,
    retryable,
    cause: options.cause,
  };
  return base as ApiError;
}

/** Map an HTTP status to an error kind. */
export function statusToErrorKind(status: number): ApiErrorKind {
  if (status === 400) return 'validation';
  if (status === 401) return 'unauthenticated';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'invalid_response';
}

/** Normalize an HTTP error response (status + body + headers) into an ApiError. */
export function normalizeHttpError(
  status: number,
  body: unknown,
  headers?: Headers | Record<string, string>,
  cause?: unknown,
): ApiError {
  const envelope = parseBackendEnvelope(body);
  const kind = statusToErrorKind(status);

  const getHeader = (name: string): string | undefined => {
    if (!headers) return undefined;
    if (typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(name) ?? undefined;
    }
    const map = headers as Record<string, string>;
    const key = Object.keys(map).find((k) => k.toLowerCase() === name.toLowerCase());
    return key ? map[key] : undefined;
  };

  const retryAfter = getHeader('retry-after');
  let retryAfterSeconds: number | undefined;
  if (retryAfter) {
    const parsed = Number(retryAfter);
    retryAfterSeconds = Number.isFinite(parsed) ? parsed : undefined;
  }

  const details = envelope.error?.details;
  let fieldErrors: Record<string, string[]> | undefined;
  if (typeof details === 'object' && details !== null) {
    const fields = (details as Record<string, unknown>).fields;
    if (typeof fields === 'object' && fields !== null) {
      const normalized: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
        normalized[k] = Array.isArray(v) ? v.map(String) : [String(v)];
      }
      fieldErrors = normalized;
    }
  }
  if (!fieldErrors && envelope.error?.fields) {
    const raw = envelope.error.fields as Record<string, unknown>;
    const normalized: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(raw)) {
      normalized[k] = Array.isArray(v) ? v.map(String) : [String(v)];
    }
    fieldErrors = normalized;
  }

  return createApiError(kind, {
    status,
    backendMessage: envelope.error?.message,
    code: envelope.error?.code,
    requestId: envelope.requestId ?? getHeader('x-request-id'),
    correlationId: envelope.correlationId ?? getHeader('x-correlation-id'),
    traceId: envelope.traceId ?? getHeader('x-trace-id') ?? getHeader('traceparent'),
    retryAfter: retryAfterSeconds,
    fieldErrors,
    cause,
  });
}

/** Normalize a non-HTTP failure (fetch throw, timeout, abort, malformed JSON). */
export function normalizeTransportError(
  cause: unknown,
  kind?: ApiErrorKind,
): ApiError {
  const err = cause instanceof Error ? cause : new Error(String(cause));

  if (kind === 'cancelled' || err.name === 'AbortError') {
    return createApiError('cancelled', { backendMessage: err.message, cause });
  }
  if (kind === 'timeout') {
    return createApiError('timeout', { backendMessage: err.message, cause });
  }
  if (kind) {
    return createApiError(kind, { backendMessage: err.message, cause });
  }

  const lower = err.message.toLowerCase();
  if (/timeout|timed out|abort/i.test(lower)) {
    return createApiError('timeout', { backendMessage: err.message, cause });
  }
  if (/failed to fetch|network|econnrefused|fetch failed|load failed/i.test(lower)) {
    return createApiError('network', { backendMessage: err.message, cause });
  }
  return createApiError('network', { backendMessage: err.message, cause });
}
