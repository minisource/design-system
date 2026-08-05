import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description (or message) */
  description?: string;
  /** Error message alias for description */
  message?: string;
  /** Retry action */
  onRetry?: () => void;
  /** Auto-retry countdown in seconds (0 = disabled) */
  autoRetrySeconds?: number;
  /** Custom icon */
  icon?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  message,
  onRetry,
  autoRetrySeconds = 0,
  icon,
  className,
}: ErrorStateProps) {
  const textMessage = message || description || 'An error occurred while loading data. Please try again.';
  const [countdown, setCountdown] = React.useState(autoRetrySeconds);
  const hasAutoRetried = React.useRef(false);

  React.useEffect(() => {
    if (autoRetrySeconds <= 0 || !onRetry || hasAutoRetried.current) return;
    if (countdown <= 0) {
      hasAutoRetried.current = true;
      onRetry();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, autoRetrySeconds, onRetry]);

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 text-destructive">
        {icon || <AlertCircle className="h-12 w-12 text-destructive/80" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {textMessage && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{textMessage}</p>
      )}
      {onRetry && (
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            onClick={onRetry}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="me-1.5 h-4 w-4" />
            Try Again
          </Button>
          {autoRetrySeconds > 0 && countdown > 0 && (
            <span className="text-xs text-muted-foreground">
              Auto-retry in {countdown}s
            </span>
          )}
        </div>
      )}
    </div>
  );
}