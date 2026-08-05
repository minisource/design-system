import type { ApiClient, QueryParams, RequestOptions } from '@minisource/api-core';
import type {
  AuthResponse,
  AuthUser,
  AdminSession,
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
  MyTenant,
  Permission,
  RecentActivityItem,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SendOTPRequest,
  SetPasswordRequest,
  ToolsHealth,
  UpdateProfileRequest,
  UpdateUserRequest,
  UserSession,
  UserinfoResponse,
  UserStatus,
  VerifyOTPRequest,
  VerifyEmailRequest,
} from './types';

export interface AuthClientConfig {
  /** api-core transport instance (created by the consumer with its own adapters). */
  transport: ApiClient;
}

export interface AuthClient {
  auth: {
    login: (input: { email: string; password: string }, options?: RequestOptions) => Promise<AuthResponse>;
    register: (input: RegisterRequest, options?: RequestOptions) => Promise<AuthResponse>;
    refresh: (input: RefreshTokenRequest, options?: RequestOptions) => Promise<AuthResponse>;
    logout: (input?: LogoutRequest, options?: RequestOptions) => Promise<void>;
    sendOtp: (input: SendOTPRequest, options?: RequestOptions) => Promise<{ message?: string }>;
    verifyOtp: (input: VerifyOTPRequest, options?: RequestOptions) => Promise<AuthResponse>;
    forgotPassword: (input: ForgotPasswordRequest, options?: RequestOptions) => Promise<{ message?: string }>;
    resetPassword: (input: ResetPasswordRequest, options?: RequestOptions) => Promise<{ message?: string }>;
    resendVerification: (input: { email: string }, options?: RequestOptions) => Promise<{ message?: string }>;
    verifyEmail: (input: VerifyEmailRequest, options?: RequestOptions) => Promise<{ message?: string }>;
    userinfo: (options?: RequestOptions) => Promise<UserinfoResponse>;
    introspect: (input: IntrospectRequest, options?: RequestOptions) => Promise<IntrospectResponse>;
  };
  users: {
    search: (params?: ListUsersParams, options?: RequestOptions) => Promise<ListUsersResponse>;
    getById: (id: string, options?: RequestOptions) => Promise<AuthUser>;
    create: (input: CreateUserRequest, options?: RequestOptions) => Promise<AuthUser>;
    update: (id: string, input: UpdateUserRequest, options?: RequestOptions) => Promise<AuthUser>;
    remove: (id: string, options?: RequestOptions) => Promise<void>;
    setStatus: (id: string, status: UserStatus, options?: RequestOptions) => Promise<AuthUser>;
    unlock: (id: string, options?: RequestOptions) => Promise<AuthUser>;
  };
  me: {
    get: (options?: RequestOptions) => Promise<AuthUser>;
    update: (input: UpdateProfileRequest, options?: RequestOptions) => Promise<AuthUser>;
    changePassword: (input: ChangePasswordRequest, options?: RequestOptions) => Promise<{ message?: string }>;
    setPassword: (input: SetPasswordRequest, options?: RequestOptions) => Promise<{ message?: string }>;
    sessions: (options?: RequestOptions) => Promise<UserSession[]>;
    tenants: (options?: RequestOptions) => Promise<MyTenant[]>;
    linkedAccounts: (options?: RequestOptions) => Promise<LinkedAccount[]>;
    unlinkGoogle: (options?: RequestOptions) => Promise<void>;
  };
  admin: {
    sessions: (options?: RequestOptions) => Promise<AdminSession[]>;
    revokeSession: (id: string, options?: RequestOptions) => Promise<void>;
    revokeUserSessions: (userId: string, options?: RequestOptions) => Promise<void>;
    dashboardOverview: (options?: RequestOptions) => Promise<DashboardOverview>;
    recentActivity: (options?: RequestOptions) => Promise<RecentActivityItem[]>;
    toolsHealth: (options?: RequestOptions) => Promise<ToolsHealth>;
    jwksStatus: (options?: RequestOptions) => Promise<JwksStatus>;
    checkPermission: (input: CheckPermissionRequest, options?: RequestOptions) => Promise<CheckPermissionResponse>;
    introspectToken: (input: IntrospectRequest, options?: RequestOptions) => Promise<IntrospectResponse>;
    listPermissions: (options?: RequestOptions) => Promise<Permission[]>;
  };
}

/**
 * Create a stable Auth client facade over an api-core transport.
 *
 * The consumer owns the transport (base URL, token/context adapters), so this
 * SDK stays store-agnostic and never touches credentials directly.
 */
export function createAuthClient(config: AuthClientConfig): AuthClient {
  const { transport } = config;

  return {
    auth: {
      login: (input, options) => transport.post('/auth/login', input, options),
      register: (input, options) => transport.post('/auth/register', input, options),
      refresh: (input, options) => transport.post('/auth/refresh', input, options),
      logout: (input, options) => transport.post('/auth/logout', input ?? {}, options),
      sendOtp: (input, options) => transport.post('/auth/otp/send', input, options),
      verifyOtp: (input, options) => transport.post('/auth/otp/verify', input, options),
      forgotPassword: (input, options) => transport.post('/auth/forgot-password', input, options),
      resetPassword: (input, options) => transport.post('/auth/reset-password', input, options),
      resendVerification: (input, options) => transport.post('/auth/resend-verification', input, options),
      verifyEmail: (input, options) => transport.post('/auth/verify-email', input, options),
      userinfo: (options) => transport.get('/auth/userinfo', options),
      introspect: (input, options) => transport.post('/auth/introspect', input, options),
    },
    users: {
      search: (params, options) => transport.get('/admin/users', { ...(options ?? {}), params: params as QueryParams }),
      getById: (id, options) => transport.get(`/admin/users/${id}`, options),
      create: (input, options) => transport.post('/admin/users', input, options),
      update: (id, input, options) => transport.put(`/admin/users/${id}`, input, options),
      remove: (id, options) => transport.delete(`/admin/users/${id}`, options),
      setStatus: (id, status, options) => transport.patch(`/admin/users/${id}/status/${status}`, undefined, options),
      unlock: (id, options) => transport.post(`/admin/users/${id}/unlock`, {}, options),
    },
    me: {
      get: (options) => transport.get('/users/me', options),
      update: (input, options) => transport.put('/users/me', input, options),
      changePassword: (input, options) => transport.put('/users/me/password', input, options),
      setPassword: (input, options) => transport.post('/users/me/password/set', input, options),
      sessions: (options) => transport.get('/users/me/sessions', options),
      tenants: (options) => transport.get('/users/me/tenants', options),
      linkedAccounts: (options) => transport.get('/users/me/linked-accounts', options),
      unlinkGoogle: (options) => transport.delete('/users/me/linked-accounts/google', options),
    },
    admin: {
      sessions: (options) => transport.get('/admin/sessions', options),
      revokeSession: (id, options) => transport.delete(`/admin/sessions/${id}`, options),
      revokeUserSessions: (userId, options) => transport.delete(`/admin/users/${userId}/sessions`, options),
      dashboardOverview: (options) => transport.get('/admin/dashboard/overview', options),
      recentActivity: (options) => transport.get('/admin/dashboard/recent-activity', options),
      toolsHealth: (options) => transport.get('/admin/tools/health', options),
      jwksStatus: (options) => transport.get('/admin/tools/jwks-status', options),
      checkPermission: (input, options) => transport.post('/admin/tools/check-permission', input, options),
      introspectToken: (input, options) => transport.post('/admin/tools/introspect-token', input, options),
      listPermissions: (options) => transport.get('/admin/permissions', options),
    },
  };
}
