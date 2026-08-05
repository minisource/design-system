'use client';

import * as React from 'react';
import { Button, Input, Label, cn } from '@minisource/ui';
import { AuthField } from './auth-field';

export interface VerifyEmailFormProps {
  /** Which target is selected */
  target: 'email' | 'phone';
  onTargetChange?: (target: 'email' | 'phone') => void;
  /** Target display value */
  targetValue?: string;
  /** Whether the target is already verified */
  isVerified?: boolean;
  /** Whether the phone option is available */
  hasPhone?: boolean;
  /** OTP code field */
  code?: { value?: string; onChange?: (v: string) => void; error?: string };
  /** Whether the code has been sent */
  codeSent?: boolean;
  /** Submit handlers */
  onSendCode?: () => void;
  onVerify?: () => void;
  /** Loading states */
  isSending?: boolean;
  isVerifying?: boolean;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function VerifyEmailForm({
  target,
  onTargetChange,
  targetValue,
  isVerified,
  hasPhone = true,
  code,
  codeSent,
  onSendCode,
  onVerify,
  isSending,
  isVerifying,
  dir,
  className,
}: VerifyEmailFormProps) {
  return (
    <div dir={dir} className={cn('space-y-6', className)}>
      {/* Target selector */}
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          variant={target === 'email' ? 'default' : 'outline'}
          onClick={() => onTargetChange?.('email')}
          className="gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Email
        </Button>
        <Button
          type="button"
          variant={target === 'phone' ? 'default' : 'outline'}
          onClick={() => onTargetChange?.('phone')}
          className="gap-2"
          disabled={!hasPhone}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          Phone
        </Button>
      </div>

      {/* Target info */}
      <div className="rounded-lg bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">Send verification code to:</p>
        <p className="mt-1 font-medium">{targetValue || 'Not set'}</p>
        {isVerified && (
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-green-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Already verified
          </p>
        )}
      </div>

      {/* Send code button */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={onSendCode}
        disabled={isSending}
      >
        {isSending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        )}
        {codeSent ? 'Resend Code' : 'Send Verification Code'}
      </Button>

      {/* Code input (shown after sending) */}
      {codeSent && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onVerify?.();
          }}
          className="space-y-4"
        >
          <AuthField
            id="ms-verify-code"
            label="Verification Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code?.value}
            onChange={code?.onChange}
            error={code?.error}
            inputClassName="text-center text-2xl tracking-widest"
            description={`Enter the 6-digit code sent to your ${target === 'email' ? 'email' : 'phone'}`}
          />
          <Button type="submit" className="w-full gap-2" disabled={isVerifying}>
            {isVerifying && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Verify
          </Button>
        </form>
      )}
    </div>
  );
}

