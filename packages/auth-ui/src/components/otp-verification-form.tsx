'use client';

import * as React from 'react';
import { Button, Input, Label, cn } from '@minisource/ui';

export interface OtpVerificationFormProps {
  /** Target display (e.g. phone number or email) */
  target: string;
  /** OTP code value */
  code?: {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
  };
  /** Whether verification is in progress */
  isVerifying?: boolean;
  /** Submit handler */
  onSubmit?: () => void;
  /** Change target */
  onChangeTarget?: () => void;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function OtpVerificationForm({
  target,
  code,
  isVerifying,
  onSubmit,
  onChangeTarget,
  dir,
  className,
}: OtpVerificationFormProps) {
  return (
    <form
      dir={dir}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn('space-y-4', className)}
    >
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code sent to {target}
      </p>
      <div className="space-y-2">
        <Label htmlFor="ms-otp-verify-code">OTP Code</Label>
        <Input
          id="ms-otp-verify-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-widest"
          value={code?.value}
          onChange={(e) => code?.onChange?.(e.target.value)}
          error={code?.error}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isVerifying}>
        {isVerifying && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Verify & Sign In
      </Button>
      {onChangeTarget && (
        <Button type="button" variant="link" className="w-full" onClick={onChangeTarget}>
          Change phone number
        </Button>
      )}
    </form>
  );
}
