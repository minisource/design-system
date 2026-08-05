import type { ApiClient, QueryParams, RequestOptions } from '@minisource/api-core';
import type {
  BatchNotificationInput,
  CreateNotificationInput,
  CreateProviderInput,
  CreateReminderInput,
  CreateTemplateInput,
  CreateTenantInput,
  DashboardOverview,
  ListNotificationsParams,
  ListProviderAttemptsParams,
  Notification,
  ProviderAttemptDetails,
  ProviderAttemptEvent,
  ProviderAttemptListResponse,
  ProviderAttemptSummary,
  NotificationDelivery,
  ObservabilityHealth,
  ObservabilityMetrics,
  PaginatedResponse,
  PreferenceResponse,
  Provider,
  ProviderHealthResponse,
  ProviderTestInput,
  ProviderTestResult,
  QueueOverview,
  ReadinessResult,
  Reminder,
  RenderPreviewInput,
  RenderPreviewResult,
  Tenant,
  Template,
  UpdatePreferenceInput,
  UpdateProviderInput,
  UpdateReminderInput,
  UpdateTemplateInput,
  UpdateTenantInput,
  WorkerOverview,
} from './types';

export interface NotifierClientConfig {
  /** api-core transport instance (owned by the consumer with its own adapters). */
  transport: ApiClient;
}

export interface NotifierClient {
  notifications: {
    list: (params?: ListNotificationsParams, options?: RequestOptions) => Promise<PaginatedResponse<Notification>>;
    get: (id: string, options?: RequestOptions) => Promise<Notification>;
    create: (input: CreateNotificationInput, options?: RequestOptions) => Promise<Notification>;
    batch: (input: BatchNotificationInput, options?: RequestOptions) => Promise<{ created?: number }>;
    /** Public service-to-service batch endpoint (POST /notifications/batch). */
    retry: (id: string, options?: RequestOptions) => Promise<Notification>;
    cancel: (id: string, options?: RequestOptions) => Promise<void>;
    markRead: (id: string, options?: RequestOptions) => Promise<void>;
    markSeen: (id: string, options?: RequestOptions) => Promise<void>;
    markClicked: (id: string, options?: RequestOptions) => Promise<void>;
    attempts: (id: string, options?: RequestOptions) => Promise<unknown[]>;
    deliveries: (id: string, options?: RequestOptions) => Promise<NotificationDelivery[]>;
    readAll: (userId: string, options?: RequestOptions) => Promise<void>;
  };
  deliveries: {
    list: (params?: { status?: string; provider?: string; page?: number; pageSize?: number }, options?: RequestOptions) => Promise<PaginatedResponse<NotificationDelivery>>;
    get: (id: string, options?: RequestOptions) => Promise<NotificationDelivery>;
    retry: (id: string, options?: RequestOptions) => Promise<Notification>;
  };
  providers: {
    list: (params?: { tenantId?: string }, options?: RequestOptions) => Promise<Provider[]>;
    get: (id: string, options?: RequestOptions) => Promise<Provider>;
    create: (input: CreateProviderInput, options?: RequestOptions) => Promise<Provider>;
    update: (id: string, input: UpdateProviderInput, options?: RequestOptions) => Promise<Provider>;
    remove: (id: string, options?: RequestOptions) => Promise<void>;
    toggleStatus: (id: string, isEnabled: boolean, options?: RequestOptions) => Promise<Provider>;
    setDefault: (id: string, isDefault: boolean, options?: RequestOptions) => Promise<Provider>;
    getHealth: (options?: RequestOptions) => Promise<ProviderHealthResponse>;
    healthCheckAll: (options?: RequestOptions) => Promise<ProviderHealthResponse>;
    test: (id: string, input?: ProviderTestInput, options?: RequestOptions) => Promise<ProviderTestResult>;
  };
  templates: {
    list: (params?: { type?: string; locale?: string; status?: string }, options?: RequestOptions) => Promise<Template[]>;
    get: (id: string, options?: RequestOptions) => Promise<Template>;
    getByKey: (key: string, options?: RequestOptions) => Promise<Template>;
    create: (input: CreateTemplateInput, options?: RequestOptions) => Promise<Template>;
    update: (id: string, input: UpdateTemplateInput, options?: RequestOptions) => Promise<Template>;
    remove: (id: string, options?: RequestOptions) => Promise<void>;
    renderPreview: (input: RenderPreviewInput, options?: RequestOptions) => Promise<RenderPreviewResult>;
    renderPreviewById: (id: string, variables: Record<string, string>, options?: RequestOptions) => Promise<RenderPreviewResult>;
    updateStatus: (id: string, status: string, options?: RequestOptions) => Promise<Template>;
  };
  reminders: {
    list: (params?: { status?: string; type?: string; page?: number; pageSize?: number }, options?: RequestOptions) => Promise<PaginatedResponse<Reminder>>;
    get: (id: string, options?: RequestOptions) => Promise<Reminder>;
    getUserReminders: (userId: string, options?: RequestOptions) => Promise<Reminder[]>;
    create: (input: CreateReminderInput, options?: RequestOptions) => Promise<Reminder>;
    update: (id: string, input: UpdateReminderInput, options?: RequestOptions) => Promise<Reminder>;
    remove: (id: string, options?: RequestOptions) => Promise<void>;
    cancel: (id: string, options?: RequestOptions) => Promise<Reminder>;
  };
  providerAttempts: {
    /** Paginated provider request lifecycle records (admin). */
    list: (params?: ListProviderAttemptsParams, options?: RequestOptions) => Promise<ProviderAttemptListResponse>;
    /** Full attempt record with sanitized request/response + events. */
    get: (id: string, options?: RequestOptions) => Promise<ProviderAttemptDetails>;
    /** Lifecycle timeline for one attempt. */
    events: (id: string, options?: RequestOptions) => Promise<ProviderAttemptEvent[]>;
    /** Attempt history for a specific notification. */
    listByNotification: (notificationId: string, options?: RequestOptions) => Promise<ProviderAttemptSummary[]>;
  };
  preferences: {
    list: (userId: string, options?: RequestOptions) => Promise<PreferenceResponse[]>;
    update: (userId: string, input: UpdatePreferenceInput, options?: RequestOptions) => Promise<PreferenceResponse>;
    updateChannel: (userId: string, channel: string, input: { isEnabled: boolean; allowInstant?: boolean; allowDigest?: boolean; digestFrequency?: string }, options?: RequestOptions) => Promise<PreferenceResponse>;
    updateCategory: (userId: string, category: string, input: { isEnabled: boolean }, options?: RequestOptions) => Promise<unknown>;
  };
  tenants: {
    list: (params?: { page?: number; pageSize?: number }, options?: RequestOptions) => Promise<Tenant[]>;
    get: (id: string, options?: RequestOptions) => Promise<Tenant>;
    create: (input: CreateTenantInput, options?: RequestOptions) => Promise<Tenant>;
    update: (id: string, input: UpdateTenantInput, options?: RequestOptions) => Promise<Tenant>;
    remove: (id: string, options?: RequestOptions) => Promise<void>;
    toggleStatus: (id: string, status: 'active' | 'inactive', options?: RequestOptions) => Promise<Tenant>;
  };
  dashboard: {
    overview: (params?: { tenantId?: string; projectId?: string; from?: string; to?: string }, options?: RequestOptions) => Promise<DashboardOverview>;
    health: (options?: RequestOptions) => Promise<ObservabilityHealth>;
    readiness: (options?: RequestOptions) => Promise<ReadinessResult>;
    metrics: (options?: RequestOptions) => Promise<ObservabilityMetrics>;
    queue: (options?: RequestOptions) => Promise<QueueOverview>;
    workers: (options?: RequestOptions) => Promise<WorkerOverview>;
  };
}

