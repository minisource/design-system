# @minisource/auth-ui

Auth presentation components for login, register, forgot password, and email verification flows.

## Installation

```bash
pnpm add @minisource/auth-ui
```

## Components

- `AuthLayout` - Centered auth page layout
- `AuthCard` - Card wrapper for auth forms
- `AuthFooter` - "Already have an account?" / "Don't have an account?" links
- `AuthError` - Inline error display
- `AuthErrorSummary` - Form-level error display
- `AuthSuccess` - Success state display
- `AuthField` - Form field with label and error
- `LoginForm` - Email/password + OTP login form
- `RegisterForm` - Multi-field registration form
- `ForgotPasswordForm` - Email/phone → OTP → reset password
- `VerifyEmailForm` - Email/phone verification form
- `OtpVerificationForm` - OTP code entry form

## Usage

```tsx
import { AuthCard, LoginForm, AuthFooter } from '@minisource/auth-ui';

function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to your account">
      <LoginForm
        email={{ value, onChange, error }}
        password={{ value, onChange, error }}
        onEmailSubmit={handleSubmit}
        googleLoginUrl="/auth/google"
      />
      <AuthFooter text="Don't have an account?" linkText="Sign up" linkHref="/register" />
    </AuthCard>
  );
}
```

## Architecture

This package is **presentation only** — no API calls, no hooks, no session management. All business logic stays in the consuming app.