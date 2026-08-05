'use client';

import * as React from 'react';
import { PanelLeftIcon } from 'lucide-react';
import { Button, cn, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Separator } from '@minisource/ui';
import type { NavItem, SidebarProps, SidebarProviderProps, SidebarTriggerProps, SidebarInsetProps, SidebarContextValue } from './types';

const SIDEBAR_COOKIE_NAME = 'minisource:sidebar';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD = 'b';

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider.');
  return ctx;
}

function useIsMobile(bp = 768) {
  const [is, setIs] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const onChange = () => setIs(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [bp]);
  return is;
}

// ── Provider ──

export function SidebarProvider({
  defaultOpen = true, open: openProp, onOpenChange, defaultMobileOpen = false,
  mobileOpen: mobileProp, onMobileOpenChange, dir = 'ltr', className, children, persistState = true,
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [_open, _setOpen] = React.useState(defaultOpen);
  const [_mOpen, _setMOpen] = React.useState(defaultMobileOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback((v: boolean | ((v: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(open) : v;
    if (onOpenChange) onOpenChange(next); else _setOpen(next);
    if (persistState && typeof document !== 'undefined') {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
    }
  }, [onOpenChange, open, persistState]);
  const mobileOpen = mobileProp ?? _mOpen;
  const setMobileOpen = React.useCallback((v: boolean | ((v: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(mobileOpen) : v;
    if (onMobileOpenChange) onMobileOpenChange(next); else _setMOpen(next);
  }, [onMobileOpenChange, mobileOpen]);
  const toggleSidebar = React.useCallback(
    () => (isMobile ? setMobileOpen((o) => !o) : setOpen((o) => !o)),
    [isMobile, setOpen, setMobileOpen]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD && (e.metaKey || e.ctrlKey)) { e.preventDefault(); toggleSidebar(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSidebar]);
  const state = open ? 'expanded' : 'collapsed';
  const value = React.useMemo<SidebarContextValue>(
    () => ({ state, open, setOpen, isMobile, mobileOpen, setMobileOpen, toggleSidebar, dir }),
    [state, open, setOpen, isMobile, mobileOpen, setMobileOpen, toggleSidebar, dir]);
  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div dir={dir} data-slot="sidebar-wrapper" style={{ '--sidebar-width': SIDEBAR_WIDTH, '--sidebar-width-icon': SIDEBAR_WIDTH_ICON } as React.CSSProperties}
          className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

// ── Sidebar (main) ──

export function Sidebar({
  items, activeHref, collapsed: collapsedProp,
  brand, header, footer, dir, className, children, linkComponent, variant = 'sidebar',
}: SidebarProps) {
  const ctx = useSidebar();
  const effDir = dir ?? ctx.dir;
  const collapsed = collapsedProp !== undefined ? collapsedProp : !ctx.open;
  const side = effDir === 'rtl' ? 'right' : 'left';

  if (ctx.isMobile) {
    return (
      <Sheet open={ctx.mobileOpen} onOpenChange={ctx.setMobileOpen}>
        <SheetContent dir={effDir} data-slot="sidebar" data-mobile="true" side={side}
          className={cn('w-[--sidebar-width] gap-0 bg-card p-0 text-card-foreground [&>button:last-child]:hidden', className)}
          style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}>
          <SheetHeader className="sr-only"><SheetTitle>Sidebar</SheetTitle><SheetDescription>Navigation</SheetDescription></SheetHeader>
          <div className="flex h-full w-full flex-col">
            {(brand || header) && <SidebarHeaderBlock collapsed={false} brand={brand} header={header} />}
            <SidebarContentBody items={items} activeHref={activeHref} collapsed={false} dir={effDir} linkComponent={linkComponent} />
            {footer && <div className="border-t p-2">{footer}</div>}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div dir={effDir} className="group peer hidden shrink-0 text-card-foreground md:block"
      data-state={ctx.state} data-collapsible={ctx.state === 'collapsed' ? 'icon' : ''} data-variant={variant} data-slot="sidebar">
      {variant === 'sidebar' && (
        <div data-slot="sidebar-gap" className={cn('relative bg-transparent transition-[width] duration-200 ease-linear',
          collapsed ? 'w-[--sidebar-width-icon]' : 'w-[--sidebar-width]')} />
      )}
      <div data-slot="sidebar-container" className={cn(
        'fixed inset-y-0 z-10 hidden h-svh transition-[left,right,width] duration-200 ease-linear md:flex',
        effDir === 'rtl' ? 'right-0' : 'left-0', collapsed ? 'w-[--sidebar-width-icon]' : 'w-[--sidebar-width]',
        variant === 'floating' && ['inset-y-3', effDir === 'rtl' ? 'right-3' : 'left-3', 'rounded-lg border shadow-lg'],
        variant === 'inset' && 'border-e-0 rounded-none')}>
        <div data-slot="sidebar-inner" className={cn('flex size-full flex-col bg-card',
          variant === 'sidebar' && 'border-e', variant === 'floating' && 'rounded-lg', className)}>
          {(brand || header) && <SidebarHeaderBlock collapsed={collapsed} brand={brand} header={header} />}
          {children ?? <SidebarContentBody items={items} activeHref={activeHref} collapsed={collapsed} dir={effDir} linkComponent={linkComponent} />}
          {footer && <div className={cn('border-t p-2', collapsed && 'px-0')}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function SidebarHeaderBlock({ collapsed, brand, header }: { collapsed: boolean; brand?: React.ReactNode; header?: React.ReactNode }) {
  return <div className={cn('flex flex-col justify-center gap-2 border-b py-3.5', collapsed ? 'items-center px-1' : 'px-3.5')}>{brand ?? header}</div>;
}

// ── Data-driven content ──

function SidebarContentBody({ items, activeHref, collapsed, dir, linkComponent }: {
  items?: NavItem[]; activeHref?: string; collapsed: boolean; dir: 'ltr' | 'rtl'; linkComponent?: React.ComponentType<any>;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div data-slot="sidebar-content" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2 no-scrollbar">
      {items.map((item) => <NavItemView key={item.id} item={item} activeHref={activeHref} collapsed={collapsed} dir={dir} depth={0} linkComponent={linkComponent} />)}
    </div>
  );
}

function NavItemView({ item, activeHref, collapsed, dir, depth, linkComponent }: {
  item: NavItem; activeHref?: string; collapsed: boolean; dir: 'ltr' | 'rtl'; depth: number; linkComponent?: React.ComponentType<any>;
}) {
  const [open, setOpen] = React.useState(depth === 0);

  // Depth 0 group with children
  if (depth === 0 && item.children && item.children.length > 0) {
    const isParentActive = item.children.some((c) => c.href && c.href === activeHref);
    // Groups with children are collapsible by default: the collapsible menu
    // button itself IS the group header (label + chevron). Only non-collapsible
    // static sections render a separate SidebarGroupLabel, otherwise the label
    // would be rendered twice (label + button) for the same group.
    const collapsible = item.collapsible !== false;
    return (
      <SidebarGroup>
        {item.label && !collapsed && !collapsible && <SidebarGroupLabel>{item.label}</SidebarGroupLabel>}
        <SidebarMenu>
          {collapsible && !collapsed && (
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isParentActive} collapsed={collapsed} tooltip={String(item.label)}
                dir={dir} linkComponent={linkComponent} onClick={() => setOpen((o) => !o)}
                href={item.href && item.href !== '#' ? item.href : undefined}>
                {item.icon && <item.icon className="size-4 shrink-0" />}
                {!collapsed && <span className="flex-1 text-start truncate">{item.label}</span>}
                {!collapsed && <ChevronIcon className="size-4 shrink-0 transition-transform" open={open} />}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {open && !collapsed && (
            <SidebarMenuSub>
              {item.children.map((child) => <NavItemView key={child.id} item={child} activeHref={activeHref} collapsed={collapsed} dir={dir} depth={depth + 1} linkComponent={linkComponent} />)}
            </SidebarMenuSub>
          )}
          {collapsed && item.children.map((child) => (
            <SidebarMenuItem key={child.id}>
              <SidebarMenuButton isActive={activeHref === child.href} collapsed={collapsed} tooltip={String(child.label)}
                href={child.href} dir={dir} disabled={child.disabled} linkComponent={linkComponent}>
                {child.icon && <child.icon className="size-4 shrink-0" />}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // Nested group
  if (depth > 0 && item.children && item.children.length > 0) {
    const isActive = activeHref === item.href;
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive} collapsed={collapsed} tooltip={String(item.label)}
          href={item.href} dir={dir} linkComponent={linkComponent}
          onClick={item.href && item.href !== '#' ? undefined : () => setOpen((o) => !o)}>
          {item.icon && <item.icon className="size-4 shrink-0" />}
          {!collapsed && <span className="flex-1 text-start truncate">{item.label}</span>}
          {!collapsed && <ChevronIcon className="size-4 shrink-0 transition-transform" open={open} />}
        </SidebarMenuButton>
        {open && !collapsed && (
          <SidebarMenuSub>
            {item.children.map((c) => <NavItemView key={c.id} item={c} activeHref={activeHref} collapsed={collapsed} dir={dir} depth={depth + 1} linkComponent={linkComponent} />)}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  // Leaf
  const isActive = activeHref === item.href;
  const Wrapper = depth > 0 ? SidebarMenuSubItem : SidebarMenuItem;
  return (
    <Wrapper>
      <SidebarMenuButton isActive={isActive} collapsed={collapsed} tooltip={String(item.label)}
        href={item.href} dir={dir} disabled={item.disabled} linkComponent={linkComponent}>
        {item.icon && <item.icon className="size-4 shrink-0" />}
        {!collapsed && <span className="flex-1 text-start truncate">{item.label}</span>}
        {!collapsed && item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
      </SidebarMenuButton>
    </Wrapper>
  );
}

function ChevronIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg className={cn(className, open && 'rotate-90')} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

// ── Composable sub-parts ──

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-content" className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2 no-scrollbar', className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-group" className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />;
}

export function SidebarGroupLabel({ className, children, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-group-label" className={cn(
    'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-[opacity,margin] duration-200',
    'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0', className)} {...props}>{children ?? null}</div>;
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="sidebar-menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="sidebar-menu-item" className={cn('group/menu-item relative', className)} {...props} />;
}

export function SidebarMenuButton({
  isActive = false, collapsed, tooltip, href, onClick, disabled, className, children, dir, linkComponent, size = 'default',
}: {
  isActive?: boolean; collapsed: boolean; tooltip?: string; href?: string; onClick?: () => void; disabled?: boolean;
  className?: string; children: React.ReactNode; dir?: 'ltr' | 'rtl'; linkComponent?: React.ComponentType<any>;
  size?: 'sm' | 'default' | 'lg';
}) {
  const sizeStyles = { sm: 'h-7 text-xs', default: 'h-8 text-sm', lg: 'h-10 text-sm' };
  const Link: React.ComponentType<any> = (linkComponent as any) ?? ((p: any) => <a {...p} />);
  const content = (
    <Link href={href ?? '#'} onClick={onClick} aria-disabled={disabled} data-size={size} data-active={isActive}
      className={cn('peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        sizeStyles[size], isActive && 'bg-accent font-medium text-accent-foreground', collapsed && 'justify-center px-0', className)}>
      {children}
    </Link>
  );
  if (collapsed && tooltip) {
    return <Tooltip><TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side={dir === 'rtl' ? 'left' : 'right'} align="center" className="font-medium">{tooltip}</TooltipContent></Tooltip>;
  }
  return content;
}

export function SidebarMenuBadge({ className, children, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="sidebar-menu-badge" className={cn('ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground', className)} {...props}>{children}</span>;
}

export function SidebarMenuAction({ className, children, showOnHover = true, ...props }: React.ComponentProps<'button'> & { showOnHover?: boolean }) {
  return <button data-slot="sidebar-menu-action" className={cn(
    'absolute end-1 top-1 flex aspect-square size-7 items-center justify-center rounded-md p-0 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
    showOnHover && 'opacity-0 group-hover/menu-item:opacity-100',
    'peer-data-[size=sm]/menu-button:top-0.5 peer-data-[size=sm]/menu-button:size-6',
    'peer-data-[size=lg]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:size-8', className)} {...props}>{children}</button>;
}

export function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="sidebar-menu-sub" className={cn('mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s border-border ps-2.5 py-0.5', className)} {...props} />;
}

export function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="sidebar-menu-sub-item" className={cn('group/menu-sub-item relative', className)} {...props} />;
}

export function SidebarMenuSubButton({ isActive = false, href, onClick, className, children }: {
  isActive?: boolean; href?: string; onClick?: () => void; className?: string; children: React.ReactNode;
}) {
  return <a data-slot="sidebar-menu-sub-button" data-active={isActive} href={href ?? '#'} onClick={onClick}
    className={cn('flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground', className)}>{children}</a>;
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

export function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="sidebar-separator" className={cn('mx-2 w-auto bg-border', className)} {...props} />;
}

export function SidebarTrigger({ className, onClick, asChild = false }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();
  const btn = (
    <Button variant="ghost" size="icon" className={cn('size-7', className)}
      onClick={(e) => { onClick?.(e); toggleSidebar(); }} aria-label="Toggle sidebar">
      <PanelLeftIcon className="size-4" /><span className="sr-only">Toggle sidebar</span>
    </Button>
  );
  return asChild ? <span className="inline-flex">{btn}</span> : btn;
}

export function SidebarRail({ className }: { className?: string }) {
  const { toggleSidebar, dir, state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [peeking, setPeeking] = React.useState(false);
  return (
    <button data-slot="sidebar-rail" aria-label="Toggle sidebar" tabIndex={-1} onClick={toggleSidebar}
      onMouseEnter={() => isCollapsed && setPeeking(true)} onMouseLeave={() => setPeeking(false)}
      title="Toggle sidebar" className={cn(
        'absolute inset-y-0 z-20 w-4 -translate-x-1/2 cursor-col-resize transition-all ease-linear hover:bg-accent/40',
        dir === 'rtl' ? 'left-0' : 'right-0', 'rtl:translate-x-1/2', isCollapsed && '-end-2 w-6', className)}>
      {isCollapsed && <div className={cn('absolute inset-y-0 w-1 transition-colors duration-200',
        dir === 'rtl' ? 'right-0' : 'left-0', peeking ? 'bg-accent/60' : 'bg-transparent')} />}
    </button>
  );
}

export function SidebarInset({ children, className, topbar, footer, dir }: SidebarInsetProps) {
  const { dir: ctxDir } = useSidebar();
  const effDir = dir ?? ctxDir;
  return (
    <main dir={effDir} data-slot="sidebar-inset" className={cn('relative flex min-h-svh w-full min-w-0 flex-1 flex-col overflow-auto bg-background', className)}>
      {topbar}<div className="flex flex-1 flex-col">{children}</div>{footer}
    </main>
  );
}

export type { SidebarProps, SidebarProviderProps, SidebarTriggerProps, SidebarInsetProps } from './types';
