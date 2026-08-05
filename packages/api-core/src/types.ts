import type { ApiError } from './errors';

/**
 * Core transport types for @minisource/api-core.
 * Framework-independent: no React, no DOM-specific assumptions at this layer
 * beyond what the fetch API provides (injected via `fetchImpl`).
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

/** Plain string header map (lower-case keys are normalized by the client). */
export type HeaderMap = Record<string, string>;

/** How a request body is serialized. Defaults to JSON when body is an object. */
export type BodySerializer = (body: unknown) => string | FormData | undefined;

export interface RequestOptions {
  method?: HttpMethod;
  /** Per-request headers, merged over defaults and adapter headers. */
  headers?: HeaderMap;
  /** Query parameters serialized into the URL. */
  params?: QueryParams;
  /** Request body. Serialized as JSON unless a `serializeBody` is provided. */
  body?: unknown;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
  /** Per-request credentials mode (overrides client default). */
  credentials?: RequestCredentials;
  /** Per-request timeout (ms). Overrides the client default. */
  timeoutMs?: number;
  /** Skip the access-token adapter for this request (e.g. public endpoints). */
  skipAuth?: boolean;
  /** Custom body serializer for this request only. */
  serializeBody?: BodySerializer;
  /** Explicit opt-in retry policy. Mutations never retry by default. */
  retry?: RetryPolicy;
}

export interface RetryPolicy {
  /** Maximum number of attempts (including the first). 1 = no retry. */
  maxAttempts: number;
  /** HTTP statuses eligible for retry. Defaults to [429, 500, 502, 503, 504]. */
  retryableStatuses?: number[];
  /** Base delay (ms). Uses exponential backoff when > 1 attempt. */
  baseDelayMs?: number;
  /** Optional predicate overrides status eligibility. */
  shouldRetry?: (attempt: number, error: ApiError) => boolean;
}
export interface ContextHeaders {
  [header: string]: string;
}

/**
 * Adapters. The SDK never reads tokens/stores directly — consumers wire these.
 */
export interface ApiClientAdapters {
  /** Async provider for the bearer access token (or null). */
  getAccessToken?: () => string | null | Promise<string | null>;
  /** Async provider for context headers (tenant, project, language, trace...). */
  getContextHeaders?: () => ContextHeaders | Promise<ContextHeaders>;
}

export interface ApiClientConfig extends ApiClientAdapters {
  /** Base URL, e.g. runtime-resolved gateway base. Never hardcode a domain here. */
  baseUrl: string;
  /** Default headers applied to every request. */
  defaultHeaders?: HeaderMap;
  /** Default credentials mode passed to fetch (e.g. 'include', 'same-origin'). */
  credentials?: RequestCredentials;
  /** Default request timeout in ms. */
  timeoutMs?: number;
  /** fetch implementation override (for tests / non-browser runtimes). */
  fetchImpl?: typeof fetch;
  /** Default retry policy. Mutations are never retried unless explicitly allowed. */
  retry?: RetryPolicy;
  /**
   * When true, unwraps the MiniSource response envelope `{ success, data }`
   * and returns `data` directly. When `success === false`, throws a normalized
   * error built from the envelope's error payload.
   */
  unwrapEnvelope?: boolean;
  /** Emit diagnostics metadata after each request (sanitized). */
  onDiagnostics?: (diagnostics: DiagnosticsInfo) => void;
}

/** Sanitized, redacted diagnostics metadata exposed to consumers (e.g. Test Center). */
export interface DiagnosticsInfo {
  method: HttpMethod;
  /** Sanitized URL path (no credentials; query values redacted when sensitive). */
  url: string;
  status?: number;
  durationMs: number;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  ok: boolean;
  retryAttempt?: number;
}
