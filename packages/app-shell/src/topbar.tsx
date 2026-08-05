'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Button, cn } from '@minisource/ui';

export interface TopbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
  showMobileToggle?: boolean;
  onToggleMobileSidebar?: () => void;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function Topbar({
  left,
  right,
  title,
  showMobileToggle,
  onToggleMobileSidebar,
  dir = 'ltr',
  className,
}: TopbarProps) {
  return (
    <header
      dir={dir}
      className={cn(
        'sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-sm px-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showMobileToggle && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleMobileSidebar}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="size-4" />
          </Button>
        )}
        {left}
        {title && <h1 className="text-base font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
