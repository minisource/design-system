import * as React from 'react';
import { cn } from '../lib/utils';

export interface FilterBarProps {
  /** Children (search input, filter buttons, etc.) */
  children: React.ReactNode;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function FilterBar({ children, dir = 'ltr', className }: FilterBarProps) {
  return (
    <div
      dir={dir}
      className={cn(
        'flex flex-wrap items-center gap-3',
        className
      )}
    >
      {children}
    </div>
  );
}