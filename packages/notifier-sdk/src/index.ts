/**
 * @minisource/notifier-sdk
 *
 * Notifier service endpoint definitions, contracts and a stable facade.
 * Depends only on @minisource/api-core. No React. No UI.
 * Browser-safe; provider credentials and server-only internals are never exposed.
 */

export { createNotifierClient } from './client';
export type { NotifierClient, NotifierClientConfig } from './client';

export type {
  BatchNotificationInput,
  CreateNotificationInput,
  CreateProviderInput,
  CreateReminderInput,
  CreateTemplateInput,
  CreateTenantInput,
  DashboardOverview,
  DeliveryAttempt,
  ListNotificationsParams,
  ListProviderAttemptsParams,
  Notification,
  NotificationChannel,
  NotificationDelivery,
  NotificationPriority,
  NotificationStatus,
  ProviderAttemptDetails,
  ProviderAttemptEvent,
  ProviderAttemptListResponse,
  ProviderAttemptStatus,
  ProviderAttemptSummary,
  ProviderErrorKind,
  ObservabilityHealth,
  ObservabilityMetrics,
  PaginatedResponse,
  PaginationParams,
  PreferenceResponse,
  Provider,
  ProviderHealthItem,
  ProviderHealthResponse,
  ProviderStatus,
  ProviderTestInput,
  ProviderTestResult,
  QueueOverview,
  ReadinessResult,
  RecipientInput,
  Reminder,
  RenderPreviewInput,
  RenderPreviewResult,
  Template,
  TemplateLocale,
  TemplateStatus,
  Tenant,
  UpdatePreferenceInput,
  UpdateProviderInput,
  UpdateReminderInput,
  UpdateTemplateInput,
  UpdateTenantInput,
  WorkerOverview,
} from './types';
