import type {
  ApiClientConfig,
  DiagnosticsInfo,
  HttpMethod,
  HeaderMap,
  QueryParams,
  RequestOptions,
} from './types';
import { ApiError, isApiError, normalizeHttpError, normalizeTransportError } from './errors';
import { serializeQuery, sanitizeUrl } from './query';

/** Default response envelope unwrap used by MiniSource services: { success, data }. */
type Envelope<T> = { success?: boolean; data?: T; error?: { code?: string; message?: string } };

export interface ApiClient {
  /** Low-level typed request returning the parsed (optionally unwrapped) payload. */
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
  /** Resolve the fully-qualified URL for a path (used by diagnostics/tests). */
  resolveUrl(path: string, params?: RequestOptions['params']): string;
  /** Replace the base URL at runtime (e.g. tenant-scoped gateways). */
  setBaseUrl(baseUrl: string): void;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function buildResolvedBaseUrl(baseUrl: string): string {
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) return baseUrl;
  if (baseUrl.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${baseUrl}`;
    }
    return baseUrl;
  }
  return baseUrl;
}

/**
 * Combine an external AbortSignal with a timeout into a single controller.
 * Cleans up listeners; returns null when no external signal and no timeout.
 */
function combineSignal(
  external: AbortSignal | undefined,
  timeoutMs: number,
): { controller: AbortController; cleanup: () => void } | null {
  if (!external && timeoutMs <= 0) return null;

  const controller = new AbortController();
  const cleanup: (() => void)[] = [];

  if (external) {
    if (external.aborted) {
      controller.abort(external.reason);
    } else {
      const onAbort = () => controller.abort(external.reason);
      external.addEventListener('abort', onAbort, { once: true });
      cleanup.push(() => external.removeEventListener('abort', onAbort));
    }
  }

  if (timeoutMs > 0) {
    const timer = setTimeout(() => controller.abort(new Error('REQUEST_TIMEOUT')), timeoutMs);
    cleanup.push(() => clearTimeout(timer));
  }

  return {
    controller,
    cleanup: () => cleanup.forEach((fn) => fn()),
  };
}

/** Returns a stable request ID (crypto.randomUUID when available). */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** True when a method is idempotent (safe to retry without duplicate side effects). */
function isSafeMethod(method: HttpMethod): boolean {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  let baseUrl = config.baseUrl;
  const fetchImpl = config.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== 'function') {
    throw new Error(
      '@minisource/api-core: fetch is not available. Provide `fetchImpl` in the client config.',
    );
  }

  const defaultRetryableStatuses = [429, 500, 502, 503, 504];
  const retryPolicy = config.retry
    ? {
        maxAttempts: Math.max(1, config.retry.maxAttempts),
        retryableStatuses: config.retry.retryableStatuses ?? defaultRetryableStatuses,
        baseDelayMs: config.retry.baseDelayMs ?? 250,
        shouldRetry: config.retry.shouldRetry,
      }
    : null;

  async function buildHeaders(options: RequestOptions): Promise<HeaderMap> {
    const headers: HeaderMap = { ...(config.defaultHeaders ?? {}) };
    headers['X-Request-Id'] = generateRequestId();

    if (options.body !== undefined && !(options.body instanceof FormData)) {
      if (!Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
        headers['Content-Type'] = 'application/json';
      }
    }

    if (!options.skipAuth) {
      if (config.getAccessToken) {
        const token = await config.getAccessToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      if (config.getContextHeaders) {
        const ctx = await config.getContextHeaders();
        Object.assign(headers, ctx);
      }
    }

    return { ...headers, ...options.headers };
  }

  function serializeBody(options: RequestOptions): string | FormData | undefined {
    if (options.body === undefined) return undefined;
    if (options.serializeBody) return options.serializeBody(options.body);
    if (options.body instanceof FormData) return options.body;
    if (typeof options.body === 'string') return options.body;
    return JSON.stringify(options.body);
  }

  async function attempt<T>(path: string, options: RequestOptions, attemptNumber: number): Promise<T> {
    const method = (options.method ?? 'GET').toUpperCase() as HttpMethod;
    const url = buildUrl(path, options.params);

    const headers = await buildHeaders(options);
    const body = serializeBody(options);

    const effectiveTimeout = options.timeoutMs ?? config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const combined = combineSignal(options.signal, effectiveTimeout);

    const startedAt = Date.now();
    let fetchResponse: Response | undefined;
    let fetchError: unknown;

    try {
      fetchResponse = await fetchImpl(url, {
        method,
        headers,
        body,
        signal: combined?.controller.signal,
        credentials: options.credentials ?? config.credentials,
      });
    } catch (err) {
      fetchError = err;
    } finally {
      combined?.cleanup();
    }

    const durationMs = Date.now() - startedAt;
    const requestId = headers['X-Request-Id'];
    const correlationId = headers['X-Correlation-Id'] ?? headers['x-correlation-id'];
    const traceId = headers['traceparent'] ?? headers['x-trace-id'];

    if (fetchError || !fetchResponse) {
      const apiError = normalizeTransportError(fetchError ?? new Error('Empty fetch response'));
      emitDiagnostics({ method, url: sanitizeUrlForDiag(url, options.params), status: undefined, durationMs, requestId, correlationId, traceId, ok: false, retryAttempt: attemptNumber });
      throw apiError;
    }

    const response = fetchResponse;
    const text = await response.text();
    let parsedBody: unknown = undefined;
    let invalidResponseError: ApiError | undefined;

    if (text.length > 0) {
      try {
        parsedBody = JSON.parse(text);
      } catch {
        invalidResponseError = normalizeTransportError(
          new Error(`Invalid JSON response (status ${response.status})`),
          'invalid_response',
        );
      }
    }

    if (response.ok) {
      if (invalidResponseError) {
        emitDiagnostics({ method, url: sanitizeUrlForDiag(url, options.params), status: response.status, durationMs, requestId, correlationId, traceId, ok: false, retryAttempt: attemptNumber });
        throw invalidResponseError;
      }
      const result = unwrapIfEnabled<T>(parsedBody, response.status, response.headers);
      emitDiagnostics({ method, url: sanitizeUrlForDiag(url, options.params), status: response.status, durationMs, requestId, correlationId, traceId, ok: true, retryAttempt: attemptNumber });
      return result;
    }

    const apiError = invalidResponseError
      ? invalidResponseError
      : normalizeHttpError(response.status, parsedBody, response.headers, new Error(`HTTP ${response.status}`));
    emitDiagnostics({ method, url: sanitizeUrlForDiag(url, options.params), status: response.status, durationMs, requestId, correlationId, traceId, ok: false, retryAttempt: attemptNumber });

    throw apiError;
  }

  function unwrapIfEnabled<T>(body: unknown, status: number, headers?: Headers): T {
    if (!config.unwrapEnvelope) return body as T;
    if (typeof body !== 'object' || body === null) return body as T;
    const envelope = body as Envelope<T>;
    if (envelope && 'success' in envelope) {
      if (envelope.success === false) {
        const apiError = normalizeHttpError(
          status || 500,
          envelope,
          headers,
          new Error('Envelope success=false'),
        );
        if (envelope.error?.code) {
          apiError.code = envelope.error.code;
          apiError.message = envelope.error.message || apiError.message;
        }
        throw apiError;
      }
      if ('data' in envelope) return envelope.data as T;
    }
    return body as T;
  }

  function emitDiagnostics(diag: DiagnosticsInfo): void {
    config.onDiagnostics?.(diag);
  }

  function buildUrl(path: string, params?: RequestOptions['params']): string {
    return resolveUrl(path, params);
  }

  function resolveUrl(path: string, params?: RequestOptions['params']): string {
    let resolvedBase = buildResolvedBaseUrl(baseUrl);
    if (!/^https?:\/\//.test(resolvedBase) && typeof window !== 'undefined' && window.location?.origin) {
      resolvedBase = `${window.location.origin}${resolvedBase}`;
    }
    const base = resolvedBase.endsWith('/') ? resolvedBase : `${resolvedBase}/`;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const search = serializeQuery(params);
    const qs = search.toString();
    return qs ? `${base}${cleanPath}?${qs}` : `${base}${cleanPath}`;
  }

  function sanitizeUrlForDiag(url: string, params?: QueryParams): string {
    // Rebuild the diagnostics URL from the raw path + params using the single
    // exported sanitizer (literal [REDACTED] markers; never the real values).
    const [pathPart] = url.split('?');
    return sanitizeUrl(pathPart ?? url, '', params);
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = (options.method ?? 'GET').toUpperCase() as HttpMethod;

    // Retry is opt-in; mutations never retry unless the policy explicitly allows
    // a safe method AND the caller opted in (mutation retry would duplicate side effects).
    if (!retryPolicy || retryPolicy.maxAttempts <= 1 || !isSafeMethod(method)) {
      return attempt<T>(path, options, 1);
    }

    let lastError: unknown;
    const maxAttempts = retryPolicy.maxAttempts;

    for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
      try {
        return await attempt<T>(path, options, attemptNumber);
      } catch (err) {
        lastError = err;
        if (attemptNumber >= maxAttempts) break;

        if (!isApiError(err)) break;
        const apiErr = err as ApiError;

        // Never retry auth failures or cancelled requests.
        if (
          apiErr.kind === 'unauthenticated' ||
          apiErr.kind === 'forbidden' ||
          apiErr.kind === 'cancelled' ||
          apiErr.kind === 'validation' ||
          apiErr.kind === 'not_found' ||
          apiErr.kind === 'conflict'
        ) {
          break;
        }

        if (retryPolicy.shouldRetry && !retryPolicy.shouldRetry(attemptNumber, apiErr)) break;

        const eligible =
          apiErr.kind === 'rate_limited' ||
          apiErr.kind === 'server' ||
          apiErr.kind === 'network' ||
          apiErr.kind === 'timeout' ||
          (apiErr.status !== undefined &&
            retryPolicy.retryableStatuses.includes(apiErr.status));

        if (!eligible) break;

        const delayMs =
          retryPolicy.baseDelayMs * Math.pow(2, attemptNumber - 1) +
          Math.floor(Math.random() * 50);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }

  const client: ApiClient = {
    request,
    get: <T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
      request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
      request<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
      request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
      request<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
      request<T>(path, { ...options, method: 'DELETE' }),
    resolveUrl: (path, params) => resolveUrl(path, params),
    setBaseUrl: (url: string) => {
      baseUrl = url;
    },
  };

  return client;
}
