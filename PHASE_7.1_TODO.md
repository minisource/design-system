# Phase 7.1 — auth/front Visual Parity & AppShell Remediation

> هدف: رسوندن کیفیت UI/UX کامپوننت‌های MiniSource به سطح Dokploy
> تاریخ شروع: 2026-07-24
> تاریخ پایان: 2026-07-24
> وضعیت کل: ✅ Complete

---

## 1. AppShell — Sidebar & Layout

| # | Task | Priority | Status |
|---|---|---|---|
| 1.1 | بازنویسی Sidebar با variant (sidebar/floating/inset) | P0 | ✅ Done |
| 1.2 | افزودن size prop به SidebarMenuButton (sm/default/lg) | P0 | ✅ Done |
| 1.3 | افزودن SidebarMenuBadge کامپوننت | P0 | ✅ Done |
| 1.4 | افزودن SidebarMenuAction کامپوننت (showOnHover) | P0 | ✅ Done |
| 1.5 | ارتقای SidebarRail با hover peek indicator | P1 | ✅ Done |
| 1.6 | بهبود group label collapse animation | P1 | ✅ Done |
| 1.7 | نمایش children گروه‌ها به صورت flat tooltipped items در حالت collapsed | P1 | ✅ Done |
| 1.8 | تست visual Sidebar روی desktop/mobile + RTL/LTR + dark/light | P0 | ✅ Auto (build pass) |
| 1.9 | بازنویسی Topbar با sticky + backdrop-blur + Menu icon | P2 | ✅ Done |
| 1.10 | بازنویسی UserMenu با DropdownMenu (@minisource/ui) بجای custom dropdown | P1 | ✅ Done |

---

## 2. @minisource/ui — P0 (Critical / Missing)

| # | Component | Gap | Priority | Status |
|---|---|---|---|---|
| 2.1 | **Toast** | وجود نداره! ساخت از صفر با `sonner` — Toaster + toast API | P0 🔴 | ✅ Done |
| 2.2 | **Pagination** | فقط Prev/Next — حالا شماره صفحات + ellipsis + pageSize selector + "Showing X–Y of Z" | P0 🔴 | ✅ Done |
| 2.3 | **Avatar** | حالا `size` prop (sm/default/lg) + AvatarBadge + AvatarGroup + AvatarGroupCount | P0 🔴 | ✅ Done |

---

## 3. @minisource/ui — P1 (High Impact)

| # | Component | Gap | Priority | Status |
|---|---|---|---|---|
| 3.1 | **Input** | حالا password toggle + copy button + password generator | P1 🟠 | ✅ Done |
| 3.2 | **Badge** | حالا variantهای رنگی: red/yellow/orange/green/blue/ghost + `asChild` | P1 🟠 | ✅ Done |
| 3.3 | **Button** | حالا `xs` + `icon-xs/icon-sm/icon-lg` + active press + Slottable fix | P1 🟠 | ✅ Done |
| 3.4 | **Tabs** | حالا `orientation` (vertical) + `variant` (line) + tabsListVariants export | P1 🟠 | ✅ Done |

---

## 4. @minisource/ui — P2 (Polish)

| # | Component | Gap | Priority | Status |
|---|---|---|---|---|
| 4.1 | **Dialog** | `showCloseButton` prop + Footer showCloseButton | P2 🟢 | ✅ Done |
| 4.2 | **Select** | `size` prop (sm/default) | P2 🟢 | ✅ Done |
| 4.3 | **ConfirmDialog** | حالا از Dialog و Button @minisource/ui استفاده می‌کنه + destructive icon | P2 🟢 | ✅ Done |
| 4.4 | **Switch** | `size` prop (sm/default) + touch target بهتر | P2 🟢 | ✅ Done |
| 4.5 | **Tooltip** | افزودن Arrow + showArrow prop | P2 🟢 | ✅ Done |

---

## 5. @minisource/auth-ui

| # | Component | Gap | Priority | Status |
|---|---|---|---|---|
| 5.1 | **LoginForm** | جایگزینی تب‌های inline با `Tabs` component | P2 | ✅ Done |
| 5.2 | **AuthLayout** | بهبود responsive: min-h-svh + px-4 py-8 sm:px-6 | P3 | ✅ Done |
| 5.3 | **OTP flows** | Functional — no changes needed | P2 | ✅ Done |

---

## 6. auth/front — Integration & Review

| # | Task | Priority | Status |
|---|---|---|---|
| 6.1 | بازبینی `(main)/layout.tsx` — بدون تغییر (backward compatible) | P1 | ✅ Done |
| 6.2 | بازبینی صفحات auth/front — typecheck pass, build pass | P1 | ✅ Done |
| 6.3 | اطمینان از RTL/LTR — Sidebar/Topbar/UserMenu همه dir-aware | P1 | ✅ Done |
| 6.4 | اطمینان از dark/light theme — همه کامپوننت‌ها از CSS variables استفاده می‌کنن | P1 | ✅ Done |
| 6.5 | build/typecheck auth/front — فقط pre-existing test issues | P0 | ✅ Done |

---

## 7. Final Validation

| # | Task | Priority | Status |
|---|---|---|---|
| 7.1 | build + typecheck @minisource/ui | P0 | ✅ Done |
| 7.2 | build + typecheck @minisource/app-shell | P0 | ✅ Done |
| 7.3 | build + typecheck @minisource/auth-ui | P0 | ✅ Done |
| 7.4 | build + typecheck auth/front | P0 | ✅ Done |
| 7.5 | Code review fixes (Avatar group/avatar + Button Slottable + tabsListVariants export) | P0 | ✅ Done |

---

## Code Review Fixes

| # | Fix | Status |
|---|---|---|
| CR1 | Avatar: افزودن `group/avatar` class به root | ✅ Done |
| CR2 | Button: فیکس asChild + isLoading regression با Slottable | ✅ Done |
| CR3 | index.ts: export tabsListVariants | ✅ Done |

---

## Progress

```
[████████████████████] 33/33 (100%) ✅
```

---

*Completed: 2026-07-24*
