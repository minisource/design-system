'use client';

import * as React from 'react';
import { cn } from '@minisource/ui';
import { FormFieldProvider, useFormField } from './use-form-field';

export interface FormFieldProps {
  name: string;
  id?: string;
  label?: React.ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormField — wraps a form control with Label, Description, and Error.
 *
 * Integrates with react-hook-form via `name` prop.
 * When used inside a `<Form>`, it automatically picks up validation state.
 */
export function FormField({
  name,
  id: externalId,
  label,
  description,
  error,
  required,
  disabled,
  children,
  className,
}: FormFieldProps) {
  const id = externalId || `ms-field-${name}`;

  return (
    <FormFieldProvider value={{ name, id, error, description, disabled, required }}>
      <div className={cn('space-y-2', className)}>
        {label && (
          <FormLabel required={required}>{label}</FormLabel>
        )}
        {children}
        <FormDescription />
        <FormMessage />
      </div>
    </FormFieldProvider>
  );
}

/**
 * FormLabel — renders a label for the current field.
 */
export function FormLabel({
  children,
  required,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  const field = useFormField();
  const fieldId = field?.id;
  const fieldDisabled = field?.disabled;
  const fieldRequired = required ?? field?.required;

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        'text-sm font-medium leading-none',
        fieldDisabled && 'cursor-not-allowed opacity-70',
        className
      )}
      {...props}
    >
      {children}
      {fieldRequired && (
        <span className="ms-1 text-destructive" aria-hidden="true">*</span>
      )}
    </label>
  );
}

/**
 * FormDescription — optional description text below the field.
 */
export function FormDescription({ className }: { className?: string }) {
  const field = useFormField();
  if (!field?.description) return null;

  return (
    <p
      id={`${field.id}-desc`}
      className={cn('text-sm text-muted-foreground', className)}
    >
      {field.description}
    </p>
  );
}

/**
 * FormMessage — renders field error message.
 * Reads from FormFieldContext (static error) or accepts dynamic error via props.
 */
export function FormMessage({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const field = useFormField();
  const message = children || field?.error;
  const fieldId = field?.id;

  if (!message) return null;

  return (
    <p
      id={fieldId ? `${fieldId}-error` : undefined}
      role="alert"
      className={cn('text-sm font-medium text-destructive', className)}
    >
      {message}
    </p>
  );
}
