'use client';

import * as React from 'react';
import { Button, Input, Label, cn } from '@minisource/ui';
import { AuthField } from './auth-field';

export interface RegisterFormFields {
  firstName?: { value?: string; onChange?: (v: string) => void; error?: string };
  lastName?: { value?: string; onChange?: (v: string) => void; error?: string };
  username?: { value?: string; onChange?: (v: string) => void; error?: string };
  email: { value?: string; onChange?: (v: string) => void; error?: string };
  phone?: { value?: string; onChange?: (v: string) => void; error?: string };
  password: { value?: string; onChange?: (v: string) => void; error?: string };
  confirmPassword: { value?: string; onChange?: (v: string) => void; error?: string };
}

export interface RegisterFormProps {
  fields: RegisterFormFields;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  /** Footer link (e.g. "Already have an account? Sign in") */
  footer?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function RegisterForm({
  fields,
  onSubmit,
  isSubmitting,
  submitLabel = 'Create Account',
  footer,
  dir,
  className,
}: RegisterFormProps) {
  return (
    <form
      dir={dir}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn('space-y-4', className)}
    >
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <AuthField
          id="ms-reg-first"
          label="First Name"
          placeholder="John"
          value={fields.firstName?.value}
          onChange={fields.firstName?.onChange}
          error={fields.firstName?.error}
          required
        />
        <AuthField
          id="ms-reg-last"
          label="Last Name"
          placeholder="Doe"
          value={fields.lastName?.value}
          onChange={fields.lastName?.onChange}
          error={fields.lastName?.error}
          required
        />
      </div>

      {fields.username !== undefined && (
        <AuthField
          id="ms-reg-user"
          label="Username"
          placeholder="johndoe"
          value={fields.username.value}
          onChange={fields.username.onChange}
          error={fields.username.error}
        />
      )}

      <AuthField
        id="ms-reg-email"
        label="Email"
        type="email"
        placeholder="name@example.com"
        value={fields.email.value}
        onChange={fields.email.onChange}
        error={fields.email.error}
        required
        autoComplete="email"
      />

      {fields.phone !== undefined && (
        <AuthField
          id="ms-reg-phone"
          label="Phone"
          type="tel"
          placeholder="+1234567890"
          value={fields.phone.value}
          onChange={fields.phone.onChange}
          error={fields.phone.error}
          autoComplete="tel"
        />
      )}

      <AuthField
        id="ms-reg-pass"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        value={fields.password.value}
        onChange={fields.password.onChange}
        error={fields.password.error}
        required
        autoComplete="new-password"
      />

      <AuthField
        id="ms-reg-confirm"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        value={fields.confirmPassword.value}
        onChange={fields.confirmPassword.onChange}
        error={fields.confirmPassword.error}
        required
        autoComplete="new-password"
      />

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && (
            <span className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {submitLabel}
        </Button>
      </div>

      {footer && (
        <p className="text-center text-sm text-muted-foreground">{footer}</p>
      )}
    </form>
  );
}

