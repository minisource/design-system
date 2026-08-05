import * as React from 'react';
import { Button, cn } from '@minisource/ui';

export interface AuthSuccessProps {
  /** Success title */
  title: string;
  /** Success description */
  description?: string;
  /** Optional action button */
  actionLabel?: string;
  onAction?: () => void;
  /** Custom icon (defaults to checkmark) */
  icon?: React.ReactNode;
  className?: string;
}

export function AuthSuccess({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: AuthSuccessProps) {
  return (
    <div className={cn('space-y-4 text-center', className)}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
        {icon || (
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="w-full">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

