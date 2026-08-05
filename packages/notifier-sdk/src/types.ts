/**
 * Notifier service contracts (@minisource/notifier-sdk).
 * Derived from the authoritative Notifier backend OpenAPI (notifier/backend/docs/swagger.json).
 * Browser-safe subset: no provider credentials, no server-only internals.
 */

// ==================== Common ====================

export type NotificationChannel =
  | 'sms'
  | 'email'
  | 'push'
  | 'in_app'
  | 'webhook'
  | 'security';

export type NotificationStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'dead'
  | 'cancelled'
  | 'canceled';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ProviderStatus =
  | 'healthy'
  | 'degraded'
  | 'down'
  | 'disabled'
  | 'unsupported'
  | 'unknown';

export type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'dead'
  | 'read'
  | 'seen'
  | 'clicked';

export type TemplateStatus = 'active' | 'inactive' | 'archived';
export type TemplateLocale = 'en' | 'fa';

// ==================== Pagination ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== Notifications ====================

export interface RecipientInput {
  phone?: string;
  email?: string;
  userId?: string;
  deviceToken?: string;
  webhookUrl?: string;
}

export interface CreateNotificationInput {
  userId?: string;
  channel?: NotificationChannel;
  type?: NotificationChannel;
  priority?: NotificationPriority;
  recipient?: RecipientInput;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientId?: string;
  recipientType?: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  templateId?: string;
  templateKey?: string;
  locale?: string;
  variables?: Record<string, string>;
  scheduledAt?: string;
  idempotencyKey?: string;
  tenantId?: string;
  projectId?: string;
  providerId?: string;
}

export interface BatchNotificationInput {
  notifications: CreateNotificationInput[];
}

