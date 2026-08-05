import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { AlertTriangle, Info, RefreshCw, ServerOff, X } from 'lucide-react';

export interface ErrorBannerProps {
  /** Title of the banner */
  title: string;
  /** Description message */
  description?: string;
  /** Severity level */
  severity?: 'warning' | 'error' | 'info';
  /** Manual retry action */
  onRetry?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({
  title,
  description,
  severity = 'error',
  onRetry,
  onDismiss,
  className,
}: ErrorBannerProps) {
  const getIcon = () => {
    switch (severity) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'error':
      default:
        return <ServerOff className="h-5 w-5 text-red-500 shrink-0" />;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border p-3.5 text-sm shadow-sm transition-colors',
        severity === 'error' && 'border-red-500/30 bg-red-500/10 text-foreground dark:border-red-900',
        severity === 'warning' && 'border-amber-500/30 bg-amber-500/10 text-foreground dark:border-amber-900',
        severity === 'info' && 'border-blue-500/30 bg-blue-500/10 text-foreground dark:border-blue-900',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <p className="font-semibold leading-tight">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="h-8 text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    </div>
  );
}
