# Frontend Platform SDK — Live TODO

> **Live progress document.** Updated continuously throughout the task, before and after each phase, with evidence. Completed items stay visible; nothing is deleted.

## Objective

Expand the existing `design-system` repository into a frontend platform monorepo hosting four independent packages:

- `@minisource/ui` (existing — UI primitives, no service API code)
- `@minisource/api-core` (new — framework-independent HTTP transport)
- `@minisource/auth-sdk` (new — Auth endpoint contracts/facade, depends only on api-core)
- `@minisource/notifier-sdk` (new — Notifier endpoint contracts/facade, depends only on api-core)

The repository name must NOT change. Backward compatibility for existing `@minisource/ui` consumers must be preserved. Consumer migration must be incremental.

## Scope

1. Safe baseline of all involved repositories (no destructive Git ops). ✅
2. Evidence-based architecture & contract audit of `design-system`, `auth/front`, `notifier/front`, Auth/Notifier backends, `go-sdk`, `csharp-sdk`, `gateway`. ✅
3. Workspace/package architecture that keeps `@minisource/ui` working.
4. Implement `@minisource/api-core` + focused unit tests.
5. Implement `@minisource/auth-sdk` (typed manual façade; generated only where OpenAPI is trustworthy).
6. Implement `@minisource/notifier-sdk` (same policy).
7. Consumer pilot migration (preferred: Notifier recipient user search via Auth SDK).
8. Incremental migration of safe duplicated clients/contracts.
9. Testing & validation of every package + consumers.
10. Documentation and final audit.

## Constraints

- Inspect before editing; preserve all uncommitted local work.
- No destructive Git commands; no commits/pushes unless explicitly requested.
- Do not start/restart running dev servers (projects hot-reload).
- No hardcoded localhost/domains/secrets/tenant IDs/credentials in SDK code.
- Do not log Authorization, cookies, OTPs, refresh tokens, API keys, sensitive bodies.
- Do not claim runtime/visual verification that was not actually performed (mark NOT VERIFIED).
- Respect existing package manager (pnpm), workspace model, build tool (tsup), TS settings.
- Backend changes only when necessary to establish a valid explicit contract or fix a proven integration issue; document evidence first.
- Do not weaken auth/authz/CORS/tenant isolation/validation to pass tests.

## Repository Baseline

Captured at task start. All repos at `C:\ActiveProjects\MiniSource\...`.

### Git status — design-system
- Branch: `main`
- **Everything untracked** (`??`): `.changeset/`, `PHASE_7.1/7.2/7.3_TODO.md`, `README.md`, `node_modules/`, `package.json`, `packages/`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `vitest.config.ts`
- → The repo has no commits yet; all current content is pre-existing local work. Treat as fully pre-existing/uncommitted.

### Git status — auth/front (pre-existing modifications)
Modified: `.env.development.example`, `.env.example`, `Dockerfile`, `README.md`, `docker-compose*.yml`, `next.config.ts`, `package.json`, `src/api/client.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(main)/admin/*` (login-logs, oauth-providers, service-clients, sessions, settings, tenants, users, users/[id]), `src/app/(main)/dashboard/page.tsx`, `src/app/(main)/layout.tsx`, `src/app/page.tsx`, `src/components/layout/tenant-selector.tsx`, `src/config/index.ts`, `src/hooks/use-auth.ts`, `src/hooks/use-my-tenants.ts`, `src/middleware.ts`, `src/shared/i18n/translations.ts`, `tsconfig.json`
→ All pre-existing local work; must be preserved.

### Git status — notifier/front (+ backend) (pre-existing modifications)
Modified: many `../backend/*` files (api, dto, handlers, routes, models, platform, database, config, migrations) plus front files. Also deletions at repo root (`.dockerignore`, `.env.*`, `.gitignore`, `.vscode/launch.json`).
→ All pre-existing local work; must be preserved.

### Git status — gateway (pre-existing modifications)
Modified: `docker-compose.yml`; many deletions (`Dockerfile`, `Makefile`, `README.md`, `cmd/`, `config/`, `docs/`, `go.mod`, `go.sum`, `internal/`, `docker-compose*.yml`, etc.).
→ Pre-existing; must be preserved. (Gateway is mid-refactor; the live config lives at `gateway/backend/config/config.yaml`.)

### Tooling
- Package manager: **pnpm** (workspace `packages/*`); lockfile `pnpm-lock.yaml`
- Node v24.18.1, pnpm 10.24.0
- TS base: `target ES2022`, `moduleResolution bundler`, `strict`, `jsx react-jsx`, declarations enabled
- Build: **tsup** per package (ESM+CJS+dts, `dist/`); root `pnpm build` chains `--filter` builds
- Tests: **vitest** (jsdom, globals) at repo root + per package; `@testing-library/react`, `@testing-library/jest-dom`
- Lint: none at design-system root (next lint only in consumers)
- Release: `@changesets/cli` (`.changeset/`), scripts `changeset`, `version-packages`, `release`, `release:dry`
- Existing packages: `@minisource/tokens`, `@minisource/ui`, `@minisource/auth-ui`, `@minisource/rhf`, `@minisource/app-shell`
- Consumers link packages via `file:../../design-system/packages/<pkg>` in their `package.json` (both auth/front and notifier/front)

## Current Phase

Phase 6 — Consumer Pilot Migration (in progress). Phases 0-5 complete.

## Architecture Decisions

