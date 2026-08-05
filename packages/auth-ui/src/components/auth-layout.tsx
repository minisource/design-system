import * as React from 'react';
import { cn } from '@minisource/ui';

export interface AuthLayoutProps {
  children: React.ReactNode;
  /** Controls area (theme toggle, language switcher) */
  controls?: React.ReactNode;
  /** Custom background class */
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export function AuthLayout({ children, controls, className, dir }: AuthLayoutProps) {
  return (
    <div
      dir={dir}
      className={cn(
        'relative flex min-h-svh flex-col items-center justify-center bg-muted/50 px-4 py-8 sm:px-6',
        className
      )}
    >
      {controls && (
        <div className="absolute end-4 top-4 flex items-center gap-2">
          {controls}
        </div>
      )}
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
