'use client';

import * as React from 'react';
import { Input, cn } from '@minisource/ui';
import { useFormField } from './use-form-field';

/**
 * FormInput — Input that reads from FormField context for aria-describedby.
 */
export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Override the form field name (defaults to parent FormField's name) */
  name?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, ...props }, ref) => {
    const field = useFormField();
    const fieldId = field?.id;
    const fieldError = field?.error;

    return (
      <Input
        ref={ref}
        id={fieldId}
        type={type}
        aria-describedby={
          fieldError
            ? `${fieldId}-error`
            : field?.description
              ? `${fieldId}-desc`
              : undefined
        }
        aria-invalid={fieldError ? true : undefined}
        className={cn(fieldError && 'border-destructive focus-visible:ring-destructive', className)}
        {...props}
      />
    );
  }
);
FormInput.displayName = 'FormInput';
