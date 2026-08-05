import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient, isApiError } from '../index';
import type { ApiClientConfig } from '../types';

/** Minimal Response-like object satisfying the client's usage. */
function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) normalized[k.toLowerCase()] = v;
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => normalized[name.toLowerCase()] ?? null,
    },
    text: async () => text,
  } as unknown as Response;
}

type FetchMock = ReturnType<typeof vi.fn>;

function makeClient(overrides: Partial<ApiClientConfig> = {}, fetchMock?: FetchMock) {
  const fetchImpl = fetchMock ?? vi.fn();
  const client = createApiClient({
    baseUrl: 'https://gateway.example.test',
    fetchImpl: fetchImpl as unknown as typeof fetch,
    ...overrides,
  });
  return { client, fetchImpl };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('api-core client', () => {
  it('GET: returns parsed JSON on success', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(jsonResponse({ id: 'u1', name: 'Alice' }));
    const result = await client.get<{ id: string; name: string }>('/users/me');
    expect(result).toEqual({ id: 'u1', name: 'Alice' });
    const url = fetchImpl.mock.calls[0][0] as string;
    expect(url).toBe('https://gateway.example.test/users/me');
  });

  it('GET: empty success response resolves to undefined', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(jsonResponse('', 204));
    const result = await client.get<undefined>('/users/me/delete');
    expect(result).toBeUndefined();
  });

  it('unwrapEnvelope: returns data when success=true', async () => {
    const { client, fetchImpl } = makeClient({ unwrapEnvelope: true });
    fetchImpl.mockResolvedValue(jsonResponse({ success: true, data: { token: 'abc' } }));
    const result = await client.get<{ token: string }>('/auth/login');
    expect(result).toEqual({ token: 'abc' });
  });

  it('unwrapEnvelope: throws normalized error when success=false', async () => {
    const { client, fetchImpl } = makeClient({ unwrapEnvelope: true });
    fetchImpl.mockResolvedValue(
      jsonResponse({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Bad login' } }, 401),
    );
    await expect(client.get('/auth/login')).rejects.toMatchObject({
      kind: 'unauthenticated',
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('validation error (400) is classified with fieldErrors', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(
      jsonResponse(
        {
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: { fields: { email: ['required'] } } },
        },
        400,
      ),
    );
    try {
      await client.post('/admin/users', {});
      expect.unreachable();
    } catch (err) {
      expect(isApiError(err)).toBe(true);
      expect(err).toMatchObject({ kind: 'validation', status: 400, code: 'VALIDATION_ERROR' });
      expect((err as { fieldErrors?: Record<string, string[]> }).fieldErrors).toEqual({ email: ['required'] });
    }
  });

  it('401/403 classified as unauthenticated/forbidden', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValueOnce(jsonResponse({ error: { code: 'UNAUTHORIZED' } }, 401));
    fetchImpl.mockResolvedValueOnce(jsonResponse({ error: { code: 'FORBIDDEN' } }, 403));
    await expect(client.get('/admin/users')).rejects.toMatchObject({ kind: 'unauthenticated', status: 401 });
    await expect(client.get('/admin/users')).rejects.toMatchObject({ kind: 'forbidden', status: 403 });
  });

  it('404/409 classified as not_found/conflict', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValueOnce(jsonResponse({ error: { code: 'NOT_FOUND' } }, 404));
    fetchImpl.mockResolvedValueOnce(jsonResponse({ error: { code: 'CONFLICT' } }, 409));
    await expect(client.get('/x/1')).rejects.toMatchObject({ kind: 'not_found' });
    await expect(client.get('/x/1')).rejects.toMatchObject({ kind: 'conflict' });
  });

  it('429 rate_limited honors Retry-After', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(
      jsonResponse({ error: { code: 'RATE_LIMITED' } }, 429, { 'Retry-After': '7' }),
    );
    await expect(client.get('/admin/users')).rejects.toMatchObject({
      kind: 'rate_limited',
      retryAfter: 7,
    });
  });

  it('5xx classified as server', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(jsonResponse({ error: { code: 'INTERNAL' } }, 502));
    await expect(client.get('/admin/users')).rejects.toMatchObject({ kind: 'server', status: 502 });
  });

  it('malformed JSON on 2xx becomes invalid_response', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(jsonResponse('<html>oops</html>', 200));
    await expect(client.get('/admin/users')).rejects.toMatchObject({ kind: 'invalid_response' });
  });

  it('network failure (fetch reject) is classified as network', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(client.get('/admin/users')).rejects.toMatchObject({ kind: 'network', retryable: true });
  });

  it('timeout aborts the request and throws timeout', async () => {
    const { client, fetchImpl } = makeClient({ timeoutMs: 10 });
    fetchImpl.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        }),
    );
    await expect(client.get('/slow')).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('cancellation via AbortSignal throws cancelled', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const e = new Error('Aborted');
            e.name = 'AbortError';
            reject(e);
          });
        }),
    );
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5);
    await expect(client.get('/cancel', { signal: controller.signal })).rejects.toMatchObject({
      kind: 'cancelled',
    });
  });

  it('header injection: Authorization bearer + context headers + per-request override', async () => {
    const { client, fetchImpl } = makeClient({
      getAccessToken: async () => 'tok-123',
      getContextHeaders: async () => ({ 'X-Tenant-Id': 'tenant-1', 'X-Language': 'en' }),
      defaultHeaders: { 'X-App': 'notifier' },
    });
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }));
    await client.get('/admin/users', { headers: { 'X-Language': 'fa' } });
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer tok-123');
    expect(headers['X-Tenant-Id']).toBe('tenant-1');
    expect(headers['X-Language']).toBe('fa');
    expect(headers['X-App']).toBe('notifier');
    expect(headers['X-Request-Id']).toBeTruthy();
  });

  it('skipAuth omits token and context headers', async () => {
    const { client, fetchImpl } = makeClient({
      getAccessToken: async () => 'tok-123',
      getContextHeaders: async () => ({ 'X-Tenant-Id': 't1' }),
    });
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }));
    await client.get('/auth/login', { skipAuth: true });
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
    expect(headers['X-Tenant-Id']).toBeUndefined();
  });

  it('query serialization: skips empty values, repeats arrays, encodes strings', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }));
    await client.get('/admin/notifications', {
      params: { page: 1, pageSize: 20, status: undefined, q: 'a b', types: ['sms', 'email'] },
    });
    const url = fetchImpl.mock.calls[0][0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('pageSize=20');
    expect(url).toContain('q=a+b');
    expect(url).toContain('types=sms');
    expect(url).toContain('types=email');
    expect(url).not.toContain('status=');
  });

  it('token redaction: diagnostics URL redacts sensitive query values', async () => {
    const diags: unknown[] = [];
    const { client, fetchImpl } = makeClient({
      onDiagnostics: (d) => diags.push(d),
    });
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }));
    await client.get('/admin/users', { params: { page: 1, token: 'SECRET', otp: '1234' } });
    const url = (diags[0] as { url: string }).url;
    expect(url).toContain('token=[REDACTED]');
    expect(url).toContain('otp=[REDACTED]');
    expect(url).not.toContain('SECRET');
    expect(url).not.toContain('1234');
  });

  it('diagnostics: emits method, status, durationMs, ok, requestId', async () => {
    const diags: unknown[] = [];
    const { client, fetchImpl } = makeClient({
      onDiagnostics: (d) => diags.push(d),
    });
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }, 200));
    await client.get('/health');
    expect(diags).toHaveLength(1);
    const d = diags[0] as { method: string; status: number; durationMs: number; ok: boolean; requestId?: string };
    expect(d.method).toBe('GET');
    expect(d.status).toBe(200);
    expect(d.durationMs).toBeGreaterThanOrEqual(0);
    expect(d.ok).toBe(true);
    expect(d.requestId).toBeTruthy();
  });

  it('no mutation retry by default even with a retry policy', async () => {
    const { client, fetchImpl } = makeClient({
      retry: { maxAttempts: 3, baseDelayMs: 0 },
    });
    fetchImpl.mockResolvedValue(jsonResponse({ error: { code: 'INTERNAL' } }, 500));
    await expect(client.post('/admin/notifications', { body: 'x' })).rejects.toMatchObject({
      kind: 'server',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('GET retries on 500 with policy and stops on success', async () => {
    const { client, fetchImpl } = makeClient({
      retry: { maxAttempts: 3, baseDelayMs: 0 },
    });
    fetchImpl
      .mockResolvedValueOnce(jsonResponse({ error: { code: 'INTERNAL' } }, 500))
      .mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    const result = await client.get<{ ok: boolean }>('/health');
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('GET retry does not retry 401', async () => {
    const { client, fetchImpl } = makeClient({
      retry: { maxAttempts: 3, baseDelayMs: 0 },
    });
    fetchImpl.mockResolvedValue(jsonResponse({ error: { code: 'UNAUTHORIZED' } }, 401));
    await expect(client.get('/admin/users')).rejects.toMatchObject({ kind: 'unauthenticated' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('request body serialized as JSON with Content-Type', async () => {
    const { client, fetchImpl } = makeClient();
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }));
    await client.post('/admin/users', { email: 'a@b.c' });
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ email: 'a@b.c' }));
  });

  it('setBaseUrl swaps the runtime base URL', async () => {
    const { client, fetchImpl } = makeClient();
    client.setBaseUrl('https://other.example.test');
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }));
    await client.get('/users/me');
    expect(fetchImpl.mock.calls[0][0]).toBe('https://other.example.test/users/me');
  });

  it('relative base URL resolves against window origin in browser-like env', async () => {
    (globalThis as { window?: unknown }).window = { location: { origin: 'http://localhost:8080' } };
    const { client, fetchImpl } = makeClient({ baseUrl: '/v1' });
    fetchImpl.mockResolvedValue(jsonResponse({ ok: true }));
    await client.get('/admin/users');
    expect(fetchImpl.mock.calls[0][0]).toBe('http://localhost:8080/v1/admin/users');
  });
});
