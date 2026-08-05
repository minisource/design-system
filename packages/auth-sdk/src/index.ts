/**
 * @minisource/auth-sdk
 *
 * Auth service endpoint definitions, contracts and a stable facade.
 * Depends only on @minisource/api-core. No React. No UI.
 * Browser-safe; credentials are handled by consumer-supplied transport adapters.
 */

export { createAuthClient } from './client';
export type { AuthClient, AuthClientConfig } from './client';

export type {
  AuthResponse,
  AuthUser,
  ChangePasswordRequest,
  CheckPermissionRequest,
  CheckPermissionResponse,
  CreateUserRequest,
  DashboardOverview,
  ForgotPasswordRequest,
  IntrospectRequest,
  IntrospectResponse,
  JwksStatus,
  LinkedAccount,
  ListUsersParams,
  ListUsersResponse,
  LogoutRequest,
  LoginRequest,
  MyTenant,
  Permission,
  RecentActivityItem,
  RefreshTokenRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  Role,
  SendOTPRequest,
  SetPasswordRequest,
  TenantSummary,
  ToolsHealth,
  UpdateProfileRequest,
  UpdateUserRequest,
  UserInfo,
  UserSession,
  UserinfoResponse,
  UserStatus,
  VerifyOTPRequest,
  VerifyEmailRequest,
} from './types';
