import * as React from 'react';
import { cn } from '@minisource/ui';

export interface FooterProps {
  children?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function Footer({ children, dir = 'ltr', className }: FooterProps) {
  return (
    <footer
      dir={dir}
      className={cn(
        'border-t bg-card px-4 py-3 text-center text-xs text-muted-foreground',
        className
      )}
    >
      {children}
    </footer>
  );
}