/**
 * Create a stable Notifier client facade over an api-core transport.
 *
 * The consumer owns the transport (base URL, token/context adapters). Dispatch
 * mutations never retry automatically (api-core default); idempotency keys are
 * passed through when the caller provides them.
 */
export function createNotifierClient(config: NotifierClientConfig): NotifierClient {
  const { transport } = config;

  return {
    notifications: {
      list: (params, options) => transport.get('/admin/notifications', { ...(options ?? {}), params: params as QueryParams }),
      get: (id, options) => transport.get(`/admin/notifications/${id}`, options),
      create: (input, options) => transport.post('/admin/notifications', input, options),
      batch: (input, options) => transport.post('/notifications/batch', input, options),
      retry: (id, options) => transport.post(`/admin/notifications/${id}/retry`, {}, options),
      cancel: (id, options) => transport.post(`/admin/notifications/${id}/cancel`, {}, options),
      markRead: (id, options) => transport.post(`/admin/notifications/${id}/read`, {}, options),
      markSeen: (id, options) => transport.post(`/admin/notifications/${id}/seen`, {}, options),
      markClicked: (id, options) => transport.post(`/admin/notifications/${id}/click`, {}, options),
      attempts: (id, options) => transport.get(`/admin/notifications/${id}/attempts`, options),
      deliveries: (id, options) => transport.get(`/admin/notifications/${id}/deliveries`, options),
      readAll: (userId, options) => transport.post(`/admin/notifications/read-all?userId=${encodeURIComponent(userId)}`, {}, options),
    },
    deliveries: {
      list: (params, options) => transport.get('/admin/deliveries', { ...(options ?? {}), params: params as QueryParams }),
      get: (id, options) => transport.get(`/admin/deliveries/${id}`, options),
      retry: (id, options) => transport.post(`/admin/deliveries/${id}/retry`, {}, options),
    },
    providers: {
      list: (params, options) => transport.get('/admin/providers', { ...(options ?? {}), params: params as QueryParams }),
      get: (id, options) => transport.get(`/admin/providers/${id}`, options),
      create: (input, options) => transport.post('/admin/providers', input, options),
      update: (id, input, options) => transport.put(`/admin/providers/${id}`, input, options),
      remove: (id, options) => transport.delete(`/admin/providers/${id}`, options),
      toggleStatus: (id, isEnabled, options) => transport.patch(`/admin/providers/${id}/status`, { isEnabled }, options),
      setDefault: (id, isDefault, options) => transport.patch(`/admin/providers/${id}/default`, { isDefault }, options),
      getHealth: (options) => transport.get('/admin/providers/health', options),
      healthCheckAll: (options) => transport.post('/admin/providers/health-check', {}, options),
      test: (id, input, options) => transport.post(`/admin/providers/${id}/test`, input ?? {}, options),
    },
    templates: {
      list: (params, options) => transport.get('/admin/templates', { ...(options ?? {}), params: params as QueryParams }),
      get: (id, options) => transport.get(`/admin/templates/${id}`, options),
      getByKey: (key, options) => transport.get(`/admin/templates/key/${encodeURIComponent(key)}`, options),
      create: (input, options) => transport.post('/admin/templates', input, options),
      update: (id, input, options) => transport.put(`/admin/templates/${id}`, input, options),
      remove: (id, options) => transport.delete(`/admin/templates/${id}`, options),
      renderPreview: (input, options) => transport.post('/admin/templates/render-preview', input, options),
      renderPreviewById: (id, variables, options) => transport.post(`/admin/templates/${id}/render-preview`, { variables }, options),
      updateStatus: (id, status, options) => transport.patch(`/admin/templates/${id}/status`, { status }, options),
    },
    providerAttempts: {
      list: (params, options) => transport.get('/admin/attempts', { ...(options ?? {}), params: params as QueryParams }),
      get: (id, options) => transport.get(`/admin/attempts/${id}`, options),
      events: (id, options) => transport.get(`/admin/attempts/${id}/events`, options),
      listByNotification: (notificationId, options) => transport.get(`/admin/notifications/${encodeURIComponent(notificationId)}/attempts`, options),
    },
    reminders: {
      list: (params, options) => transport.get('/admin/reminders', { ...(options ?? {}), params: params as QueryParams }),
      get: (id, options) => transport.get(`/admin/reminders/${id}`, options),
      getUserReminders: (userId, options) => transport.get(`/admin/reminders/user/${encodeURIComponent(userId)}`, options),
      create: (input, options) => transport.post('/admin/reminders', input, options),
      update: (id, input, options) => transport.put(`/admin/reminders/${id}`, input, options),
      remove: (id, options) => transport.delete(`/admin/reminders/${id}`, options),
      cancel: (id, options) => transport.post(`/admin/reminders/${id}/cancel`, {}, options),
    },
    preferences: {
      list: (userId, options) => transport.get(`/admin/preferences/user/${encodeURIComponent(userId)}`, options),
      update: (userId, input, options) => transport.put(`/admin/preferences/user/${encodeURIComponent(userId)}`, input, options),
      updateChannel: (userId, channel, input, options) => transport.patch(`/admin/preferences/user/${encodeURIComponent(userId)}/channel/${encodeURIComponent(channel)}`, input, options),
      updateCategory: (userId, category, input, options) => transport.patch(`/admin/preferences/user/${encodeURIComponent(userId)}/category/${encodeURIComponent(category)}`, input, options),
    },
    tenants: {
      list: (params, options) => transport.get('/admin/notifications/tenants', { ...(options ?? {}), params: params as QueryParams }),
      get: (id, options) => transport.get(`/admin/notifications/tenants/${id}`, options),
      create: (input, options) => transport.post('/admin/notifications/tenants', input, options),
      update: (id, input, options) => transport.put(`/admin/notifications/tenants/${id}`, input, options),
      remove: (id, options) => transport.delete(`/admin/notifications/tenants/${id}`, options),
      toggleStatus: (id, status, options) => transport.patch(`/admin/notifications/tenants/${id}/status/${status}`, undefined, options),
    },
    dashboard: {
      overview: (params, options) => transport.get('/admin/dashboard/overview', { ...(options ?? {}), params: params as QueryParams }),
      health: (options) => transport.get('/admin/observability/health', options),
      readiness: (options) => transport.get('/admin/observability/readiness', options),
      metrics: (options) => transport.get('/admin/observability/metrics', options),
      queue: (options) => transport.get('/admin/observability/queue', options),
      workers: (options) => transport.get('/admin/observability/workers', options),
    },
  };
}
