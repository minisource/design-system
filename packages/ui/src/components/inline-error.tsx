import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { AlertCircle, AlertTriangle, Info, RefreshCw, XCircle } from 'lucide-react';

export interface InlineErrorProps {
  /** Error title */
  title?: string;
  /** Error description/message */
  description?: string;
  /** Request ID for tracing */
  requestId?: string;
  /** Severity level */
  severity?: 'info' | 'warning' | 'error' | 'critical';
  /** Manual retry callback */
  onRetry?: () => void;
  /** Custom action label */
  retryLabel?: string;
  className?: string;
}

export function InlineError({
  title = 'Failed to load data',
  description,
  requestId,
  severity = 'error',
  onRetry,
  retryLabel = 'Retry',
  className,
}: InlineErrorProps) {
  const getIcon = () => {
    switch (severity) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600 shrink-0 animate-pulse" />;
      case 'error':
      default:
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 text-sm transition-all',
        severity === 'critical' && 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300',
        severity === 'error' && 'border-red-500/20 bg-red-500/5 text-foreground',
        severity === 'warning' && 'border-amber-500/20 bg-amber-500/5 text-foreground',
        severity === 'info' && 'border-blue-500/20 bg-blue-500/5 text-foreground',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div>
          <h5 className="font-semibold leading-tight">{title}</h5>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          {requestId && (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground opacity-75">
              Ref ID: {requestId}
            </p>
          )}
        </div>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{retryLabel}</span>
        </Button>
      )}
    </div>
  );
}
