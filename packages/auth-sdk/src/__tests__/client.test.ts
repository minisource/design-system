import { describe, it, expect, vi } from 'vitest';
import { createApiClient } from '@minisource/api-core';
import { createAuthClient } from '../index';
import type { ApiClient } from '@minisource/api-core';

/** A minimal transport double that records calls and returns canned data. */
function makeTransport() {
  const calls: Array<{ method: string; path: string; body?: unknown; params?: unknown }> = [];
  const transport = {
    get: vi.fn(async (path: string, options?: { params?: unknown }) => {
      calls.push({ method: 'GET', path, params: options?.params });
      return { page: 1, users: [] };
    }),
    post: vi.fn(async (path: string, body?: unknown) => {
      calls.push({ method: 'POST', path, body });
      return {};
    }),
    put: vi.fn(async (path: string, body?: unknown) => {
      calls.push({ method: 'PUT', path, body });
      return {};
    }),
    patch: vi.fn(async (path: string, body?: unknown) => {
      calls.push({ method: 'PATCH', path, body });
      return {};
    }),
    delete: vi.fn(async (path: string) => {
      calls.push({ method: 'DELETE', path });
      return {};
    }),
    resolveUrl: (path: string) => `https://x.test${path}`,
    setBaseUrl: () => {},
  } as unknown as ApiClient;
  return { transport, calls };
}

describe('auth-sdk facade', () => {
  it('users.search maps to GET /admin/users with params', async () => {
    const { transport, calls } = makeTransport();
    const client = createAuthClient({ transport });
    await client.users.search({ page: 2, pageSize: 15, search: 'ali' });
    expect(transport.get).toHaveBeenCalledWith('/admin/users', {
      params: { page: 2, pageSize: 15, search: 'ali' },
    });
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/admin/users' });
  });

  it('auth.login maps to POST /auth/login with credentials', async () => {
    const { transport, calls } = makeTransport();
    const client = createAuthClient({ transport });
    await client.auth.login({ email: 'a@b.c', password: 'secret' });
    expect(transport.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'a@b.c', password: 'secret' },
      undefined,
    );
    expect(calls[0].body).toEqual({ email: 'a@b.c', password: 'secret' });
  });

  it('me.tenants maps to GET /users/me/tenants', async () => {
    const { transport } = makeTransport();
    const client = createAuthClient({ transport });
    await client.me.tenants();
    expect(transport.get).toHaveBeenCalledWith('/users/me/tenants', undefined);
  });

  it('users.setStatus maps to PATCH /admin/users/:id/status/:status', async () => {
    const { transport } = makeTransport();
    const client = createAuthClient({ transport });
    await client.users.setStatus('u1', 'inactive');
    expect(transport.patch).toHaveBeenCalledWith(
      '/admin/users/u1/status/inactive',
      undefined,
      undefined,
    );
  });

  it('admin.toolsHealth maps to GET /admin/tools/health', async () => {
    const { transport } = makeTransport();
    const client = createAuthClient({ transport });
    await client.admin.toolsHealth();
    expect(transport.get).toHaveBeenCalledWith('/admin/tools/health', undefined);
  });

  it('works with a real api-core transport (integration)', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ success: true, data: { page: 1, total: 0, users: [] } }),
    })) as unknown as typeof fetch;

    const transport = createApiClient({
      baseUrl: '/v1',
      fetchImpl,
      unwrapEnvelope: true,
    });
    const client = createAuthClient({ transport });
    const result = await client.users.search({ page: 1 });
    expect(result).toEqual({ page: 1, total: 0, users: [] });
    expect(fetchImpl).toHaveBeenCalled();
  });
});
