'use client';

import * as React from 'react';
import { Alert, AlertTitle, AlertDescription, cn } from '@minisource/ui';

export interface ErrorSummaryProps {
  /** Top-level form error message */
  error?: string | null;
  /** Field-level errors: { fieldName: errorMessage } */
  errors?: Record<string, string | string[]>;
  /** Title for the error alert */
  title?: string;
  /** Callback when a field error is clicked (e.g. to scroll/focus the field) */
  onFieldClick?: (fieldName: string) => void;
  className?: string;
}

/**
 * ErrorSummary — displays form-level and field-level errors.
 *
 * - Shows a top-level error alert
 * - Lists field errors with clickable links
 * - Optionally calls onFieldClick to scroll/focus the field
 *
 * Accepts normalized error data from auth/front.
 * Does NOT perform error mapping.
 */
export function ErrorSummary({
  error,
  errors,
  title = 'Please fix the following errors',
  onFieldClick,
  className,
}: ErrorSummaryProps) {
  const hasFieldErrors = errors && Object.keys(errors).length > 0;

  if (!error && !hasFieldErrors) return null;

  return (
    <div className={cn('space-y-3', className)} role="alert" aria-live="polite">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasFieldErrors && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <ul className="space-y-1 text-sm">
            {Object.entries(errors!).map(([field, msgs]) => {
              const messages = Array.isArray(msgs) ? msgs : [msgs];
              return messages.map((msg, i) => (
                <li key={`${field}-${i}`} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  {onFieldClick ? (
                    <button
                      type="button"
                      onClick={() => onFieldClick(field)}
                      className="text-left font-medium text-destructive hover:underline"
                    >
                      {field}: {msg}
                    </button>
                  ) : (
                    <span>
                      <span className="font-medium">{field}</span>: {msg}
                    </span>
                  )}
                </li>
              ));
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
