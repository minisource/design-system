'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Separator } from './separator';
import { ChevronDown, Menu, X } from 'lucide-react';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface NavItem {
  /** Unique key for expand/collapse state */
  key: string;
  /** Display label */
  label: string;
  /** Navigation href */
  href: string;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Nested children for collapsible sections */
  children?: NavItem[];
}

export interface AppShellProps {
  children: React.ReactNode;
  /** Navigation items for the sidebar */
  navItems?: NavItem[];
  /** Currently active href */
  activeHref?: string;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Custom link renderer */
  renderLink?: (href: string, children: React.ReactNode, props?: Record<string, unknown>) => React.ReactNode;
  /** Header content (controls, user menu, etc.) */
  headerContent?: React.ReactNode;
  /** Sidebar header (logo, app name) */
  sidebarHeader?: React.ReactNode;
  /** Sidebar footer (user info, logout) */
  sidebarFooter?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Text direction */
  dir?: 'ltr' | 'rtl';
  /** Custom class names */
  className?: string;
  sidebarClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

// â”€â”€â”€ Sidebar Navigation Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SidebarNavItemProps {
  item: NavItem;
  activeHref?: string;
  onNavigate?: (href: string) => void;
  renderLink?: (href: string, children: React.ReactNode, props?: Record<string, unknown>) => React.ReactNode;
  expandedItems: string[];
  toggleExpanded: (key: string) => void;
  dir?: 'ltr' | 'rtl';
  depth?: number;
}

function SidebarNavItem({
  item,
  activeHref,
  onNavigate,
  renderLink,
  expandedItems,
  toggleExpanded,
  dir,
  depth = 0,
}: SidebarNavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.includes(item.key);
  const isActive = activeHref === item.href || activeHref?.startsWith(item.href + '/');

  const linkClass = cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    depth > 0 && (dir === 'rtl' ? 'mr-4 border-r pr-3' : 'ml-4 border-l pl-3')
  );

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => toggleExpanded(item.key)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="flex-1 text-start">{item.label}</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
        {isExpanded && item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <SidebarNavItem
                key={child.key}
                item={child}
                activeHref={activeHref}
                onNavigate={onNavigate}
                renderLink={renderLink}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                dir={dir}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const content = (
    <>
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      <span>{item.label}</span>
    </>
  );

  if (renderLink) {
    return renderLink(item.href, <span className={linkClass}>{content}</span>);
  }

  return (
    <a
      href={item.href}
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(item.href);
        }
      }}
      className={linkClass}
    >
      {content}
    </a>
  );
}

// â”€â”€â”€ AppShell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AppShell({
  children,
  navItems = [],
  activeHref,
  onNavigate,
  renderLink,
  headerContent,
  sidebarHeader,
  sidebarFooter,
  footer,
  dir = 'ltr',
  className,
  sidebarClassName,
  headerClassName,
  contentClassName,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = React.useCallback((key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  const handleNavigate = React.useCallback(
    (href: string) => {
      onNavigate?.(href);
      setSidebarOpen(false);
    },
    [onNavigate]
  );

  return (
    <div dir={dir} className={cn('flex min-h-screen', className)}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 flex w-64 flex-col bg-background transition-transform duration-300 lg:static lg:translate-x-0',
          dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r',
          sidebarOpen
            ? 'translate-x-0'
            : dir === 'rtl'
              ? 'translate-x-full'
              : '-translate-x-full',
          sidebarClassName
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          {sidebarHeader || <span className="text-xl font-bold">App</span>}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.key}
              item={item}
              activeHref={activeHref}
              onNavigate={handleNavigate}
              renderLink={renderLink}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
              dir={dir}
            />
          ))}
        </nav>

        {/* Sidebar footer */}
        {sidebarFooter && (
          <div className="border-t p-4">{sidebarFooter}</div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header
          className={cn(
            'sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur',
            headerClassName
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          {headerContent}
        </header>

        {/* Page content */}
        <main className={cn('flex-1', contentClassName)}>{children}</main>

        {/* Footer */}
        {footer && (
          <>
            <Separator />
            <footer className="py-6 text-center text-sm text-muted-foreground">
              {footer}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

