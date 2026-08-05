# Phase 7.2 — Advanced Features (Dokploy-inspired)

> هدف: افزودن قابلیت‌های پیشرفته به auth/front با الهام از Dokploy
> تاریخ شروع: 2026-07-25
> تاریخ پایان: 2026-07-25
> وضعیت: ✅ Complete

---

## 1. @minisource/ui — New Components

| # | Component | Description | Priority | Status |
|---|---|---|---|---|
| 1.1 | **ModeToggle** | Dark/Light toggle با sun/moon animation | P0 | ✅ Done |
| 1.2 | **DateTooltip** | Relative time + absolute tooltip on hover | P1 | ✅ Done |
| 1.3 | **Breadcrumb** | Navigation breadcrumb trail (7 sub-components) | P0 | ✅ Done |
| 1.4 | **ServerTime** | Client-side clock with timezone display | P0 | ✅ Done |

---

## 2. auth/front — Tenant Features

| # | Task | Priority | Status |
|---|---|---|---|
| 2.1 | **TenantSelector** — dropdown در sidebar header (مثل Dokploy org switcher) | P0 🔴 | ✅ Done |
| 2.2 | **useMyTenants hook** — API برای گرفتن tenantهای کاربر جاری | P0 🔴 | ✅ Done |
| 2.3 | **Tenant store** — active tenant state + switching (Zustand + persist) | P0 🔴 | ✅ Done |

---

## 3. auth/front — Navigation & Layout

| # | Task | Priority | Status |
|---|---|---|---|
| 3.1 | **ServerTime in header** — نمایش server time در Topbar | P0 | ✅ Done |
| 3.2 | **Breadcrumb in header** — مسیر فعلی در Topbar با auto-generation | P0 | ✅ Done |
| 3.3 | **Notification Bell** — اعلان invitationها در sidebar | P1 | ✅ Done |

---

## 4. auth/front — Polish

| # | Task | Priority | Status |
|---|---|---|---|
| 4.1 | **Pagination** — جایگزینی prev/next دستی با @minisource/ui Pagination در admin pages | P1 | ✅ Done |
| 4.2 | **ModeToggle upgrade** — استفاده از ModeToggle @minisource/ui در HeaderControls | P2 | ✅ Done |

---

## 5. Final Validation

| # | Task | Priority | Status |
|---|---|---|---|
| 5.1 | build + typecheck @minisource/ui | P0 | ✅ Done |
| 5.2 | build + typecheck @minisource/app-shell | P0 | ✅ Done |
| 5.3 | build + typecheck auth/front | P0 | ✅ Done |
| 5.4 | code review همه تغییرات | P0 | ✅ Done |

---

## Code Review Fixes

| # | Fix | Status |
|---|---|---|
| CR1 | BreadcrumbLink: Fragment → Slot (@radix-ui/react-slot) | ✅ Done |
| CR2 | BreadcrumbSeparator: moved outside BreadcrumbItem | ✅ Done |
| CR3 | getRelativeTime: "just now" → "in a moment" for future | ✅ Done |
| CR4 | ServerTime: useMemo to prevent re-renders | ✅ Done |
| CR5 | NotificationBell: افزودن DropdownMenuTrigger به import | ✅ Done |

---

## Progress

```
[████████████████████] 17/17 (100%) ✅
```

---

## فایل‌های ایجاد شده

```
@minisource/ui:
  src/components/mode-toggle.tsx       — Dark/light toggle با sun/moon
  src/components/date-tooltip.tsx      — Relative time + absolute tooltip
  src/components/server-time.tsx       — Live clock با timezone
  src/components/breadcrumb.tsx        — Breadcrumb trail (7 components)
  src/index.ts                          — Updated exports

auth/front:
  stores/tenant.store.ts               — Tenant state (Zustand + persist)
  hooks/use-my-tenants.ts              — React Query hook for /tenants/mine
  components/layout/tenant-selector.tsx — Tenant dropdown در sidebar header
  components/layout/notification-bell.tsx — Invitation bell با badge
  app/(main)/layout.tsx                — Integrated all new components
  components/layout/header-controls.tsx — Uses ModeToggle from @minisource/ui
  stores/index.ts                       — Updated exports
  hooks/index.ts                        — Updated exports
```

---

## نکات مهم

- **`/tenants/mine` endpoint**: باید در بکند پیاده‌سازی بشه. در حال حاضر ۴۰۴ میده.
- **date-fns**: DateTooltip یه fallback داخلی داره که بدون date-fns هم کار می‌کنه.
- **next-themes**: ModeToggle نیاز به استفاده از `useTheme` از `next-themes` داره که قبلاً توی پروژه هست.

---

*Completed: 2026-07-25*
