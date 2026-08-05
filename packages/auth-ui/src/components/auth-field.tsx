'use client';

import * as React from 'react';
import { Button, Input, Label, cn } from '@minisource/ui';

export interface AuthFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  className?: string;
  inputClassName?: string;
}

export function AuthField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  description,
  disabled,
  required,
  autoComplete,
  inputMode,
  maxLength,
  className,
  inputClassName,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ms-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        error={error}
        description={description}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : description ? descId : undefined}
        className={inputClassName}
      />
    </div>
  );
}