export interface Notification {
  id: string;
  tenantId?: string;
  projectId?: string;
  userId: string;
  type: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientId?: string;
  recipientType?: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  templateId?: string;
  templateKey?: string;
  locale: string;
  variables?: Record<string, string>;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  seenAt?: string;
  readAt?: string;
  clickedAt?: string;
  failedAt?: string;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  errorCode?: string;
  provider?: string;
  providerId?: string;
  providerMsgId?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListNotificationsParams extends PaginationParams {
  type?: NotificationChannel;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  tenantId?: string;
  projectId?: string;
}

// ==================== Deliveries ====================

export interface DeliveryAttempt {
  id: string;
  deliveryId: string;
  attemptNumber: number;
  status: DeliveryStatus;
  errorMessage?: string;
  errorCode?: string;
  providerResponse?: string;
  providerResponseSanitized?: string;
  processingTimeMs: number;
  latencyMs?: number;
  createdAt: string;
  completedAt?: string;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  provider: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attemptCount: number;
  maxAttempts: number;
  lastError?: string;
  lastErrorMessage?: string;
  nextRetryAt?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientId?: string;
  subject?: string;
  body?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  attempts: DeliveryAttempt[];
}

// ==================== Providers ====================

export interface Provider {
  id: string;
  tenantId?: string;
  name: string;
  channel: NotificationChannel;
  type?: string;
  status: ProviderStatus;
  description?: string;
  successRate: number;
  averageLatencyMs?: number;
  latencyMs?: number;
  lastError?: string;
  lastFailureAt?: string;
  lastSuccessAt?: string;
  isEnabled: boolean;
  isPrimary?: boolean;
  isDefault?: boolean;
  priority: number;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderInput {
  tenantId?: string;
  name: string;
  channel: NotificationChannel;
  type?: string;
  description?: string;
  config?: Record<string, unknown>;
  priority?: number;
  isEnabled?: boolean;
  isDefault?: boolean;
}

export interface UpdateProviderInput {
  tenantId?: string;
  name?: string;
  channel?: NotificationChannel;
  type?: string;
  description?: string;
  config?: Record<string, unknown>;
  priority?: number;
  isEnabled?: boolean;
  isDefault?: boolean;
}

export interface ProviderHealthItem {
  providerId?: string;
  name: string;
  channel: NotificationChannel;
  type?: string;
  status: ProviderStatus;
  successRate?: number;
  latencyMs?: number;
  message?: string;
  error?: string;
  checkedAt?: string;
}

export interface ProviderHealthResponse {
  providers: ProviderHealthItem[];
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  disabledCount: number;
  checkedAt: string;
}

export interface ProviderTestInput {
  recipient?: string;
  subject?: string;
  body?: string;
  dryRun?: boolean;
}

export interface ProviderTestResult {
  providerId: string;
  channel?: string;
  dryRun: boolean;
  success: boolean;
  status: string;
  message?: string;
  providerMessageId?: string;
  providerResponseSanitized?: string;
  latencyMs?: number;
  checkedAt: string;
}

// ==================== Provider Attempts (request lifecycle logging) ====================

export type ProviderAttemptStatus =
  | 'queued'
  | 'preparing'
  | 'sending'
  | 'accepted'
  | 'pending'
  | 'delivered'
  | 'failed'
  | 'rejected'
  | 'timed_out'
  | 'cancelled'
  | 'bounced'
  | 'complained'
  | 'unknown';

export type ProviderErrorKind =
  | 'configuration'
  | 'invalid_recipient'
  | 'invalid_message'
  | 'provider'
  | 'rate_limited'
  | 'timeout'
  | 'network'
  | 'authentication'
  | 'cancelled'
  | 'unknown';

export interface ProviderAttemptSummary {
  id: string;
  notificationId: string;
  providerAccountId?: string;
  tenantId?: string;
  channel: NotificationChannel;
  provider: string;
  attemptNumber: number;
  fallbackSequence: number;
  status: ProviderAttemptStatus | string;
  providerStatus?: string;
  providerMessageId?: string;
  recipientMasked?: string;
  responseStatusCode?: number;
  durationMs?: number;
  retryable: boolean;
  normalizedErrorKind?: string;
  normalizedErrorCode?: string;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ProviderAttemptEvent {
  id: string;
  attemptId: string;
  eventType: string;
  previousStatus?: string;
  newStatus?: string;
  eventPayloadSanitized?: Record<string, unknown>;
  source?: string;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  occurredAt: string;
}

export interface ProviderAttemptDetails extends ProviderAttemptSummary {
  parentAttemptId?: string;
  requestMethod?: string;
  requestUrlSanitized?: string;
  requestHeadersSanitized?: Record<string, string>;
  requestBodySanitized?: string;
  requestSizeBytes?: number;
  responseHeadersSanitized?: Record<string, string>;
  responseBodySanitized?: string;
  responseSizeBytes?: number;
  bodyTruncated: boolean;
  originalSizeBytes?: number;
  capturedSizeBytes?: number;
  contentHash?: string;
  bodyPreview?: string;
  providerErrorCode?: string;
  normalizedErrorMessage?: string;
  queuedAt: string;
  startedAt?: string;
  timeoutMs?: number;
  spanId?: string;
  events?: ProviderAttemptEvent[];
}

export interface ListProviderAttemptsParams extends PaginationParams {
  notificationId?: string;
  channel?: NotificationChannel;
  provider?: string;
  status?: ProviderAttemptStatus | string;
  providerMessageId?: string;
  requestId?: string;
  correlationId?: string;
  from?: string;
  to?: string;
}

export interface ProviderAttemptListResponse {
  items: ProviderAttemptSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== Templates ====================

export interface Template {
  id: string;
  key?: string;
  name: string;
  type: NotificationChannel;
  locale: TemplateLocale;
  subject?: string;
  body?: string;
  description?: string;
  variables?: string[];
  provider?: string;
  providerTemplate?: string;
  providerTemplates?: unknown[];
  status?: TemplateStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  key?: string;
  name: string;
  type: NotificationChannel;
  locale: TemplateLocale;
  subject?: string;
  body?: string;
  description?: string;
  variables?: string[];
  provider?: string;
  providerTemplate?: string;
  providerTemplates?: unknown[];
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  isActive?: boolean;
  status?: TemplateStatus;
}

export interface RenderPreviewInput {
  templateId: string;
  variables: Record<string, string>;
}

export interface RenderPreviewResult {
  subject?: string;
  body: string;
  missingVariables?: string[];
}

// ==================== Reminders ====================

export interface Reminder {
  id: string;
  tenantId?: string;
  projectId?: string;
  userId: string;
  type: NotificationChannel;
  recipientEmail?: string;
  recipientPhone?: string;
  templateKey?: string;
  variables?: Record<string, string>;
  scheduledAt: string;
  status: 'scheduled' | 'processing' | 'sent' | 'cancelled' | 'failed';
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderInput {
  userId: string;
  type: NotificationChannel;
  recipientEmail?: string;
  recipientPhone?: string;
  templateKey?: string;
  variables?: Record<string, string>;
  scheduledAt: string;
  tenantId?: string;
  projectId?: string;
}

export interface UpdateReminderInput {
  type?: NotificationChannel;
  recipientEmail?: string;
  recipientPhone?: string;
  templateKey?: string;
  variables?: Record<string, string>;
  scheduledAt?: string;
}

// ==================== Preferences ====================

export interface PreferenceResponse {
  id: string;
  userId: string;
  type: string;
  isEnabled: boolean;
  allowInstant: boolean;
  allowDigest: boolean;
  digestFrequency: string;
  quietHours?: { start: string; end: string; timezone: string };
  categorySettings?: Record<string, boolean>;
  updatedAt?: string;
}

export interface UpdatePreferenceInput {
  isEnabled?: boolean;
  allowInstant?: boolean;
  allowDigest?: boolean;
  digestFrequency?: string;
  type?: string;
}

// ==================== Tenants ====================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  displayName?: string;
  description?: string;
  isActive: boolean;
  isDefault?: boolean;
  enabledChannels: string[];
  createdAt: string;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  displayName?: string;
  description?: string;
  enabledChannels?: string[];
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  displayName?: string;
  description?: string;
  enabledChannels?: string[];
}

// ==================== Dashboard / Observability ====================

export interface DashboardOverview {
  totalNotifications: number;
  notificationsToday: number;
  sentToday: number;
  failedToday: number;
  queuedCount: number;
  processingCount: number;
  retryingCount: number;
  deadLetterCount: number;
  cancelledCount: number;
  successRate: number;
  failureRate: number;
  averageDeliveryMs: number;
  activeReminders: number;
  scheduledReminders: number;
  failedReminders: number;
  providers: {
    healthyCount: number;
    degradedCount: number;
    downCount: number;
    disabledCount: number;
    unknownCount: number;
  };
  channelBreakdown: Array<{ channel: NotificationChannel; count: number; sent: number; failed: number; successRate: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  dailyTrend: Array<{ date: string; total: number; sent: number; failed: number; dead: number }>;
  recentNotifications: Notification[];
  recentFailures: unknown[];
  recentDeadLetters: unknown[];
  queue: {
    pendingCount: number;
    queuedCount: number;
    processingCount: number;
    retryingCount: number;
    deadCount: number;
  };
  generatedAt: string;
}

export interface ObservabilityHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  dependencies: Array<{ name: string; status: string; message?: string; latencyMs?: number }>;
  generatedAt: string;
}

export interface ReadinessResult {
  ready: boolean;
  overall: 'ready' | 'not_ready' | 'degraded';
  checks: Array<{ name: string; status: string; message?: string }>;
  generatedAt: string;
}

export interface ObservabilityMetrics {
  notifications: Record<string, unknown>;
  deliveries: Record<string, unknown>;
  providers: Record<string, unknown>;
  http?: Record<string, unknown>;
  queue: Record<string, unknown>;
  workers: Record<string, unknown>;
  generatedAt: string;
}

export interface QueueOverview {
  pendingCount: number;
  queuedCount: number;
  processingCount: number;
  retryingCount: number;
  deadCount: number;
  scheduledCount: number;
  oldestPendingAt?: string;
  nextRetryAt?: string;
  throughputPerMinute: number;
  averageLatencyMs: number;
  generatedAt: string;
}

export interface WorkerOverview {
  workers: Array<{
    workerName: string;
    enabled: boolean;
    status: string;
    lastRunAt?: string;
    lastError?: string;
    pollInterval: string;
    batchSize: number;
  }>;
  activeCount: number;
  idleCount: number;
  failedCount: number;
  lastHeartbeatAt?: string;
  generatedAt: string;
}
