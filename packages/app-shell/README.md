# @minisource/app-shell

Shared admin panel shell layout used by auth/front, notifier/front, storage/front, and payment/front.

## Installation

```bash
pnpm add @minisource/app-shell
```

## Components

- `AppShell` - Main layout wrapper (Sidebar + Topbar + Content + Footer)
- `MobileSidebar` - Overlay sidebar for mobile viewports
- `Sidebar` - Navigation sidebar with collapsible groups
- `Topbar` - Header bar with left/right slots
- `Footer` - Bottom footer
- `UserMenu` - User avatar + dropdown menu

## Types

```typescript
NavItem {
  id: string;
  label: React.ReactNode;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: React.ReactNode;
  disabled?: boolean;
}
```

## Usage

```tsx
import { AppShell, Sidebar, Topbar, Footer, UserMenu } from '@minisource/app-shell';

function AdminLayout({ children }) {
  return (
    <AppShell
      sidebar={<Sidebar items={navItems} activeHref={pathname} />}
      topbar={<Topbar title="Dashboard" right={<UserMenu name="John" />} />}
      footer={<Footer>© 2025 MiniSource</Footer>}
    >
      {children}
    </AppShell>
  );
}
```

## Architecture

This package is **framework-agnostic** — no Next.js, no React hooks for session/auth. All navigation data, session state, and permission logic stays in the consuming app.