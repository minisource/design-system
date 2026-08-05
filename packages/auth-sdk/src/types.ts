/**
 * Auth service contracts (@minisource/auth-sdk).
 * Derived from the authoritative Auth backend OpenAPI (auth/backend/docs/swagger.json)
 * plus verified backend routes (auth/backend/api/router/router.go).
 * Browser-safe: no credentials, no secrets.
 */

// ==================== Auth flows ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
  revokeAll?: boolean;
}

export interface SendOTPRequest {
  phone?: string;
  email?: string;
  channel?: 'sms' | 'email';
  purpose?: string;
}

export interface VerifyOTPRequest {
  phone?: string;
  email?: string;
  code: string;
  purpose?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

/** The authenticated user embedded in AuthResponse. */
export interface UserInfo {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneVerified?: boolean;
  avatar?: string;
  roles: string[];
  username?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
  user: UserInfo;
}

/** GET /auth/userinfo — OIDC-style claim shape. */
export interface UserinfoResponse {
  sub: string;
  email: string;
  email_verified: boolean;
  phone?: string;
  phone_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  roles: string[];
  permissions: string[];
  tenant_id?: string;
  is_super_admin: boolean;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  active: boolean;
  sub?: string;
  userId?: string;
  email?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
  tenantId?: string;
  exp?: number;
  iat?: number;
  scopes?: string[];
}

// ==================== Users ====================

export interface Role {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isSystem?: boolean;
}

export interface TenantSummary {
  id: string;
  name: string;
  slug?: string;
  displayName?: string;
  isActive?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  roles?: Role[];
  tenantId?: string;
  tenant?: TenantSummary;
  lastLoginAt?: string;
  lastLoginIP?: string;
  lockedUntil?: string;
  metadata?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface ListUsersResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  users: AuthUser[];
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleIds?: string[];
  tenantId?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleIds?: string[];
  tenantId?: string;
  isActive?: boolean;
  metadata?: string;
}

export type UserStatus = 'active' | 'inactive' | 'locked' | 'suspended';

// ==================== Me ====================

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  username?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SetPasswordRequest {
  password: string;
  token?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  isActive?: boolean;
  isCurrent?: boolean;
  createdAt?: string;
  lastActiveAt?: string;
  expiresAt?: string;
}

export interface MyTenant {
  id: string;
  name: string;
  slug?: string;
  displayName?: string;
  isDefault?: boolean;
  role?: string;
}

export interface LinkedAccount {
  provider: string;
  providerAccountId?: string;
  email?: string;
  linkedAt?: string;
}

// ==================== Admin (roles/permissions/sessions/dashboard/tools) ====================

export interface Permission {
  id: string;
  code: string;
  name?: string;
  description?: string;
  group?: string;
}

export interface AdminSession extends UserSession {
  email?: string;
  username?: string;
}

export interface DashboardOverview {
  totalUsers?: number;
  activeUsers?: number;
  totalTenants?: number;
  activeTenants?: number;
  totalSessions?: number;
  activeSessions?: number;
  signupsToday?: number;
  loginsToday?: number;
  generatedAt?: string;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  description?: string;
  userId?: string;
  email?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolsHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version?: string;
  uptimeSeconds?: number;
  checks?: Array<{ name: string; status: string; message?: string; latencyMs?: number }>;
  generatedAt?: string;
}

export interface CheckPermissionRequest {
  permission: string;
  userId?: string;
}

export interface CheckPermissionResponse {
  allowed: boolean;
  permission?: string;
  reason?: string;
}

export interface JwksStatus {
  keys?: number;
  status?: string;
  nextRotationAt?: string;
  algorithm?: string;
}
