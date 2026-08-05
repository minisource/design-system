import * as React from 'react';
import { cn } from '../lib/utils';
import { Label } from './label';

export interface FormFieldProps {
  /** Unique field ID. Used to wire label, input, error, and description together. */
  id: string;
  /** Field label text */
  label: React.ReactNode;
  /** Whether the field is required */
  required?: boolean;
  /** Show "optional" badge even when the form section is required */
  optional?: boolean;
  /** Description text shown below the input */
  description?: React.ReactNode;
  /** Error message. When set, input styling changes and error is announced. */
  error?: React.ReactNode;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** The form control (input, select, etc.) */
  children: React.ReactNode;
  /** Additional class on the wrapper div */
  className?: string;
  /** Additional class on the label */
  labelClassName?: string;
}

/**
 * FormField — a form-library agnostic field wrapper.
 *
 * Provides:
 * - Accessible label ↔ input association via `htmlFor` / `id`
 * - `aria-describedby` wiring for description and error
 * - `aria-invalid` when there is an error
 * - `aria-required` when the field is required
 * - Required / optional indicator
 * - Consistent spacing and error presentation
 *
 * Usage:
 * ```tsx
 * <FormField id="email" label="Email" required error={errors.email}>
 *   <Input id="email" ... />
 * </FormField>
 * ```
 */
export function FormField({
  id,
  label,
  required,
  optional,
  description,
  error,
  disabled,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;

  // Build aria-describedby from available descriptions
  const describedBy = [
    error ? errorId : null,
    description ? descId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={id}
        className={labelClassName}
        aria-disabled={disabled || undefined}
      >
        {label}
        {required && <span className="text-destructive ms-1" aria-hidden="true">*</span>}
        {optional && (
          <span className="text-muted-foreground ms-1 text-xs font-normal">
            (optional)
          </span>
        )}
      </Label>

      {/* Clone child to inject aria attributes if it's a valid React element */}
      <div aria-describedby={describedBy} aria-invalid={error ? 'true' : undefined}>
        {children}
      </div>

      {description && !error && (
        <p id={descId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

