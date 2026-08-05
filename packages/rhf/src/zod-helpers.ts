/**
 * Zod helper utilities for error presentation.
 * These are pure functions — no React, no hooks, no side effects.
 */

import { ZodError, ZodIssue } from 'zod';

/**
 * Flatten a ZodError into a field → message map.
 * Returns { fieldName: "error message" }.
 *
 * Handles:
 * - Simple paths: { fieldName: "error" }
 * - Nested paths: { "user.email": "error" }
 * - Array paths: { "items.0.name": "error" }
 */
export function flattenZodError(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const key = path || '_form';
    result[key] = issue.message;
  }
  return result;
}

/**
 * Normalize any error shape into a standard form error format.
 *
 * Accepts:
 * - ZodError (from schema validation)
 * - Record<string, string> (already normalized)
 * - string (form-level error)
 * - null/undefined (no error)
 *
 * Returns: { formError: string | null, fieldErrors: Record<string, string> }
 */
export type FormErrorState = {
  formError: string | null;
  fieldErrors: Record<string, string>;
};

export function normalizeFormError(
  error: ZodError | Record<string, string> | string | null | undefined,
): FormErrorState {
  if (!error) return { formError: null, fieldErrors: {} };

  if (error instanceof ZodError) {
    return {
      formError: null,
      fieldErrors: flattenZodError(error),
    };
  }

  if (typeof error === 'string') {
    return { formError: error, fieldErrors: {} };
  }

  if (typeof error === 'object') {
    return { formError: null, fieldErrors: error };
  }

  return { formError: null, fieldErrors: {} };
}

/**
 * Merge server-side errors with client-side validation errors.
 * Server errors take precedence for the same field.
 */
export function mergeErrors(
  clientErrors: Record<string, string>,
  serverErrors: Record<string, string | string[]>,
): Record<string, string> {
  const merged = { ...clientErrors };
  for (const [field, msgs] of Object.entries(serverErrors)) {
    merged[field] = Array.isArray(msgs) ? msgs[0] : msgs;
  }
  return merged;
}

/**
 * Parse a backend API error response into a normalized form error state.
 *
 * Expected backend format:
 * - { message: string, errors?: { field: string[] } }
 * - { error: string, details?: { field: string[] } }
 *
 * Returns: { formError, fieldErrors }
 */
export function parseBackendError(response: unknown): FormErrorState {
  if (!response || typeof response !== 'object') {
    return { formError: 'An unexpected error occurred', fieldErrors: {} };
  }

  const data = response as Record<string, unknown>;
  const formError =
    (data.message as string) ||
    (data.error as string) ||
    'An unexpected error occurred';

  const fieldErrors: Record<string, string> = {};
  const errors = (data.errors || data.details) as Record<string, string[]> | undefined;

  if (errors && typeof errors === 'object') {
    for (const [field, msgs] of Object.entries(errors)) {
      if (Array.isArray(msgs) && msgs.length > 0) {
        fieldErrors[field] = msgs[0];
      } else if (typeof msgs === 'string') {
        fieldErrors[field] = msgs;
      }
    }
  }

  return { formError, fieldErrors };
}
