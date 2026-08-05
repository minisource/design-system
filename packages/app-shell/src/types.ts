/**
 * @minisource/app-shell — Public type definitions
 * All shell types are data-driven and app-agnostic.
 */

import * as React from 'react';

/**
 * Navigation item — a link or group in the sidebar.
 */
export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: React.ReactNode;
  /** Route href (omit for group headers) */
  href?: string;
  /** Icon element */
  icon?: React.ComponentType<{ className?: string }>;
  /** Nested items (for dropdown/accordion groups) */
  children?: NavItem[];
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Badge/count display */
  badge?: React.ReactNode;
  /** Whether group is collapsible (default: true for groups with children) */
  collapsible?: boolean;
}

/**
 * Sidebar visual variant.
 */
export type SidebarVariant = 'sidebar' | 'floating' | 'inset';

/**
 * Sidebar menu button size.
 */
export type SidebarMenuButtonSize = 'sm' | 'default' | 'lg';

/**
 * Sidebar props — controls sidebar appearance and state.
 */
export interface SidebarProps {
  /** Navigation items to render (data-driven menu) */
  items?: NavItem[];
  /** Currently active href (for highlighting) */
  activeHref?: string;
  /** Whether sidebar is collapsed (desktop) — controlled when onToggleCollapse provided */
  collapsed?: boolean;
  /** Toggle collapsed state */
  onToggleCollapse?: () => void;
  /** Sidebar brand/logo area */
  brand?: React.ReactNode;
  /** Sidebar header (rendered above items) */
  header?: React.ReactNode;
  /** Sidebar footer (rendered below items) */
  footer?: React.ReactNode;
  /** Direction for RTL/LTR */
  dir?: 'ltr' | 'rtl';
  /** Additional CSS classes */
  className?: string;
  /** Core SidebarContent when using composition (overrides items) */
  children?: React.ReactNode;
  /** Component used to render links (e.g. next/link). Defaults to a plain <a>. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkComponent?: React.ComponentType<any>;
  /** Visual variant: sidebar (default), floating, inset */
  variant?: SidebarVariant;
}

/**
 * SidebarProvider props — wraps sidebar + inset content.
 */
export interface SidebarProviderProps {
  /** Default open (expanded) state */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Default mobile open state */
  defaultMobileOpen?: boolean;
  /** Controlled mobile open state */
  mobileOpen?: boolean;
  /** Mobile open change handler */
  onMobileOpenChange?: (open: boolean) => void;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  /** Additional CSS classes */
  className?: string;
  /** Children: should contain a Sidebar + SidebarInset */
  children: React.ReactNode;
  /** Persist open state in cookie (default true) */
  persistState?: boolean;
}

/**
 * SidebarTrigger props — button to toggle sidebar.
 */
export interface SidebarTriggerProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Render as child (asChild) */
  asChild?: boolean;
}

/**
 * SidebarInset props — main content area.
 */
export interface SidebarInsetProps {
  children: React.ReactNode;
  className?: string;
  /** Topbar rendered at top of inset */
  topbar?: React.ReactNode;
  /** Footer rendered at bottom of inset */
  footer?: React.ReactNode;
  /** Direction */
  dir?: 'ltr' | 'rtl';
}

/**
 * Topbar props — the header bar above content.
 */
export interface TopbarProps {
  /** Left side controls (hamburger, breadcrumbs) */
  left?: React.ReactNode;
  /** Right side controls (theme toggle, language, user menu) */
  right?: React.ReactNode;
  /** Page title */
  title?: string;
  /** Whether to show the mobile sidebar toggle */
  showMobileToggle?: boolean;
  /** Toggle mobile sidebar */
  onToggleMobileSidebar?: () => void;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Footer props — optional bottom footer.
 */
export interface FooterProps {
  children?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

/**
 * AppShell props — the main layout wrapper (simple, framework-agnostic).
 */
export interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

/**
 * MobileSidebar props — overlay sidebar for mobile viewports (simple API).
 */
export interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  /** Side the drawer slides from */
  side?: 'left' | 'right';
}

/**
 * User menu item.
 */
export interface UserMenuItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  separator?: boolean;
}

/**
 * User menu props.
 */
export interface UserMenuProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
  items?: UserMenuItem[];
  dir?: 'ltr' | 'rtl';
  className?: string;
}

/** Context value returned by useSidebar */
export interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  dir: 'ltr' | 'rtl';
}
