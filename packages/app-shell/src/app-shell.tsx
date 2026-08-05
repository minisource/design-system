'use client';

import * as React from 'react';
import { cn } from '@minisource/ui';

export interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

/**
 * AppShell — Framework-agnostic main layout wrapper.
 *
 * Renders: Sidebar | (Topbar + Content + Footer)
 * Sidebar is visible on lg+, hidden on mobile (controlled by mobile sidebar state).
 * The mobile sidebar overlay is handled externally (in auth/front or consuming app).
 */
export function AppShell({
  sidebar,
  topbar,
  children,
  footer,
  dir = 'ltr',
  className,
}: AppShellProps) {
  return (
    <div dir={dir} className={cn('flex h-screen overflow-hidden', className)}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        {sidebar}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {topbar}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}

/**
 * MobileSidebar — Overlay sidebar for mobile viewports.
 */
export interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}

export function MobileSidebar({
  open,
  onClose,
  children,
  dir = 'ltr',
}: MobileSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" dir={dir}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <div className="fixed inset-y-0 start-0 z-50 w-64">
        {children}
      </div>
    </div>
  );
}