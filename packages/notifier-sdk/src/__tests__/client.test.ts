import { describe, it, expect, vi } from 'vitest';
import { createNotifierClient } from '../index';
import type { ApiClient } from '@minisource/api-core';

function makeTransport() {
  const calls: Array<{ method: string; path: string; body?: unknown; params?: unknown }> = [];
  const transport = {
    get: vi.fn(async (path: string, options?: { params?: unknown }) => {
      calls.push({ method: 'GET', path, params: options?.params });
      return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    }),
    post: vi.fn(async (path: string, body?: unknown) => {
      calls.push({ method: 'POST', path, body });
      return { id: 'n1' };
    }),
    put: vi.fn(async (path: string, body?: unknown) => {
      calls.push({ method: 'PUT', path, body });
      return { id: 'n1' };
    }),
    patch: vi.fn(async (path: string, body?: unknown) => {
      calls.push({ method: 'PATCH', path, body });
      return { id: 'n1' };
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

describe('notifier-sdk facade', () => {
  it('notifications.list maps to GET /admin/notifications with params', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.notifications.list({ page: 1, pageSize: 25, status: 'failed' });
    expect(transport.get).toHaveBeenCalledWith('/admin/notifications', {
      params: { page: 1, pageSize: 25, status: 'failed' },
    });
  });

  it('notifications.create maps to POST /admin/notifications with body and no retry', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.notifications.create({ body: 'Hello', channel: 'sms', recipientPhone: '+98...' });
    expect(transport.post).toHaveBeenCalledWith(
      '/admin/notifications',
      { body: 'Hello', channel: 'sms', recipientPhone: '+98...' },
      undefined,
    );
  });

  it('providers.test maps to POST /admin/providers/:id/test', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.providers.test('p1', { dryRun: true });
    expect(transport.post).toHaveBeenCalledWith('/admin/providers/p1/test', { dryRun: true }, undefined);
  });

  it('providers.healthCheckAll maps to POST /admin/providers/health-check', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.providers.healthCheckAll();
    expect(transport.post).toHaveBeenCalledWith('/admin/providers/health-check', {}, undefined);
  });

  it('tenants.list maps to GET /admin/notifications/tenants', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.tenants.list({ page: 1 });
    expect(transport.get).toHaveBeenCalledWith('/admin/notifications/tenants', { params: { page: 1 } });
  });

  it('dashboard.overview maps to GET /admin/dashboard/overview with tenant params', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.dashboard.overview({ tenantId: 't1' });
    expect(transport.get).toHaveBeenCalledWith('/admin/dashboard/overview', { params: { tenantId: 't1' } });
  });

  it('notifications.batch maps to POST /notifications/batch (public service route)', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.notifications.batch({ notifications: [{ body: 'x' }] });
    expect(transport.post).toHaveBeenCalledWith(
      '/notifications/batch',
      { notifications: [{ body: 'x' }] },
      undefined,
    );
  });

  it('deliveries.retry maps to POST /admin/deliveries/:id/retry', async () => {
    const { transport } = makeTransport();
    const client = createNotifierClient({ transport });
    await client.deliveries.retry('d1');
    expect(transport.post).toHaveBeenCalledWith('/admin/deliveries/d1/retry', {}, undefined);
  });
});
