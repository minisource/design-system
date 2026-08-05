import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from './badge';
import { Button } from './button';
import { RefreshCw } from 'lucide-react';

export type ServiceStatusState = 'operational' | 'degraded' | 'unavailable' | 'unknown';

export interface ServiceStatusProps {
  /** Target service name */
  serviceName?: string;
  /** Current status */
  status: ServiceStatusState;
  /** Last checked timestamp or text */
  lastCheckedAt?: string;
  /** Retry / re-check action */
  onCheckStatus?: () => void;
  /** Checking in-flight state */
  isChecking?: boolean;
  className?: string;
}

export function ServiceStatus({
  serviceName = 'Auth Backend API',
  status,
  lastCheckedAt,
  onCheckStatus,
  isChecking = false,
  className,
}: ServiceStatusProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'operational':
        return {
          variant: 'outline' as const,
          badgeClass: 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
          dotClass: 'bg-emerald-500',
          label: 'Operational',
        };
      case 'degraded':
        return {
          variant: 'outline' as const,
          badgeClass: 'border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400',
          dotClass: 'bg-amber-500',
          label: 'Degraded',
        };
      case 'unavailable':
        return {
          variant: 'outline' as const,
          badgeClass: 'border-red-500/30 text-red-600 bg-red-500/10 dark:text-red-400',
          dotClass: 'bg-red-500 animate-pulse',
          label: 'Backend Unavailable',
        };
      case 'unknown':
      default:
        return {
          variant: 'outline' as const,
          badgeClass: 'border-muted text-muted-foreground bg-muted/40',
          dotClass: 'bg-muted-foreground',
          label: 'Unknown',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-3 bg-card shadow-sm', className)}>
      <div className="flex items-center gap-3">
        <Badge variant={config.variant} className={cn('gap-1.5 text-xs font-semibold px-2.5 py-1', config.badgeClass)}>
          <span className={cn('h-2 w-2 rounded-full', config.dotClass)} />
          <span>{config.label}</span>
        </Badge>
        <div>
          <span className="text-xs font-bold text-foreground">{serviceName}</span>
          {lastCheckedAt && <p className="text-[10px] text-muted-foreground mt-0.5">{lastCheckedAt}</p>}
        </div>
      </div>

      {onCheckStatus && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCheckStatus}
          disabled={isChecking}
          className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isChecking && 'animate-spin')} />
          <span>Check</span>
        </Button>
      )}
    </div>
  );
}
