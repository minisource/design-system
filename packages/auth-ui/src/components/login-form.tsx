'use client';

import * as React from 'react';
import { Button, Input, Label, Separator, cn, Tabs, TabsList, TabsTrigger, TabsContent } from '@minisource/ui';

export interface LoginFormProps {
  /** Email field */
  email?: {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
  };
  /** Password field */
  password?: {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
  };
  /** Phone/OTP field */
  phone?: {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
  };
  /** OTP verification code */
  otpCode?: {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
  };
  /** Whether OTP has been sent */
  otpSent?: boolean;
  /** OTP target display (e.g. phone number) */
  otpTarget?: string;
  /** Whether OTP is being verified */
  isVerifyingOtp?: boolean;
  /** Whether login is in progress */
  isLoggingIn?: boolean;
  /** Whether OTP is being sent */
  isSendingOtp?: boolean;
  /** Submit handlers */
  onEmailSubmit?: () => void;
  onOtpSendSubmit?: () => void;
  onOtpVerifySubmit?: () => void;
  /** Remember me */
  rememberMe?: boolean;
  onRememberMeChange?: (value: boolean) => void;
  /** Google OAuth */
  onGoogleLogin?: () => void;
  googleLoginUrl?: string;
  /** Forgot password */
  onForgotPassword?: () => void;
  forgotPasswordHref?: string;
  /** Back to OTP send */
  onBackToOtpSend?: () => void;
  /** Dev mode info */
  devInfo?: { email: string; password: string } | null;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function LoginForm({
  email,
  password,
  phone,
  otpCode,
  otpSent,
  otpTarget,
  isVerifyingOtp,
  isLoggingIn,
  isSendingOtp,
  onEmailSubmit,
  onOtpSendSubmit,
  onOtpVerifySubmit,
  rememberMe,
  onRememberMeChange,
  onGoogleLogin,
  googleLoginUrl,
  onForgotPassword,
  forgotPasswordHref,
  onBackToOtpSend,
  devInfo,
  dir,
  className,
}: LoginFormProps) {
  const [activeTab, setActiveTab] = React.useState('email');

  return (
    <div dir={dir} className={cn('space-y-4', className)}>
      {devInfo && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-100">
          <p className="font-semibold flex items-center gap-1.5 text-sm mb-1">
            ⚠️ Seed Credentials Notice
          </p>
          <p className="mb-2 opacity-90">
            You can sign in using the default system administrator credentials:
          </p>
          <div className="space-y-1 bg-background/50 p-2.5 rounded-lg border border-amber-500/10 font-mono text-[11px]">
            <div>Email: <span className="font-bold select-all">{devInfo.email}</span></div>
            <div>Password: <span className="font-bold select-all">{devInfo.password}</span></div>
          </div>
          <p className="mt-2 text-[10px] opacity-80">
            * Please change this password immediately in your account settings after logging in.
          </p>
        </div>
      )}

      {/* Tab navigation — using @minisource/ui Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList variant="default" className="w-full">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone OTP</TabsTrigger>
        </TabsList>

        {/* Email tab */}
        <TabsContent value="email">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onEmailSubmit?.();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="ms-email">Email</Label>
              <Input
                id="ms-email"
                type="email"
                placeholder="name@example.com"
                value={email?.value}
                onChange={(e) => email?.onChange?.(e.target.value)}
                error={email?.error}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ms-password">Password</Label>
                {(onForgotPassword || forgotPasswordHref) && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="ms-password"
                type="password"
                placeholder="Enter your password"
                value={password?.value}
                onChange={(e) => password?.onChange?.(e.target.value)}
                error={password?.error}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="ms-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => onRememberMeChange?.(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="ms-remember-me" className="text-sm leading-none select-none cursor-pointer">
                Remember me
              </label>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoggingIn}>
              Sign In
            </Button>
          </form>
        </TabsContent>

        {/* Phone/OTP tab */}
        <TabsContent value="phone">
          {!otpSent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onOtpSendSubmit?.();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="ms-phone">Phone Number</Label>
                <Input
                  id="ms-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone?.value}
                  onChange={(e) => phone?.onChange?.(e.target.value)}
                  error={phone?.error}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your phone number with country code
                </p>
              </div>
              <Button type="submit" className="w-full" isLoading={isSendingOtp}>
                Send OTP
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onOtpVerifySubmit?.();
              }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to {otpTarget}
              </p>
              <div className="space-y-2">
                <Label htmlFor="ms-otp-code">OTP Code</Label>
                <Input
                  id="ms-otp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  value={otpCode?.value}
                  onChange={(e) => otpCode?.onChange?.(e.target.value)}
                  error={otpCode?.error}
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isVerifyingOtp}>
                Verify & Sign In
              </Button>
              <Button type="button" variant="link" className="w-full" onClick={onBackToOtpSend}>
                Change phone number
              </Button>
            </form>
          )}
        </TabsContent>
      </Tabs>

      {/* Google OAuth */}
      {(onGoogleLogin || googleLoginUrl) && (
        <>
          <div className="relative my-6">
            <Separator />
            <span className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR CONTINUE WITH
            </span>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <a
              href={googleLoginUrl}
              onClick={
                onGoogleLogin
                  ? (e) => {
                      e.preventDefault();
                      onGoogleLogin();
                    }
                  : undefined
              }
              className="inline-flex items-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </a>
          </Button>
        </>
      )}
    </div>
  );
}
