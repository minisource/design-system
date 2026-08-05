import * as React from 'react';
import { cn } from '../lib/utils';

export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Show as full page or inline */
  fullPage?: boolean;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  message,
  fullPage = false,
  size = 'md',
  className,
}: LoadingStateProps) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent text-primary',
          sizeMap[size]
        )}
      />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}