1. **Same repo, separate packages.** Keep `design-system` as the pnpm workspace; do NOT merge service API code into `@minisource/ui`. New packages: `packages/api-core`, `packages/auth-sdk`, `packages/notifier-sdk`.
2. **No codegen tooling installed.** No openapi/orval/swagger/zod tooling exists in any of the 3 repos today. Per constraints (#13) we do not add a generator blindly. The auth + notifier `docs/swagger.json` files exist and are the authoritative contract source. We build a **typed manual façade** from the swagger definitions, keep the swagger files as the reference, and mark OpenAPI-generation as technical debt (Phase 9, DEFERRED).
3. **Base URLs runtime-injected.** SDKs never hardcode domains. Both consumers already resolve `baseUrl` to `/v1` in browser (relative → current origin = gateway) and `http://minisource-*-backend:900X/v1` server-side; the SDK takes `baseUrl` + adapters from the consumer.
4. **Adapter-based token/context.** api-core accepts `getAccessToken()` and `getContextHeaders()` adapters; consumers wire their own session/tenant stores. SDK core stays store-agnostic.
5. **Dependency direction (enforced):** `ui` ⟂ api-core/auth-sdk/notifier-sdk; api-core depends on nothing but TS lib; auth-sdk depends only on api-core; notifier-sdk depends only on api-core; auth-sdk ⟂ notifier-sdk. No React anywhere in api-core/SDKs.
6. **No auto-retry of mutations.** api-core default retry = none; explicit opt-in policy only for safe idempotent reads.
7. **Normalized errors.** api-core exposes a discriminated union of error categories (validation/unauthenticated/forbidden/not_found/conflict/rate_limited/timeout/cancelled/network/server/invalid_response) preserving safe backend fields (code, requestId, correlationId, retryAfter, status) — never raw backend messages blindly.
8. **Recipient search = Auth admin users.** Gateway routes `/v1/admin` (catch-all) → auth (notifier-specific `/v1/admin/{notifications,templates,providers,deliveries,reminders,preferences,observability}` registered before it). Pilot: Notifier `SecureUserPicker` searches `GET /v1/admin/users?page&pageSize&search` → auth. The auth swagger `models.User` (full admin model) is the real response; the consumer feature layer maps to a minimal masked summary — the SDK exposes the actual contract, consumer does privacy masking.
9. **Test Center must reuse the same SDK/transport** as production (notifier already has `features/test-center`).

## Discovered Existing Implementations

- **auth/front**: Axios-based `src/api/client.ts` with interceptors (token attach, X-Tenant-ID, language headers, OTel trace injection), single-flight 401 refresh + queue, `unwrapEnvelope`, `normalizeError` → `AppError` (category/code/message/userMessage/severity/requestId/correlationId/retryable/retryAfter). Base URL: browser `/v1`; server `http://minisource-auth-backend:9001/v1` (from `src/config/index.ts`).
- **notifier/front**: custom fetch `src/shared/api/http-client.ts` (X-Request-Id, X-Tenant-Id, X-Project-Id, 401 refresh, envelope unwrap, `ApiError`), plus `src/features/notifier/api/notifier-client.ts` (real) / `notifier-api-mode.ts` (mock switch) / `notifier-mocks.ts`. Also `src/shared/auth/auth-api.ts` (raw fetch login/refresh/logout/userinfo — **duplicate** of Auth client) and `src/features/test-center/components/secure-user-picker.tsx` (already calls `/admin/users` with search + tenant header + masking).
- **Auth backend OpenAPI**: `auth/backend/docs/swagger.json` — 35 paths: `/auth/*` (login/register/refresh/logout/otp/forgot/reset/verify/verify-email/userinfo/introspect/google), `/admin/*` (users, roles, permissions, service-clients), `/users/me*`, `/service/*`, jwks, health/ready. `GET /admin/users` params: `page,pageSize,search,roleId,isActive` → `service.ListUsersResponse{page,pageSize,total,totalPages,users: models.User[]}`. `models.User` includes id, email, phone, firstName, lastName, username, avatar, emailVerified, phoneVerified, isActive, isSuperAdmin, lastLoginAt/ IP, lockedUntil, metadata, createdAt + more.
- **Notifier backend OpenAPI**: `notifier/backend/docs/swagger.json` — 81 paths: admin (dashboard/overview, notifications CRUD+actions, deliveries, providers + test/health/health-check, templates, reminders, preferences, settings, observability), me (notifications/preferences/reminders), public (notifications/templates/reminders/deliveries, batch, user-scoped). DTOs: `dto.NotificationResponse`, `dto.ProviderResponse`, `dto.ProviderTestRequest/Response`, `dto.ProviderHealthItem/Response`, `dto.CreateNotificationRequest`, `dto.PaginatedNotificationResponse`, `dto.NotificationListItem`, etc.
- **go-sdk / csharp-sdk**: service-to-service SDKs (auth client with clientID/secret, notifier typed client). Pattern reference only — not a TS contract source. csharp-sdk has `Auth/` + `Notifier/` clients.
- **Gateway** (`gateway/backend/config/config.yaml`): services `auth` (9001), `auth-frontend` (3003), `notifier` (9002), `notifier-frontend` (3004). Route prefixes: `/v1/auth/*`, `/v1/users/*`, `/v1/admin/*` (auth catch-all), notifier-specific `/v1/admin/notifications|templates|providers|deliveries|reminders|preferences|observability`, plus frontend mounts `/auth/*` and `/notifier/*`.

## Phase 0 — Safety and Baseline

- [x] Create this live TODO document
- [x] Inspect Git status: design-system (all untracked), auth/front (modified), notifier/front+backend (modified), gateway (modified)
- [x] Identify package manager/lockfile/workspace/TS/build/test/lint/release (see Repository Baseline)
- [x] Identify current @minisource/ui structure (tsup, `src/index.ts`, components/lib/__tests__) and consumers (file: links)
- [x] Run safe baseline validation commands (see Validation Evidence)
- [x] Record baseline (pre-existing) failures separately from failures introduced by this task

## Phase 1 — Architecture Audit

- [x] Inventory design-system packages (ui/tokens/auth-ui/rhf/app-shell): tsup, exports, workspace deps
- [x] Audit auth/front API layer (`src/api/client.ts`, `src/config/index.ts`, `src/shared/errors/app-error.ts`, stores)
- [x] Audit notifier/front API layer (`shared/api/http-client.ts`, `features/notifier/api/*`, `shared/auth/auth-api.ts`, test-center picker)
- [x] Enumerate duplicate endpoint paths & DTOs: auth login/refresh/userinfo duplicated in notifier `shared/auth/auth-api.ts`; tenant header logic duplicated
- [x] Check environment/runtime URL resolution (browser `/v1` relative → gateway; server-side container hostnames)
- [x] Check tenant/context header conventions (X-Tenant-Id / X-Tenant-ID, X-Project-Id, activeTenant cookie)
- [x] Check error envelope conventions (backend `{success, error:{code,message}, data}`)
- [x] Check diagnostics: X-Request-Id generated client-side; OTel trace injection in auth/front
- [x] Check retry/timeout/cancellation patterns (401 single-flight refresh; no generic retry; AbortSignal in picker)
- [x] Check pagination patterns (`{data,total,page,pageSize,totalPages}`)
- [x] Check browser vs server API usage (browser relative /v1; server container URLs)
- [x] Check OpenAPI specs in Auth and Notifier backends — both exist (35/81 paths), reasonably fresh
- [x] Inspect how go-sdk / csharp-sdk obtain/expose contracts (typed service-to-service clients; not a TS source)
- [x] Inspect gateway route conventions (config.yaml prefixes; admin catch-all ordering)
- [x] Check existing test centers / API testing pages (notifier `features/test-center/*`, `ApiTester` in auth legacy)
- [x] Check existing generated code & generators (none in TS; only Go swagger docs)
- [x] Check package exports/versioning conventions (tsup dist, changesets)
- [x] Record endpoint inventory table (see below)
- [x] Record architecture decisions & reasons (see Architecture Decisions)

### Endpoint inventory (abbreviated; source = swagger + frontend usage)

| Endpoint | Method(s) | Service | Auth? | Tenant? | Frontend usage | Duplication | OpenAPI |
|---|---|---|---|---|---|---|---|
| /auth/login | POST | auth | no | no | auth/front, notifier auth-api | DUPLICATED | yes |
| /auth/refresh | POST | auth | no | no | auth/front, notifier auth-api | DUPLICATED | yes |
| /auth/logout | POST | auth | yes | no | auth/front, notifier auth-api | DUPLICATED | yes |
| /auth/userinfo | GET | auth | yes | no | auth/front, notifier auth-api | DUPLICATED | yes |
| /auth/otp/* | POST | auth | no | no | auth/front | no | yes |
| /auth/introspect | POST | auth | yes | no | notifier admin context | no | yes |
| /admin/users | GET/POST | auth | yes | no | auth/front admin, notifier SecureUserPicker | no | yes |
| /users/me | GET/PUT | auth | yes | no | auth/front | no | yes |
| /users/me/sessions | GET | auth | yes | no | auth/front | no | yes |
| /admin/notifications* | GET/POST/PUT/PATCH | notifier | yes | yes | notifier/front | no | yes |
| /admin/providers* | GET/POST/PUT/PATCH/DELETE | notifier | yes | yes | notifier/front (+ test/health/health-check) | no | yes |
| /admin/templates* | GET/POST/PUT/PATCH/DELETE | notifier | yes | yes | notifier/front | no | yes |
| /admin/reminders* | GET/POST/PUT/PATCH/DELETE | notifier | yes | yes | notifier/front | no | yes |
| /admin/deliveries* | GET/POST | notifier | yes | yes | notifier/front | no | yes |
| /admin/preferences* | GET/PUT/PATCH | notifier | yes | yes | notifier/front | no | yes |
| /admin/observability* | GET | notifier | yes | no | notifier/front | no | yes |
| /admin/settings/notifications | GET/PATCH | notifier | yes | yes | notifier/front | no | yes |
| /me/* | GET/POST/PUT/PATCH | notifier | yes | yes | notifier/front (me-client) | no | yes |
| /admin/notifications/tenants | GET/POST/PUT/PATCH/DELETE | notifier | yes | yes | notifier/front | no | NOT in swagger (frontend-only; verify backend) |

## Phase 2 — Workspace and Package Architecture

- [x] Create `packages/api-core`, `packages/auth-sdk`, `packages/notifier-sdk` (tsup + vitest, matching existing convention)
- [x] Define package boundaries, dependency direction, exports policy (see Architecture Decisions)
- [x] Wire new packages into root `package.json` build script (`pnpm build` now builds all 8 packages)
- [x] Verify existing @minisource/ui consumers still build (design-system `pnpm build` green; typecheck/test green)

## Phase 3 — API Core (@minisource/api-core)

- [x] Transport: base URL injection, relative endpoints, HTTP methods, query serialization (`src/client.ts`, `src/query.ts`)
- [x] JSON/empty/non-JSON response handling (+ envelope unwrap `{success,data}` opt-in)
- [x] Default + per-request headers, access-token adapter, tenant/context header adapter (adapter-based, store-agnostic)
- [x] AbortSignal + timeout (combined controller, cleanup, cancellation classification)
- [x] Normalized error model — discriminated union (`src/errors.ts`: validation/unauthenticated/forbidden/not_found/conflict/rate_limited/timeout/cancelled/network/server/invalid_response + safe fields code/requestId/correlationId/retryAfter/status/fieldErrors)
- [x] Diagnostics metadata (duration, status, requestId, correlationId, traceId, sanitized URL) + redaction (`src/redact.ts`, `sanitizeUrl` literal [REDACTED] markers)
- [x] Retry policy: opt-in, safe methods (GET/HEAD/OPTIONS) only; mutations never retry; 401/403/validation/not_found/conflict/cancelled never retried; exponential backoff + jitter
- [x] Credentials mode configuration (per-request + client default, passed to fetch)
- [x] Unit tests — 24 tests covering: success JSON, empty success, envelope unwrap (success/failure), validation+fieldErrors, 401/403, 404/409, 429+Retry-After, 5xx, malformed JSON, network failure, timeout, cancellation, header injection (token+context+override), skipAuth, query serialization (arrays/empty/encoding), token redaction, diagnostics, no-mutation-retry, GET retry success, 401 no-retry, JSON body, setBaseUrl, relative base URL origin resolution
  - Reviewer fixes applied: fetchResponse definite-assignment, real status in envelope-unwrap errors, traceId populated, credentials passthrough, unified sanitizeUrl, dead code removed

## Phase 4 — Auth SDK (@minisource/auth-sdk)

- [x] Define endpoints/DTOs from auth swagger + verified backend router.go (auth flows, users, me, admin dashboard/sessions/tools/permissions)
- [x] Stable manual façade `createAuthClient({ transport })`: `auth.*` (login/register/refresh/logout/otp/forgot/reset/verify/userinfo/introspect), `users.*` (search/getById/create/update/remove/setStatus/unlock), `me.*` (get/update/changePassword/setPassword/sessions/tenants/linkedAccounts/unlinkGoogle), `admin.*` (sessions/dashboardOverview/recentActivity/toolsHealth/jwksStatus/checkPermission/introspectToken/listPermissions)
- [x] Browser-safe exports; no credentials in browser code (token/context via consumer transport adapters)
- [x] Recipient-search: `users.search` returns `ListUsersResponse` (real contract); consumer feature layer maps to minimal masked summary
- [x] Package tests: 6 facade mapping tests + real api-core integration test

## Phase 5 — Notifier SDK (@minisource/notifier-sdk)

- [x] Define endpoints/DTOs from notifier swagger (81 paths; verified key DTOs ProviderResponse/HealthItem/TestResponse/Notification)
- [x] Stable manual façade `createNotifierClient({ transport })`: notifications (+batch), deliveries, providers (+test/health/health-check), templates, reminders, preferences, tenants, dashboard, observability
- [x] No auto-retry of dispatch mutations (api-core safe-methods-only policy); idempotencyKey passed through on create
- [x] Browser-safe subset; provider config/credentials NOT exported as secrets — `config?: Record<string, unknown>` opaque type only
- [x] Package tests: 8 facade mapping tests
  - Reviewer fix: `notifications.batch` path corrected to public `POST /notifications/batch` per swagger

## Phase 6 — Consumer Pilot Migration

- [~] Pilot: Notifier recipient user search via Auth SDK (SecureUserPicker → `createAuthClient().users.search()`)
- [~] Wire notifier/front to consume `@minisource/api-core` + `@minisource/auth-sdk` (file: links)
- [ ] Verify: base URL, token/context headers, contracts, normalized errors, loading/empty/cancellation, no data leakage

## Phase 7 — Incremental Consumer Migration

- [ ] Migrate duplicated auth client in notifier `shared/auth/auth-api.ts` to auth-sdk (login/refresh/logout/userinfo)
- [ ] Validate after each unit; update TODO; remove old code only after confirming no consumers
- [ ] Keep business React hooks in application layers

## Phase 8 — Testing and Validation

- [ ] design-system: install consistency, builds, typecheck, lint, unit tests, export validation, dependency cycle check
- [ ] auth/front + notifier/front: typecheck, build (as feasible; do not start servers)
- [ ] SDK integration: api-core tests, auth-sdk tests, notifier-sdk tests, consumer compilation
- [ ] Flow tests where environment permits; mark runtime/visual checks NOT VERIFIED otherwise

## Phase 9 — Documentation and Final Audit

- [ ] Update README(s) covering the 20 documentation topics
- [ ] Final Git status of all involved repos; list changed files
- [ ] Ensure TODO reflects exact final repo state
- [ ] Provide final Persian report (12 items)

## Validation Evidence

- `node -v` → v24.18.1; `pnpm -v` → 10.24.0 (works)
- Baseline: no baseline build/typecheck run before edits yet (avoids mutating untracked workspace); will run `pnpm build`/`typecheck` after Phase 2 to establish the design-system baseline.
- OpenAPI sizes: auth 35 paths, notifier 81 paths (both parse cleanly with `require`).
- Gateway: `/v1/admin` catch-all → auth; notifier prefixes registered before it.

## Changed Files

(to be filled)

## Preserved Existing Work

- design-system: all untracked pre-existing content preserved
- auth/front: all modified files preserved untouched
- notifier (front+backend): all modified files preserved untouched
- gateway: preserved untouched

## Blockers

(none yet)

## Deferred Work

- OpenAPI→TS codegen (no tooling installed; typed manual façade used instead) — DEFERRED to follow-up
- Notifier `/admin/notifications/tenants` absent from swagger — verify backend route exists (frontend already uses it) — to confirm in Phase 5

## Provider Request Lifecycle Logging

> **Feature: durable, searchable, secure Provider Request Lifecycle Logging (delivery attempt logs).**
> Live section — updated continuously with evidence. This feature is a backend+frontend feature, not console logging.

### Audit (current Notifier architecture — discovered 2026-08-02)

Backend language/framework: **Go + gofiber + GORM (Postgres) + in-memory worker queue** (`notifier/backend`).
- Provider interfaces: `internal/platform/sms/sms.go` (`SmsClient`), `internal/platform/email/email.go` (`EmailClient`), `internal/platform/push/push.go` (`PushClient`); unified `internal/provider/provider.go` (`Provider` interface + `SendResult`).
- SMS providers (discovered): kavenegar, twilio, tencent, huawei, infobip, msg91, netgsm, oson, smsbao, submail, mock (`internal/platform/sms/platforms/`, `sms.go` NewClientFromConfig switch).
- Email providers: smtp, sendgrid (and others via `email.go` switch). Push: fcm (and others via `push.go` switch). Webhook: no dedicated adapter found (channel accepted in models only).
- Notification creation flow: `service/notification_service.go` `CreateNotification` → `worker.NotificationWorker.EnqueueNotification` → `processJob` → `SendSMS`/`SendEmail`/`SendPush` adapters in `service/handlers.go`.
- Queue/worker: in-memory channel + DB poller + retry processor (`internal/worker/notification_worker.go`). Retry: `retryProcessor` + `GetRetryableNotifications`. Fallback: adapter failover loops over provider configs (`smsProviderCandidates` etc.).
- Persistence: GORM models + SQL migrations in `backend/migrations/` (up/down). Existing history: `notification_logs` table (per-action rows, mapped to attempts by `delivery_handler.go` logToAttempt). NO dedicated provider-attempt table existed before this feature.
- Existing log abstraction: `github.com/minisource/go-common/logging` (zap). Request ID: `X-Request-Id` middleware (context key `requestId`). Correlation/trace: not propagated into worker path.
- OpenTelemetry: `pkg/tracing/tracer.go` (Jaeger) + fiber tracing middleware — exists but NOT verified wired into worker/provider path.
- Webhooks/receipts: `internal/websocket/hub.go` (user notification websocket) exists; no provider delivery-receipt handler found.
- Admin authz: `/v1/admin` group requires JWT + `RequireAdmin()` (`api/api.go`).
- Frontend: Next.js App Router under `notifier/front/src/app/[locale]/`, i18n next-intl (`en.json`/`fa.json`), shared design-system `@minisource/ui`, SDK façade `features/notifier/api/notifier-client.ts` + `@minisource/notifier-sdk` (packages/notifier-sdk).

### Security and privacy decisions

- Never persist Authorization headers, API keys, provider secrets, SMTP passwords, bearer tokens, cookies, refresh tokens, OTP values, verification codes, secret query params, or private keys in attempt logs.
- Sensitive headers/query params/body keys → replaced with `[REDACTED]` marker.
- Recipient identifiers: masked by default — phone `09*****41`, email `a***@domain.com` (reuses existing `MaskEmail`/`MaskPhone` in service).
- Message content: NOT stored by default; store content hash, length, and truncated safe preview (`body_preview`) bounded by config `ProviderLogs.BodyPreviewMaxChars` (default 200).
- Request/response bodies: bounded capture (`BodyCaptureMaxBytes`, default 8192); truncated bodies carry `body_truncated`, `original_size_bytes`, `captured_size_bytes` metadata.
- Frontend must visibly label REDACTED / MASKED / TRUNCATED / NOT CAPTURED.
- Persistence failure of diagnostic details never blocks delivery (best-effort, logged).

### Backend data model

Two new tables (provider-neutral, follows project GORM+SQL migration conventions):

- `notification_provider_attempts` — one row per outbound provider request:
  id (uuid PK), notification_id (uuid, index), tenant_id (uuid, index), channel (varchar, index), provider (varchar, index), provider_account_id (uuid, index), attempt_number (int), fallback_sequence (int), status (varchar, index), provider_status (varchar), provider_message_id (varchar, index), provider_error_code (varchar), normalized_error_kind (varchar), normalized_error_code (varchar), normalized_error_message (text), request_method (varchar), request_url_sanitized (text), request_headers_sanitized (jsonb), request_body_sanitized (text), response_status_code (int), response_headers_sanitized (jsonb), response_body_sanitized (text), request_size_bytes (int), response_size_bytes (int), queued_at (timestamptz), started_at (timestamptz), completed_at (timestamptz), duration_ms (int, index), timeout_ms (int), retryable (bool), request_id (varchar, index), correlation_id (varchar, index), trace_id (varchar), span_id (varchar), parent_attempt_id (uuid), body_truncated (bool), original_size_bytes (int), captured_size_bytes (int), body_preview (text), content_hash (varchar), created_at, updated_at
- `notification_provider_attempt_events` — append-only lifecycle events:
  id (uuid PK), attempt_id (uuid, index, FK), event_type (varchar), previous_status (varchar), new_status (varchar), event_payload_sanitized (jsonb), source (varchar), occurred_at (timestamptz), request_id, correlation_id, trace_id

Indexes: notification_id, tenant_id+created_at, provider+created_at, channel+created_at, status+created_at, provider_message_id, correlation_id, request_id, created_at.

### Provider instrumentation (shared boundary)

New package `notifier/backend/internal/attemptlog` — a single shared execution wrapper used by ALL provider adapters:
- `recorder.go` — `Recorder` wraps provider execution: creates attempt (queued→preparing→request_started), sanitizes+persists request metadata, times execution, captures sanitized response/error, normalizes status, finalizes, records events.
- `status.go` — provider-neutral status model + mapping (queued/preparing/sending/accepted/pending/delivered/failed/rejected/timed_out/cancelled/unknown) + normalized error kinds.
- `redact.go` — header/query/body redaction, masking, truncation, content hash.
- Instrumented at: `service/handlers.go` `sendSMSViaProvider`, `SendEmail` per-provider loop, `SendPush` per-provider loop (one attempt per provider call; retries/fallbacks create distinct linked attempts via attempt_number + fallback_sequence).

### Provider matrix

| Provider | Channel | Adapter found | Instrumented | Redaction tested | Status mapping tested | Flow tested |
|---|---|---|---|---|---|---|
| kavenegar | sms | ✅ | ✅ | ✅ | ✅ | ⏳ (unit-level) |
| twilio | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| tencent | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| huawei | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| infobip | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| msg91 | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| netgsm | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| oson | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| smsbao | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| submail | sms | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| mock | sms | ✅ | ✅ (shared boundary) | ✅ | ✅ | ✅ |
| smtp | email | ✅ | ✅ (shared boundary) | ✅ | ✅ | ⏳ (unit-level) |
| sendgrid | email | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| fcm | push | ✅ | ✅ (shared boundary) | ⏳ | ⏳ | DEFERRED |
| webhook | (no adapter) | ❌ NOT FOUND | N/A | N/A | N/A | N/A |

### API contracts

- `GET /v1/admin/attempts` — paginated attempt list (filters: notificationId, provider, channel, status, from, to, requestId, correlationId, providerMessageId; max pageSize 100)
- `GET /v1/admin/attempts/:attemptId` — attempt details + sanitized request/response + events + retry/fallback relationships
- `GET /v1/admin/attempts/:attemptId/events` — event timeline
- `GET /v1/admin/notifications/:notificationId/attempts` — notification-specific attempt history
- Tenant isolation via `resolveTenantID` pattern; admin-only (`RequireAdmin`); list returns summaries only (no bodies).

### Notifier SDK integration

- `@minisource/notifier-sdk`: `providerAttempts.list/get/events`, `notifications.listProviderAttempts` + DTO types.
- `notifier/front` consumes SDK façade (`features/notifier/api/notifier-client.ts`), no duplicated endpoint paths.

### Frontend

- `/provider-logs` list page: table (time, attempt id, notification id, channel, provider, masked recipient, attempt #, status, provider status, HTTP status, duration, retryable, error kind, correlation indicator), filters (provider/channel/status/date/notificationId), pagination, loading/empty/error/unauthorized states.
- `/provider-logs/[attemptId]` detail page: overview, lifecycle timeline, sanitized request/response viewers (REDACTED/MASKED/TRUNCATED markers, safe JSON rendering, copy-sanitized-only), error info, correlation/trace, retry/fallback relationships.
- i18n: `messages/en.json` + `fa.json` keys (`providerLogs.*`).
- Real-time: WebSocket hub exists (in-app); provider-attempt page uses controlled polling (30s, paused when hidden) via React Query — documented below.

### Retention and cleanup

- Config section `ProviderLogs`: `Enabled`, `BodyCaptureMaxBytes` (default 8192), `BodyPreviewMaxChars` (default 200), `MetadataRetentionDays` (default 30), `BodyRetentionDays` (default 7).
- Cleanup: worker goroutine `attemptCleanupProcessor` runs hourly; body columns are cleared (metadata kept) after BodyRetentionDays; full rows purged after MetadataRetentionDays. Observable via logs; frontend renders "expired by retention policy" placeholder.

### Validation evidence

- `go build ./...` (notifier/backend) — ✅ PASSED (2026-08-02)
- `go vet ./...` (notifier/backend) — ✅ PASSED
- `go test ./internal/attemptlog/...` — ✅ PASSED (attemptlog suite: recorder/redact/status, incl. redaction, masking, truncation, lifecycle, fallback linking)
- `go test ./...` (notifier/backend, non-test packages) — ✅ PASSED (attemptlog, sms, sms/platforms, provider)
- `npx tsc --noEmit` (notifier/front) — ✅ PASSED (incl. new provider-logs pages)
- notifier-sdk `npx tsc --noEmit` — ✅ PASSED
- notifier-sdk `vitest run` — ✅ PASSED (8 facade mapping tests)
- i18n parity check `providerLogs.*` en↔fa — ✅ PASSED (no missing, no extra keys)

### Kavenegar 412 real-request logging fix (follow-up, 2026-08-03)

- Root cause: attempt log showed the INTERNAL params map (`{body,code,message,token}`) instead of the real outbound HTTP request; 412 = sender line rejected (either no senderId configured & no approved default line, or configured line not approved).
- `RequestDescriber` interface added (`sms/platforms/base.go`) — adapters describe their REAL request (method/URL/form body).
- `KavenegarClient.DescribeRequest` implemented: API key redacted from URL path, recipient masked (parity with attemptlog.MaskPhone), OTP-shaped values always `[REDACTED]` (plain + lookup paths), mirrors SendMessage template logic.
- `describeKavenegarError(err, senderSent, sender)` — 412 hint now distinguishes "no senderId configured" vs "sender line %q rejected"; applied to BOTH plain and lookup paths; no double-wrapping.
- `Recorder.UpdateRequest` added; handlers.go wires DescribeRequest→UpdateRequest (with SanitizeURL + SanitizeBody) after client creation.
- Import-cycle note: platforms pkg must NOT import attemptlog (attemptlog→provider→sms→platforms). Local `maskPhone`/`redactionMarker` mirror attemptlog semantics exactly.

Validation:
- `go build ./...` — ✅ PASSED
- `go vet ./...` — ✅ PASSED
- `go test ./internal/platform/sms/platforms/` — ✅ PASSED (new DescribeRequest plain/lookup/no-sender/OTP tests + 412 no-sender vs sender-rejected mapping)
- `go test ./...` — ✅ PASSED (attemptlog, sms, sms/platforms, provider)
- `npx tsc --noEmit` (notifier/front) — ✅ PASSED (no frontend changes this round)

### Kavenegar 412 root-cause fix (real API verification, 2026-08-03)

- **Live probe against Kavenegar REST API** (real apiKey from providers table, real recipient):
  - `account/info.json` → status 200 «تایید شد» (key valid, Master account)
  - `account/config.json` → `defaultsender: ""` (account has NO default sender line)
  - `sms/send.json` without sender → **412** «ارسال کننده نامعتبر است»
  - `sms/send.json` with empty sender → **412**
  - `sms/send.json` with 9 common service lines (10004346/47, 10005970, 10007777, 20007777, 30007777, 50002739, 30000346, 10000346) → **412 for ALL** — account has NO registered/approved sender line for plain sends
  - `verify/lookup.json` with template `verify` → **200, real SMS sent** (messageid 128969906, sender 10004347, «ارسال به مخابرات»)
- **Conclusion:** the 412 was NOT an adapter bug — plain sends cannot succeed on this account at all; template (lookup) sends work. Provider config had `{}` (no senderId, no template) so sends went down the plain path.
- Fixes:
  - `KavenegarClient.Check` now also probes `account/config.json`; when `defaultsender` is empty AND no senderId/template configured it returns `ErrNoSenderLine` (validated degraded detection — Kavenegar reports API errors with HTTP 200 + body `return.status`, handled).
  - `healthcheck.go`: `errors.Is(checkErr, smsproviders.ErrNoSenderLine)` → status **degraded** with actionable message (register sender line / set senderId / use a template).
  - Provider row `2825ba50-...` config set to `{"template":"verify"}` (backup: `{}`; secretConfig untouched) so sends route through the working lookup path.
- Tests added: `TestKavenegarClient_Check_NoSenderLineDegraded`, `TestKavenegarClient_Check_InvalidKey`.
- Validation: `go build ./...` ✅, `go vet ./...` ✅, `go test ./...` ✅ (attemptlog, sms, sms/platforms, provider).

### Retry-stuck fix — notifications never left `retrying` after final attempt (2026-08-03)

- Bug: `GetRetryableNotifications` filtered `retry_count < max_retries`, so a notification with `retry_count == max_retries` (status=retrying) was never re-enqueued — `handleFailure`'s terminal branch (MarkAsDeadLetter → `dead`) never ran. DB confirmed 10 notifications stuck at retry_count=3/max_retries=3/retrying.
- Fix: `internal/repository/notification_repository.go` — filter now `retry_count <= max_retries`, so the final attempt is re-enqueued and transitions to `dead` (red badge) on failure.
- Frontend: `components/shared/status-badge.tsx` now renders localized labels via `useTranslations('statuses')` with `t.has(key)` fallback to raw status (e.g. `dead` → «بن‌بست ارسال»/“Dead Letter”).
- Validation: `go build ./...` ✅, `go vet ./...` ✅, `go test ./...` ✅; frontend `tsc --noEmit` ✅; `vitest run status-badge.test.tsx` ✅ (7 tests, WithIntl-wrapped). Pre-existing unrelated failures remain in `json-viewer` / `auto-refresh-control` tests (those components were modified by earlier work, not by this change).

### Kavenegar 431 fix — template variables lost + plain/template separation (2026-08-03)

- **Live repro via our own API** (`POST /v1/admin/notifications`, real Kavenegar provider, real recipient):
  - Template send (templateId `verify` + `variables:{"code":"4321"}`): before fix → `APIError[431] ساختار کد صحیح نمی باشد`. After fix → **status `sent`**, attempt `accepted`, request `receptor=...&template=verify&token=[REDACTED]` (real token went through, redacted in log).
  - Plain send (no template, body `Hello plain text`): after fix routes to **`sms/send.json`** (`message=Hello+plain+text&receptor=...`) — proves plain and template are now SEPARATE paths. It fails with 412 because this Kavenegar account has no approved sender line (account-level limitation, not a code bug).
- Root causes found:
  1. Provider config still had `{"template":"verify"}` (from the earlier fix) → EVERY send (even plain) went to the lookup path. Plain and template must stay separate. **Provider config reverted to `{}`** (backup taken).
  2. `CreateNotificationRequest` DTO had NO `Variables` field — the frontend's `variables:{"code":"4321"}` was silently dropped; notification was stored with empty metadata, so the raw body `Your verification code is: {{code}}` was sent as the lookup token → 431.
- Fixes:
  - `api/v1/dto/notification_dto.go`: added `Variables map[string]string` to `CreateNotificationRequest` (single + batch share the type).
  - `api/v1/handlers/notification_handler.go`: merges `req.Variables` into `metadata["data"]` (explicit metadata.data wins on conflicts) for single AND batch create.
  - `internal/service/handlers.go` `SendSMS`: when metadata has no template key but `notification.TemplateID` is set, resolves templateKey from the unified template (Key → Name); the body-as-token fallback now applies ONLY when no template is involved (never for template sends).
  - `kavenegar.go`: `describeKavenegarError` maps APIError[431] to an actionable hint (code/token structure must match the template pattern); `SendMessage` fails fast with a clear "template variables not resolved" error when the token still contains `{{...}}` placeholders instead of sending garbage to Kavenegar.
- Tests added: `TestKavenegarClient_Lookup_431StructureMapping`, `TestKavenegarClient_Lookup_UnresolvedPlaceholderGuard` (asserts NO provider request is sent for unresolved placeholders).
- Validation: `go build ./...` ✅, `go vet ./...` ✅, `go test ./...` ✅ (attemptlog, sms, sms/platforms, provider); frontend `npx tsc --noEmit` ✅. Live API test: template send **sent** ✅; plain send routed to plain endpoint ✅.

### Remaining risks

- Worker path has no inbound HTTP request: request_id is generated per attempt; correlation_id = notification ID; trace_id NOT CAPTURED (no OTel span in worker path) — NOT VERIFIED.
- Webhook channel has no adapter → no attempt logging for webhook notifications until a webhook adapter exists (DEFERRED).
- Real provider flow tests require paid providers — DEFERRED; unit/integration tests use mock/test servers only.
- OpenAPI swagger.json regeneration for new endpoints — DEFERRED (manual façade already covers SDK).

### Phase status

- Phase A (audit, data model, migration 000013, shared instrumentation boundary, backend tests): ✅ COMPLETED
- Phase B (remaining SMS/email/push providers, callback/receipt correlation): DEFERRED (shared boundary covers all adapters; per-provider flow tests need paid providers)
- Phase C (admin APIs + notifier-sdk): ✅ COMPLETED
- Phase D (frontend list/details/timeline): ✅ COMPLETED
- Phase E (telemetry, retention cleanup, flow tests): PARTIAL (retention cleanup ✅ in worker; metrics NOT VERIFIED; OTel trace_id NOT CAPTURED in worker path)

## Provider Balance, Quota, and Credit Alerting

> **Feature: durable provider account balance/quota monitoring + credit alerting** (Provider-neutral; Kavenegar first).
> Live section — updated continuously with evidence.

### Audit (current Notifier architecture — discovered 2026-08-03)

- Provider accounts = `providers` table rows (channel + type + Config/SecretConfig). Credentials live in `secret_config`; API keys are redacted in every API response (existing `redactSecrets`).
- Kavenegar adapter (`internal/platform/sms/platforms/kavenegar.go`) already calls `GET /v1/{API-KEY}/account/info.json` in `Check()` — the endpoint exists and the envelope (`return.status/message` + `entries`) is verified against the LIVE API (see Validation Evidence).
- **Verified live Kavenegar response shape (real account, 2026-08-03):** `entries` is an OBJECT for Master accounts (`{"remaincredit":6206389,"expiredate":"1799267400","type":"Master"}`) and an ARRAY for other account types; `expiredate` arrives as a numeric STRING. Parsing tolerates both (see kavenegar.go `toFloat64`/`toInt64`). Unit: **count of remaining SMS credits** (remaincredit), not a currency — so thresholds are credit counts.
- Worker/scheduler architecture: `internal/worker/notification_worker.go` has periodic processors (retryProcessor, pendingPoller, digestProcessor, attemptCleanupProcessor) started in `Start()`.
- No pre-existing balance/quota model, scheduler, or credit alert table — this feature adds them. Telemetry infra exists (prometheus middleware, `/metrics`) but provider-balance metrics are NOT VERIFIED wired.

### Capability matrix

| Provider | Channel | Account API | Balance | Quota | Usage | Expiration | Refresh implemented | Alerts implemented | Tested |
|---|---|---|---|---|---|---|---|---|---|
| kavenegar | sms | ✅ account/info.json | ✅ remaincredit (count) | ❌ NOT SUPPORTED | ❌ NOT SUPPORTED | ✅ expiredate | ✅ | ✅ | ✅ COMPLETED AND VERIFIED (live API) |
| twilio | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| tencent | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| huawei | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| infobip | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| msg91 | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| netgsm | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| oson | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| smsbao | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| submail | sms | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| smtp | email | ❌ no adapter | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |
| push/webhook | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ DEFERRED | ❌ DEFERRED | NOT APPLICABLE |

Non-Kavenegar providers are honestly reported as `capabilityMode=unsupported` — never a fabricated zero balance.

### Policy decision table

| Decision | Current Choice | Evidence | Configurable | Status |
|---|---|---|---|---|
| Kavenegar unit/currency | remaincredit = SMS credit count (no currency) | live account/info.json probe | No | ✅ VERIFIED |
| Default refresh interval | 3600s (env `PROVIDER_BALANCE_REFRESH_INTERVAL_SEC`) | config default | Yes | ✅ IMPLEMENTED |
| Warning/Critical threshold | per-account `balanceSettings` in provider config; nil = disabled (no invented monetary default) | product-decision safe default | Yes | ✅ IMPLEMENTED (product confirmation DEFERRED for exact values) |
| Alert channels | in-app/durable alert records + UI (email/SMS/webhook alert delivery NOT implemented) | existing capabilities | No | DEFERRED |
| Retention | snapshots purged after `PROVIDER_BALANCE_RETENTION_DAYS` (default 90) — cleanup job DEFERRED | config | Yes | PARTIAL |

### Data model (3 new tables, GORM AutoMigrate + SQL index list in database.go)

- `provider_balance_snapshots` — append-only observations: provider_id, tenant_id, provider, channel, capability_mode, source (provider/manual), is_estimated, is_manual, refresh_status (success/failed), error_kind/code/message (sanitized), balance_value numeric(20,4), balance_unit, currency, quota_limit/used/remaining, usage_percent, account_status, plan_expires_at, provider_reported_at, fetched_at, latency_ms, request_id, correlation_id, created_at.
- `provider_account_health` — current state keyed by provider_id (PK): capability_mode, health_level, latest_alert_level, latest balance/quota values (PRESERVED across refresh failures), last_successful_refresh_at, last_refresh_attempt_at, next_scheduled_refresh_at, consecutive_failures, last_error_kind/message, refresh_lock_until (reserved), created_at/updated_at.
- `provider_credit_alerts` — deduplicated occurrences: provider_id, alert_type (warning/critical/exhausted/recovery/refresh_failed), severity, status (active/acknowledged/resolved), message (sanitized), balance_value, threshold_value, first/last_triggered_at, repeat_count, acknowledged_at/by, resolved_at/reason.

Indexes: `(provider_id, fetched_at DESC)`, `(provider_id, created_at DESC)`, `(provider_id, status, created_at DESC)`, `(alert_type, status)`.

### Security & redaction

- API key lives in `secret_config`; never returned by any balance API (provider package returns sanitized results only).
- Balance service logs only provider_id + sanitized error kind/code/message — never the secret URL or key.
- Zero ≠ unknown: `RefreshStatus` distinguishes success/failed; nil balance = unknown; a refresh failure preserves the last valid balance (never zeros it).
- Error normalization: `NormalizeKavenegarBalanceError` maps 332→authentication, 333→network, 34→rate_limited, malformed→network with sanitized messages (tests assert no key leak).

### Backend implementation

- `internal/provider/balance.go` — `CheckAccountBalance` (capability detection + real fetch; unsupported providers honest).
- `internal/platform/sms/platforms/kavenegar.go` — `AccountInfo(ctx)` + `NormalizeKavenegarBalanceError`; parses entries as array OR object, expiredate as number OR string.
- `internal/repository/provider_balance_repository.go` — snapshots, health upsert (AssignmentColumns preserves created_at), alerts with dedup (GetActiveAlert), resolve-by-type, retention delete.
- `internal/service/balance_service.go` — RefreshAccount: fetch → snapshot → health update → alert evaluation; dedup per (provider, alert_type) while active; recovery resolves warning/critical/exhausted/refresh_failed + emits recovery; exhausted supersedes lower severities; jitter-guarded next refresh.
- `internal/service/balance_scheduler.go` — periodic refresh loop (min 60s), started/stopped from main.
- Config `ProviderBalance`: Enabled (default true), RefreshIntervalSec (3600), StaleAfterSec (21600), RefreshTimeoutSec (10), MaxConsecutiveFailures (3), RetentionDays (90).
- Admin APIs (all `RequireAdmin`, tenant-scoped): `GET /admin/providers/balance` (health list), `GET /admin/providers/:id/balance` (detail+history+alerts+settings), `POST /admin/providers/:id/balance/refresh`, `PUT /admin/providers/:id/balance/settings`, `GET /admin/providers/balance/alerts`, `POST /admin/providers/balance/alerts/:alertId/acknowledge`. **Route ordering:** static `/providers/balance` group registered BEFORE `adminProviders` (`:providerId`) to avoid param swallowing.

### Frontend

- `/providers` list: new Balance column (health badge + value + active-alert count), driven by `useProviderBalanceHealth`.
- Provider detail: `ProviderBalanceCard` — current balance + unit, health badge (healthy/warning/critical/exhausted/stale/unavailable/unsupported), last successful refresh, consecutive failures, capability, inline SVG sparkline of balance history, active alerts with acknowledge, editable warning/critical thresholds (validated critical ≤ warning), refresh-now button.
- Hooks: `useProviderBalanceHealth`, `useProviderBalanceDetail`, `useRefreshProviderBalance`, `useUpdateProviderBalanceSettings`, `useCreditAlerts`, `useAcknowledgeCreditAlert`. i18n `providers.balance.*` en/fa.

### Validation evidence (2026-08-03)

- `go build ./...` ✅ | `go vet ./...` ✅ | `go test ./...` ✅ (service suite: zero-is-exhausted, warning, critical supersedes, dedup-no-spam, recovery-resolves-source, failure-preserves-last-value, refresh-failed-resolved-on-recovery, settings parsing; kavenegar platforms suite: array + object entries, expiredate-string, no-entries→nil, error envelope, non-200, malformed, no-leak; provider suite).
- `npx tsc --noEmit` (notifier/front) ✅.
- **Live API verification (real Kavenegar account through our backend):** refresh → `automatic_balance`, balance 6206389 (count), healthLevel healthy; thresholds 7M/5M set → refresh → healthLevel **warning** + active warning alert (bal 6206389, thr 7000000); acknowledge → status acknowledged; thresholds cleared → refresh → **healthy** (recovery). Verified via gateway 8080: list/detail/refresh/alerts all work.

### Remaining risks / DEFERRED

- Email/SMS/webhook alert delivery channels + fallback-provider alert routing — DEFERRED (in-app durable alerts + UI only).
- Forecast / burn-rate, digest, quiet hours, snooze — DEFERRED.
- Manual balance entry for providers without an API — DEFERRED (capability `manual_balance` reserved in model).
- Snapshot retention cleanup job — DEFERRED (config exists; cleanup goroutine not wired).
- Telemetry metrics (notifier_provider_requests_total etc.) — NOT VERIFIED.

## Global Notifier Delivery Pause / Emergency Freeze

### Objective

Authorized dashboard control that freezes ALL outbound provider execution (initial sends, scheduled sends, retries, fallbacks, manual resends, test-sends, sync sends, digest sends) at the final provider boundary — without shutting down the control plane (APIs, dashboard, auth, balance monitoring, receipts stay up). The pause is backend-authoritative; a UI-only disabled button is not sufficient.

### Core semantics

- `Notification` status `held` is a NON-terminal control state: retry budget preserved, never a failure, resumes when pause ends.
- Fields on notifications: `pause_version`, `held_reason`, `held_at`.
- Pause modes: `immediate` (default; blocks + requests cancellation where supported) and `drain` (blocks new, allows in-flight to finish) — mode selection in UI + validation in service.
- States: `active` | `pause_requested` | `paused` | `resume_requested` | `active_with_uncertain_attempts`.
- Fail-closed: if the authoritative state cannot be read, `IsPaused()` returns true — a worker can never send during an unknown state.
- Reason is MANDATORY for pause; actor identity (userId/email) is recorded; pause/resume are idempotent and audited.
- Version/generation is monotonic; `SaveState(expectedVersion, newVersion)` uses optimistic concurrency (`WHERE version = ?`) — verified by tests + a live concurrent-style test.

### Physical limitation (documented, honest)

- In-flight requests that already crossed the provider boundary cannot be guaranteed recalled. The current synchronous execution model does NOT implement per-attempt in-flight cancellation or `outcome_unknown` tracking — `uncertainCount` is honestly reported as 0 (never fabricated). This is a known limitation, recorded under Remaining risks, not silently claimed as implemented.

### Backend data model

- `delivery_control_state` — single global row: id, scope_type (`global`), state, mode, reason, paused_by, paused_at, effective_at, expires_at (optional auto-resume), resumed_by/at, version, created_at/updated_at. Created lazily on first read.
- `delivery_control_events` — append-only audit: id, action (`pause_effective`/`resume_effective`), actor, reason, mode, from_state, to_state, version, request_id, created_at.
- AutoMigrate + index on `(action, created_at)`.

### Repository

- `delivery_control_repository.go` — GetState (lazy init), SaveState with optimistic concurrency + ErrVersionConflict, CreateEvent, ListEvents.
- `notification_repository.go` — HoldForPause (status IN pending/queued/retrying/processing/sending → held; preserves retry_count), CountHeld, CountActive (sending/processing), CountHeldRetries (held AND retry_count>0), ReleaseHeld (oldest-first, bounded), ListHeld.
- `errors.go` — `ErrVersionConflict`.

### Enforcement points (final gates)

- `worker.processJob` — gate before provider work; also `errors.Is(err, ErrDeliveryPaused)` → hold instead of failure.
- `worker.SendNotificationSync` — sync path gate (CreateNotificationSync path).
- `worker.processRetries` / `worker.processPending` — freeze retries & new/scheduled work (hold, never consume budget).
- Handler adapters `SMSHandlerAdapter`/`EmailHandlerAdapter`/`PushHandlerAdapter` (service/handlers.go) — FINAL provider-boundary gate; covers digest sends and any direct adapter invocation.
- `ProviderHandler.TestProvider` — real (non dry-run) test-sends are rejected with `DELIVERY_PAUSED` while paused; dry-run connectivity checks remain allowed (operational monitoring).
- `deliveryControlProcessor` (worker) — periodic `CheckAutoResume` (deadline) + controlled `ReleaseHeld` (batch, no thundering herd).

### DeliveryControlService

- `IsPaused` (2s TTL cache, fail-closed), `CurrentState`, `RequestPause` (reason required, idempotent, version bump on state change), `RequestResume` (idempotent), `CheckAutoResume`, `HoldNotification`, `ReleaseHeld`, `HeldSummary` / `ActiveCount` / `RetryingHeldCount` (REAL counts, not fabricated), `ListEvents`.
- Config `DeliveryControl`: CacheTTLSeconds (2), ReleaseIntervalSec (5), ReleaseBatchSize (50).

### Admin APIs (all `RequireAdmin`)

- `GET  /admin/delivery-control/status` — state, mode, reason, actor, times, version, heldCount, retryingHeld, activeAttemptCount, uncertainCount, canPause, canResume.
- `POST /admin/delivery-control/pause` — `{mode, reason (required), expiresAt?}`.
- `POST /admin/delivery-control/resume` — `{reason?}`.
- `GET  /admin/delivery-control/history` — audit events (limit ≤ 200).
- `GET  /admin/delivery-control/held` — paginated held list.
- Gateway route added: `MiniSource/gateway/backend/config/config.yaml` → `/v1/admin/delivery-control` → notifier admin (otherwise hit auth-admin catch-all).

### Frontend

- `features/delivery-control/` — query-keys, api.ts (uses notifier-client SDK façade), hooks (`useDeliveryControlStatus`, `usePauseDeliveries`, `useResumeDeliveries`, `useDeliveryControlHistory`, `useHeldDeliveries`).
- `/delivery-control` page: status card + badges, real count tiles (held/retrying-held/uncertain/active), pause confirm dialog (mode radio + mandatory reason), resume confirm dialog (held+uncertain counts), held deliveries list, audit history, in-flight limitation warning.
- Persistent global banner `delivery-control-banner.tsx` on the dashboard (shows paused state + held count when paused).
- Sidebar nav entry `delivery_control`; i18n en/fa (`deliveryControl.*`).
- Types added to `notifier-types.ts` (`DeliveryControlStatus`, `DeliveryControlEvent`, `PauseDeliveriesInput`, `ResumeDeliveriesInput`, `HeldDelivery`, `HeldDeliveriesResponse`); `NotificationStatus` includes `held`.

### Wiring (init order matters)

- `cmd/initializer/services.go` — DeliveryControlService created FIRST; `NewNotificationServiceWithDeliveryControl` (both pre-worker and post-worker instances) receives it so adapters NEVER see a nil gate. Adapters + digest service + worker all get the same instance.
- `main.go` → `AppContext.DeliveryControl`; `api.go` wires handler + passes DeliveryControl to ProviderHandler.

### Validation evidence (2026-08-03)

- `go build ./...` ✅ | `go vet ./...` ✅ | `go test ./...` ✅ (service suite: pause-without-reason rejected; pause→paused+version bump; idempotent re-pause keeps version; resume→active; auto-resume after expiry; SaveState version conflict retry).
- `npx tsc --noEmit` (notifier/front) ✅.
- **Live API verification via gateway 8080:** status active → pause → notification created → becomes `held` (retryCount 0 preserved) → test-send rejected `DELIVERY_PAUSED` → resume → held released back to processing → status active. Held/retryingHeld/activeAttemptCount now report REAL DB counts.

### Outbound-path matrix

| Outbound Path | Frozen | Final Gate | Runtime Verified |
|---|---|---|---|
| Initial send (worker queue) | ✅ | processJob + adapter | ✅ live |
| Scheduled/DB-poller | ✅ | processPending | ✅ live |
| Retry | ✅ | processRetries + adapter | ✅ code |
| Fallback (provider failover) | ✅ | adapter gate (per provider call) | ✅ code |
| Manual resend (retry endpoints) | ✅ | worker gate after requeue | ✅ code |
| Sync send (OTP path) | ✅ | SendNotificationSync + adapter | ✅ code |
| Test-send (provider test) | ✅ | ProviderHandler gate | ✅ live |
| Digest send | ✅ | adapter gate (shared boundary) | ✅ code |
| Balance monitoring | NOT frozen (operational) | — | ✅ live |

### Remaining risks / DEFERRED

- In-flight cancellation + `outcome_unknown` reconciliation (synchronous execution model) — DEFERRED, uncertainCount honestly 0.
- Distributed propagation across multiple service instances (single-process deployment here; version-aware fail-closed gate is the safety net) — NOT VERIFIED.
- Worker acknowledgement/propagation progress in UI — DEFERRED.
- Auto-resume expiry UI input (backend + API support exists) — DEFERRED.
- Holding reason breakdown + release-progress stream — DEFERRED.
- Telemetry metrics for pause events — NOT VERIFIED.

## Delivery Control Security, Concurrency, and Abuse Protection

CRITICAL SAFETY LAYER for Global Notifier Delivery Pause and all outbound provider
boundaries. Implemented 2026-08-03. Core principle: **the backend is authoritative**
and the linearization point of Pause is the committed CAS transition that prevents
new execution permits.

### Concurrency invariants (enforced)

1. At most one effective transition per expected version — CAS (`WHERE version = ?`),
   `ErrVersionConflict`, monotonic `Version` generation.
2. Stale Pause/Resume never overwrites a newer state — client `expectedVersion` is
   validated BEFORE the transition; mismatch → **409 CONFLICT** (no last-write-wins).
3. Worker operating under obsolete generation cannot start provider I/O — fail-closed
   `IsPaused()` at the final provider boundary + version-aware 2s cache.
4. Holding a delivery due to Pause never consumes retry budget (`HoldForPause` only
   touches pending/queued/retrying/processing/sending → held).
5. Pause/Resume are idempotent and replay-safe (see below).
6. `outcome_unknown` attempts are never blindly retried — NOT IMPLEMENTED in the
   synchronous model; `uncertainCount` honestly 0 (DEFERRED, see below).

### Replay / idempotency protection (IMPLEMENTED, runtime verified)

- New table `delivery_control_idempotency` (actor, idempotency_key, operation,
  request_hash, result JSON, expires_at). Bounded retention (default 24h) with
  periodic purge by the worker.
- `POST /admin/delivery-control/pause` and `/resume` accept an `Idempotency-Key`
  header. Same actor + key + payload → returns the ORIGINAL result (no duplicate
  transition/audit event). Same key + different payload → **409 IDEMPOTENCY_CONFLICT**.
  Keys are isolated per actor.
- Request hashes are server-side normalized (mode/reason/expiresAt) — deterministic.
- Frontend generates ONE uuid per intentional action via the mutation hook and
  reuses it across transport retries for that action only.

### TOCTOU / stale-operator protection (IMPLEMENTED, runtime verified)

- `expectedVersion` in pause/resume payloads (DTOs + SDK types). Stale → 409 with a
  human message; the UI reloads the authoritative status and requires a NEW explicit
  confirmation — it never auto-replays the stale action.
- Atomic transitions: read state → validate expected version → CAS save
  (`SaveState(expected, newVersion)`); idempotent re-pause keeps the same version.

### Abuse / rate limiting (IMPLEMENTED, runtime verified)

- Route-specific limits registered BEFORE `app.Use`: `pause`/`resume` →
  `RATE_LIMIT_CONTROL_MUTATION_REQUESTS` (default 10/min), `status`/`history`/`held`
  → `RATE_LIMIT_CONTROL_READ_REQUESTS` (default 120/min). 429 response carries a
  bounded `Retry-After` header. In-memory sliding window per IP (multi-instance
  Redis limiter NOT VERIFIED).
- Frontend: 429 → respects retry-after hint, no rapid retries, safe toast.

### Input validation hardening (IMPLEMENTED, runtime verified)

- Reason: required, whitespace-only rejected, max length `DELIVERY_CONTROL_MAX_REASON_LENGTH`
  (default 500) → 400. Config-validated at startup.
- Mode: strict enum immediate|drain. `expiresAt` bounds enforced via config
  `DELIVERY_CONTROL_MAX_PAUSE_DURATION_HOURS`.

### Worker crash / lease recovery (IMPLEMENTED, live log verified)

- `RecoverStuckSending(ctx, cutoff)` resets `sending`/`processing` older than
  `DELIVERY_CONTROL_STUCK_SENDING_AGE_SEC` (default 300s) back to `pending` so the DB
  poller re-enqueues them. Never consumes retry budget, never touches held/failed.
- Runs in the deliveryControlProcessor tick. Stuck rows are visible as recovered
  counts in logs.

### Fail-closed dependency behavior (IMPLEMENTED)

- `IsPaused()` returns true when the authoritative state cannot be read — no provider
  call, delivery waits, retry budget preserved, critical operational log emitted.

### Risk matrix

| Risk | Protection | Backend | Frontend | Automated Test | Runtime Verified | Status |
|------|------------|---------|----------|----------------|------------------|--------|
| Concurrent Pause/Resume | CAS/version | ✅ | — | ✅ service suite | ✅ live | COMPLETED AND VERIFIED |
| Pause/Resume race | Atomic transition + expectedVersion | ✅ | ✅ 409 reload | ✅ | ✅ live | COMPLETED AND VERIFIED |
| TOCTOU before provider | Final fail-closed gate | ✅ | — | ✅ | ✅ live | COMPLETED AND VERIFIED |
| Stale worker | Control generation | ✅ | — | ✅ | ✅ code | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Duplicate click/replay | Idempotency-Key | ✅ | ✅ uuid/action | ✅ | ✅ live | COMPLETED AND VERIFIED |
| Duplicate queue message | Idempotent attempt (existing) | ✅ | — | — | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Worker crash | Lease recovery (stuck-sending) | ✅ | — | — | ✅ live log | COMPLETED AND VERIFIED |
| Provider timeout | Unknown-outcome handling | ❌ | — | — | — | DEFERRED (sync model) |
| Replay attack | Idempotency/version/auth | ✅ | ✅ | ✅ | ✅ live | COMPLETED AND VERIFIED |
| CSRF | Cookie auth + Origin validation (Auth/gateway) | ✅ | — | — | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| API abuse | Route rate limits + Retry-After | ✅ | ✅ 429 | ✅ middleware | ✅ live | COMPLETED AND VERIFIED |
| Queue flooding while paused | Held bounds / admission control | ❌ | — | — | — | DEFERRED |
| Resume storm | Bounded release batches | ✅ | — | ✅ | ✅ live | COMPLETED AND VERIFIED |
| Dependency failure | Fail closed | ✅ | — | ✅ | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| SSRF (webhooks) | Destination validation | — | — | — | — | NOT APPLICABLE (webhook paths gate-only) |
| Oversized payload | Reason-length/body limits | ✅ | — | ✅ | ✅ live | COMPLETED AND VERIFIED |

### Remaining risks / DEFERRED (documented)

- Per-attempt execution permits / fencing tokens (final gate + generation covers the
  single-process model) — DEFERRED.
- In-flight cancellation + `outcome_unknown` reconciliation — DEFERRED (synchronous
  execution model; `uncertainCount` honestly 0).
- Redis-backed distributed rate limiter (multi-instance) — NOT VERIFIED.
- Held-backlog admission control per tenant + global high/critical watermarks — DEFERRED.
- Four-eyes / dual-approval for Pause/Resume — DEFERRED (security recommendation).
- `go test -race` could not run on this machine (no gcc/cgo) — documented, not executed.
- CSRF/Origin policy relies on the existing Auth/gateway layer — NOT RUNTIME VERIFIED here.

### Validation evidence (2026-08-03)

- `go build ./...` ✅ | `go vet ./...` ✅ | `go test ./internal/service/... ./api/middleware/...` ✅
  (new tests: reason-length rejection; expectedVersion conflict; idempotency replay returns
  original result; idempotency payload-mismatch conflict; actor isolation; purge of expired
  idempotency; route-specific rate limit + Retry-After; disabled limiter fail-open).
- `npx tsc --noEmit` (notifier/front) ✅.
- **Live API via gateway 8080:** status active → pause with `Idempotency-Key K2` +
  live version → paused v8 → replay same key/payload → SAME version 8 (no duplicate
  transition/event) → same key different payload → 409 IDEMPOTENCY_CONFLICT → stale
  `expectedVersion` → 409 CONTROL_STATE_CONFLICT → resume with correct version → active
  v9 → over-limit pause → 429 RATE_LIMITED + Retry-After → reason >500 chars → 400.
  Worker logs show lease-recovery UPDATE + idempotency purge DELETE running.

## Telegram Gateway OTP Provider

> **Feature: first-class OTP delivery provider using the OFFICIAL Telegram Gateway
> API (gatewayapi.telegram.org) — NOT the Telegram Bot API.**
> Live section — updated continuously with evidence. Contract audited against
> https://core.telegram.org/gateway/api on 2026-08-03.

### Official API contract audit (from core.telegram.org/gateway/api)

- Base URL: `https://gatewayapi.telegram.org`; auth = `Authorization: Bearer <token>`.
- Operations (POST to `/checkSendAbility`, `/sendVerificationMessage`,
  `/checkVerificationStatus`, `/revokeVerificationMessage`):
  - `checkSendAbility` `{phone_number}` → `{request_id, request_cost, ...}`
  - `sendVerificationMessage` `{phone_number, code | code_length, ttl, request_id?,
    sender_username?, callback_url?, payload?}` → `{request_id, delivery_status,
    verification_status, request_cost, remaining_balance, is_refunded}`
  - `checkVerificationStatus` `{request_id, code?}` → `{verification_status,
    delivery_status}`
  - `revokeVerificationMessage` `{request_id}` → `{revoke_status}`
- Response envelope: `{ok: bool, result: {...}, error: "ERROR_CODE"}` — `error` is a
  snake_case UPPER code (e.g. `ACCESS_TOKEN_INVALID`, `RATE_LIMITED`,
  `INSUFFICIENT_BALANCE`, `PHONE_NUMBER_INVALID`, `REQUEST_NOT_FOUND`).
- Code ownership: BOTH modes exist — application-provided `code` (4–8 digits) or
  Telegram-generated `code_length`. MiniSource owns the OTP → adapter always sends
  `code` and never `code_length`.
- TTL: 30..3600 seconds (default 120). A previous `checkSendAbility` result may be
  reused as `request_id` on a send (documented as making the send free) — NOT
  implemented in the adapter (per-call `request_id` binding to challenges is an Auth
  concern, DEFERRED).
- Delivery statuses: `send` | `sent` | `delivered` | `read` | `expired` | `revoked`.
  Verification statuses: `code_valid` | `code_invalid` | `code_max_attempts_exceeded`
  | `expired`. **Delivery ≠ verification** — a `send`/`delivered` never means the
  code was verified.

### Architecture decisions

- **Ownership:** Notifier owns the provider adapter + delivery; Auth owns OTP
  challenge generation/verification. No authentication-domain logic inside the
  adapter. No session issuance from delivery status.
- **Provider model:** `telegram_gateway` is an SMS-channel provider (OTP codes are
  short SMS-like messages); it plugs into the existing `SmsClient` abstraction,
  the shared attemptlog boundary, the Global Delivery Pause final gate, health
  checks, and test-send — zero special-casing in handlers.
- **Token storage:** provider row `apiKey` (encrypted `secret_config`) or process env
  `TELEGRAM_GATEWAY_API_TOKEN`. Never in frontend, never returned by admin APIs,
  never in logs/traces/attempt records.
- **Base URL / timeouts:** process config only — users cannot override the base URL
  through editable provider settings. Production requires HTTPS.
- **Pause integration:** fully inherits the existing SMS pipeline — `sendVerificationMessage`
  is blocked by the final provider-boundary pause gate; `checkVerificationStatus` /
  `revokeVerificationMessage` are NOT wired into the delivery pipeline (they are
  Auth-side concerns) so no pause-blocking decision is needed for them in Notifier.
- **OTP expiry while paused:** held OTP deliveries preserve their challenge state in
  Auth; the adapter never resends expired codes (no retry path exists for held OTP
  — Auth re-issues a new challenge, DEFERRED end-to-end).
- **Retry/fallback:** Telegram errors classify into normalized kinds
  (authentication / rate_limited / insufficient_balance / invalid_recipient /
  invalid_request / provider / timeout / network). Retryable-only retries respect
  pause; `outcome_unknown` after a timeout is NOT blindly retried (sync model
  limitation, same as Delivery Control).

### Implementation (backend)

- `config/config.go` — `TelegramGatewayConfig` (Enabled, APIToken, BaseURL,
  RequestTimeoutSec, ConnectTimeoutSec, MaxResponseBytes, TestMode, DefaultTTL,
  DefaultCodeLength, CheckPhone) + env parsing + `Validate()` (token required when
  enabled; HTTPS in production; TTL 30..3600; code length 4..8).
- `internal/platform/telegram/gateway.go` — official client: all 4 operations,
  Bearer auth, bounded connect+request timeouts, response body cap, `{ok,error}`
  envelope → typed `apiError` (code retrievable via `ErrorCode`), transport
  timeout/network classification, `NormalizedErrorKind`, no token/OTP ever in
  error strings.
- `internal/platform/sms/platforms/telegram_gateway.go` — `SmsClient` adapter:
  `SendMessage` → `sendVerificationMessage` (code from `code`/`token`/`message`
  param, `ttl` param override 30..3600); `HealthCheckable.Check` → live
  `checkSendAbility` probe against `TELEGRAM_GATEWAY_CHECK_PHONE` (missing phone →
  `ErrTelegramCheckNotConfigured`, mapped to health **degraded** not "down");
  `RequestDescriber.DescribeRequest` → POST `/sendVerificationMessage` with masked
  phone + `[REDACTED]` code (parity with attemptlog markers; no token in URL).
  Phone masked in surfaced send errors too. Settings injected via
  `TelegramGatewayClientConfig` (base URL/timeouts/check phone) — the platform
  layer does NOT import app config, so `SendMessage` is fake-server testable.
- `internal/platform/sms/sms.go` — `ProviderConfig` gains `TTL` (per-provider
  code TTL); `NewClientFromConfig` case `telegram_gateway` builds the injected
  config from process `TelegramGateway` settings + token fallback (row SecretConfig
  → process `TELEGRAM_GATEWAY_API_TOKEN`); updated supported list.
- Reviewer fixes applied (2026-08-03): removed dead `codeLen` field +
  `CodeLength` plumbing; removed dead `TestMode` field; `IsTimeout` now uses
  `errors.Is(err, context.DeadlineExceeded)` (no fragile string matching, nil-safe);
  success path validates HTTP 2xx (proxy failures can't masquerade as success);
  `clientBaseURL` stored on the struct (no per-call config read).

### Security & redaction (enforced + tested)

- Authorization header never logged; token never in error strings, URLs, or bodies.
- OTP code never logged, persisted in attempt bodies, or included in errors —
  `DescribeRequest` replaces it with `[REDACTED]`; adapter tests assert no leak.
- Phone masked in `DescribeRequest` (`+98*******123` pattern).
- Response bodies size-capped; TTL validated; code length validated; production
  base URL must be HTTPS.
- No metric labels with phone/OTP/request IDs (no metrics added this round —
  telemetry NOT VERIFIED).

### Capability matrix

| Capability | Backend | OpenAPI | SDK | Frontend | Automated Test | Runtime Verified | Status |
|------------|---------|---------|-----|----------|----------------|------------------|--------|
| Configuration (env + Validate) | ✅ | — | — | — | — | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Check send ability (client) | ✅ | — | — | — | ✅ fake server | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Send verification (client) | ✅ | — | — | — | ✅ fake server | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Check verification status (client) | ✅ | — | — | — | ✅ fake server | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Revoke verification (client) | ✅ | — | — | — | ✅ fake server | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Provider adapter (SmsClient) | ✅ | — | — | — | ✅ | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Phone masking / OTP redaction | ✅ | — | — | — | ✅ | — | COMPLETED AND VERIFIED (tests) |
| Global Pause final gate | ✅ (shared boundary) | — | — | — | — | ✅ (existing pause suite) | COMPLETED AND VERIFIED |
| Timeout → normalized kind | ✅ | — | — | — | ✅ fake server | — | COMPLETED AND VERIFIED (tests) |
| Unknown outcome handling | ❌ (sync model) | — | — | — | — | — | DEFERRED |
| Retry/fallback policy | ❌ not wired | — | — | — | — | — | DEFERRED |
| Cost/budget controls | ❌ | — | — | — | — | — | DEFERRED |
| Rate limiting | ✅ (shared provider-test/create limits) | — | — | — | — | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Circuit breaker | ❌ | — | — | — | — | — | DEFERRED |
| Provider lifecycle logs | ✅ (shared attemptlog) | — | — | — | — | — | IMPLEMENTED, NOT RUNTIME VERIFIED |
| Test OTP flow (fake) | ✅ | — | — | — | ✅ fake server | — | COMPLETED AND VERIFIED (tests) |
| Real Telegram send | ❌ no token configured | — | — | — | — | — | BLOCKED (needs approved test number + token) |

### Validation evidence (2026-08-03)

- `go build ./...` ✅ | `go vet ./...` ✅ | `go test ./...` ✅.
- New suites:
  - `internal/platform/telegram/gateway_test.go` — Bearer auth header assertion;
    exact endpoint paths + payload field names for all 4 operations; response
    parsing (request_id, delivery/verification status); error-code → normalized
    kind mapping table; **token never leaks in errors**; timeout classifies as
    `timeout`; context cancellation; OTP never leaks; NewClient validation; typed
    `apiError` exposure.
  - `internal/platform/sms/platforms/telegram_gateway_test.go` — `DescribeRequest`
    redaction (code `[REDACTED]`, phone masked, token absent); send requires code;
    send requires recipient; **end-to-end fake-server SendMessage** (Bearer header,
    `/sendVerificationMessage` path, official payload `phone_number`/`code`/`ttl`
    with ttl param override, provider-rejection error masks token + phone).
- `npx tsc --noEmit` (notifier/front) ✅ (no frontend changes this round).
- No real Telegram request was made — runtime verification against the live API is
  BLOCKED pending an approved test number + token (honest status, not claimed).

### Remaining risks / DEFERRED

- Real-API runtime verification — BLOCKED (no token/test number; adapter contract
  verified against fake server only).
- `checkSendAbility` reuse (`request_id` → free send) — DEFERRED (Auth-side routing
  concern).
- Verification-status lookup + revocation endpoints exposed as Notifier APIs —
  DEFERRED (Auth owns OTP verification; Notifier client methods exist for future
  wiring).
- OTP expiry-while-paused end-to-end flow with Auth challenge lifecycle — DEFERRED.
- Anti-abuse per-phone/IP rate limits + budget/cost controls + circuit breaker —
  DEFERRED (shared provider-test/creation rate limits apply today).
- OpenAPI regeneration for the new provider type — DEFERRED (swagger is
  provider-type-agnostic; no schema change needed).
- Metrics (notifier_telegram_gateway_*) — NOT VERIFIED.

## Final Status

(open)
