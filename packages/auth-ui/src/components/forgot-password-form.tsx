'use client';

import * as React from 'react';
import { Button, Input, Label, Separator, cn } from '@minisource/ui';
import { AuthField } from './auth-field';

export interface ForgotPasswordFormProps {
  /** Current step */
  step: 'email' | 'otp' | 'success';
  /** Email/phone field values */
  email?: { value?: string; onChange?: (v: string) => void; error?: string };
  phone?: { value?: string; onChange?: (v: string) => void; error?: string };
  /** OTP + password fields (shown in otp step) */
  otpCode?: { value?: string; onChange?: (v: string) => void; error?: string };
  newPassword?: { value?: string; onChange?: (v: string) => void; error?: string };
  confirmPassword?: { value?: string; onChange?: (v: string) => void; error?: string };
  /** Target display (e.g. "user@example.com") */
  resetTarget?: string;
  /** Submit handlers */
  onEmailSubmit?: () => void;
  onResetSubmit?: () => void;
  /** Navigation */
  onBackToEmail?: () => void;
  onBackToLogin?: () => void;
  /** Loading states */
  isSending?: boolean;
  isResetting?: boolean;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function ForgotPasswordForm({
  step,
  email,
  phone,
  otpCode,
  newPassword,
  confirmPassword,
  resetTarget,
  onEmailSubmit,
  onResetSubmit,
  onBackToEmail,
  onBackToLogin,
  isSending,
  isResetting,
  dir,
  className,
}: ForgotPasswordFormProps) {
  if (step === 'success') {
    return (
      <div dir={dir} className={cn('space-y-4 text-center', className)}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold">Password Reset</h3>
        <p className="text-sm text-muted-foreground">
          Your password has been successfully reset. You can now login with your new password.
        </p>
        {onBackToLogin && (
          <Button onClick={onBackToLogin} className="w-full">
            Back to Login
          </Button>
        )}
      </div>
    );
  }

  return (
    <div dir={dir} className={cn('space-y-4', className)}>
      {step === 'email' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onEmailSubmit?.();
          }}
          className="space-y-4"
        >
          <AuthField
            id="ms-forgot-email"
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email?.value}
            onChange={email?.onChange}
            error={email?.error}
            autoComplete="email"
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <AuthField
            id="ms-forgot-phone"
            label="Phone Number"
            type="tel"
            placeholder="+1234567890"
            value={phone?.value}
            onChange={phone?.onChange}
            error={phone?.error}
            autoComplete="tel"
          />

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending && (
              <span className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Send Reset Code
          </Button>

          {onBackToLogin && (
            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={onBackToLogin}
                className="font-medium text-primary hover:underline"
              >
                ← Back to login
              </button>
            </p>
          )}
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onResetSubmit?.();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to {resetTarget}
          </p>

          <AuthField
            id="ms-reset-code"
            label="OTP Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otpCode?.value}
            onChange={otpCode?.onChange}
            error={otpCode?.error}
            inputClassName="text-center text-2xl tracking-widest"
          />

          <AuthField
            id="ms-reset-pass"
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword?.value}
            onChange={newPassword?.onChange}
            error={newPassword?.error}
            autoComplete="new-password"
          />

          <AuthField
            id="ms-reset-confirm"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword?.value}
            onChange={confirmPassword?.onChange}
            error={confirmPassword?.error}
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" disabled={isResetting}>
            {isResetting && (
              <span className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Reset Password
          </Button>

          {onBackToEmail && (
            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={onBackToEmail}
                className="font-medium text-primary hover:underline"
              >
                ← Try a different email/phone
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  );
}

