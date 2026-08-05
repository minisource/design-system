import * as React from 'react';
import { Alert, AlertTitle, AlertDescription, cn } from '@minisource/ui';

export interface AuthErrorSummaryProps {
  /** Error message or error object */
  error?: string | null;
  /** Field-level errors to display */
  fieldErrors?: Record<string, string>;
  /** Custom title */
  title?: string;
  className?: string;
}

/**
 * AuthErrorSummary — displays a summary of authentication errors.
 *
 * Shows a top-level error alert plus optional field-level errors.
 * Does NOT perform error mapping — expects normalized input from auth/front.
 */
export function AuthErrorSummary({
  error,
  fieldErrors,
  title = 'Error',
  className,
}: AuthErrorSummaryProps) {
  const hasFieldErrors = fieldErrors && Object.keys(fieldErrors).length > 0;

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
        <ul className="space-y-1 text-sm text-destructive">
          {Object.entries(fieldErrors!).map(([field, msg]) => (
            <li key={field}>
              <span className="font-medium">{field}:</span> {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

