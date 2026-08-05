// @minisource/app-shell — Shared App Shell for MiniSource admin panels

// Provider + hooks
export { SidebarProvider, useSidebar } from './sidebar';

// Sidebar composable parts
export { Sidebar } from './sidebar';
export type { SidebarProps } from './sidebar';
export {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from './sidebar';
export type { SidebarProviderProps, SidebarTriggerProps, SidebarInsetProps } from './sidebar';

// Legacy simple layout
export { AppShell, MobileSidebar } from './app-shell';
export type { AppShellProps, MobileSidebarProps } from './app-shell';

// Topbar
export { Topbar } from './topbar';
export type { TopbarProps } from './topbar';

// Footer
export { Footer } from './footer';
export type { FooterProps } from './footer';

// User Menu
export { UserMenu } from './user-menu';
export type { UserMenuProps, UserMenuItem } from './user-menu';

// Core types
export type { NavItem, SidebarContextValue, SidebarVariant, SidebarMenuButtonSize } from './types';