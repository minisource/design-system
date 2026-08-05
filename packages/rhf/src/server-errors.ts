/**
 * Backend error normalizer.
 *
 * Pure functions for normalizing server error responses
 * into display-friendly structures.
 */

/**
 * Standard error format from backend API.
 */
export interface BackendErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  details?: Record<string, string[]>;
}

/**
 * Normalized error state for form presentation.
 */
export interface NormalizedError {
  /** Top-level error message */
  formError: string | null;
  /** Field-level errors: { fieldName: "message" } */
  fieldErrors: Record<string, string>;
  /** HTTP status code (if available) */
  statusCode?: number;
  /** Whether the error might be retryable (4xx client errors are not, 5xx are) */
  retryable?: boolean;
}

/**
 * Normalize a backend error response into a display-friendly format.
 *
 * Handles:
 * - Axios error responses
 * - Fetch error responses
 * - Generic Error objects
 * - Already-normalized data
 */
export function normalizeBackendError(
  error: unknown,
): NormalizedError {
  if (!error) {
    return {
      formError: 'An unexpected error occurred',
      fieldErrors: {},
      retryable: false,
    };
  }

  // Axios-style error
  const axiosData = (error as any)?.response?.data;
  if (axiosData) {
    return parseErrorResponse(axiosData, (error as any)?.response?.status);
  }

  // Fetch-style error with JSON body
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, any>;

    // Already has error data
    if (errObj.message || errObj.error || errObj.errors || errObj.details) {
      return parseErrorResponse(errObj, errObj.statusCode || errObj.status);
    }
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      formError: error.message || 'An unexpected error occurred',
      fieldErrors: {},
      retryable: false,
    };
  }

  // String
  if (typeof error === 'string') {
    return {
      formError: error,
      fieldErrors: {},
      retryable: false,
    };
  }

  return {
    formError: 'An unexpected error occurred',
    fieldErrors: {},
    retryable: false,
  };
}

function parseErrorResponse(
  data: Record<string, any>,
  statusCode?: number,
): NormalizedError {
  const formError =
    data.message ||
    data.error ||
    (statusCode && statusCode >= 500
      ? 'A server error occurred. Please try again.'
      : 'An error occurred');

  const fieldErrors: Record<string, string> = {};
  const errors = data.errors || data.details;

  if (errors && typeof errors === 'object') {
    for (const [field, msgs] of Object.entries(errors)) {
      if (Array.isArray(msgs) && msgs.length > 0) {
        fieldErrors[field] = msgs[0];
      } else if (typeof msgs === 'string') {
        fieldErrors[field] = msgs;
      }
    }
  }

  return {
    formError,
    fieldErrors,
    statusCode,
    retryable: statusCode ? statusCode >= 500 : false,
  };
}

/**
 * Merge client validation errors with server errors.
 * Server errors override client errors for the same field.
 */
export function mergeClientServerErrors(
  clientErrors: Record<string, string>,
  serverErrors: Record<string, string>,
): Record<string, string> {
  return { ...clientErrors, ...serverErrors };
}
