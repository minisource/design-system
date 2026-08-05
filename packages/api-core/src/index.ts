/**
 * @minisource/api-core
 *
 * Framework-independent HTTP transport for MiniSource frontend SDKs.
 * No React. No UI. No service-specific endpoint knowledge.
 */

export { createApiClient, generateRequestId } from './client';
export type { ApiClient } from './client';

export type {
  ApiClientConfig,
  ApiClientAdapters,
  ContextHeaders,
  DiagnosticsInfo,
  HeaderMap,
  HttpMethod,
  QueryParams,
  QueryValue,
  RequestOptions,
  RetryPolicy,
  BodySerializer,
} from './types';

export type {
  ApiError,
  ApiErrorKind,
  BackendErrorEnvelope,
} from './errors';
export {
  createApiError,
  isApiError,
  normalizeHttpError,
  normalizeTransportError,
  statusToErrorKind,
} from './errors';

export { serializeQuery, sanitizeUrl } from './query';
export { redactHeaders, isSensitiveHeader } from './redact';
