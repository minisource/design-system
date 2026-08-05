import * as React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface TrendData {
  value: string;
  positive?: boolean;
  neutral?: boolean;
}

export interface MetricCardProps {
  /** Metric label */
  label?: string;
  /** Metric title alias for label */
  title?: string;
  /** Metric value */
  value: string | number;
  /** Metric description */
  description?: string;
  /** Change indicator (simple) */
  change?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  /** Trend indicator (string value + status) */
  trend?: TrendData;
  /** Icon (ReactNode or ElementType) */
  icon?: React.ReactNode | React.ElementType;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Progress percentage (0-100) */
  progress?: number;
  /** Top border accent line */
  accentBar?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    border: 'border-border/70',
    accent: 'bg-primary',
    iconBg: 'bg-primary/10 text-primary',
  },
  success: {
    border: 'border-emerald-500/30 dark:border-emerald-500/20',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    border: 'border-amber-500/30 dark:border-amber-500/20',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  danger: {
    border: 'border-rose-500/30 dark:border-rose-500/20',
    accent: 'bg-rose-500',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  info: {
    border: 'border-blue-500/30 dark:border-blue-500/20',
    accent: 'bg-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
};

export function MetricCard({
  label,
  title,
  value,
  description,
  change,
  trend,
  icon: Icon,
  variant = 'default',
  progress,
  accentBar = false,
  className,
}: MetricCardProps) {
  const displayLabel = title || label || '';
  const styles = variantStyles[variant] || variantStyles.default;

  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in (Icon as object))) {
      const Component = Icon as React.ElementType;
      return <Component className="h-5 w-5" />;
    }
    return Icon as React.ReactNode;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all',
        styles.border,
        className
      )}
    >
      {accentBar && (
        <div className={cn('absolute inset-x-0 top-0 h-1', styles.accent)} />
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{displayLabel}</p>
        {Icon && (
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', styles.iconBg)}>
            {renderIcon()}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span
            className={cn(
              'font-medium',
              change.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
          {change.label && (
            <span className="text-xs text-muted-foreground">{change.label}</span>
          )}
        </div>
      )}
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          {trend.neutral ? (
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          ) : trend.positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          )}
          <span
            className={cn(
              trend.neutral
                ? 'text-muted-foreground'
                : trend.positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full transition-all duration-500', styles.accent)}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}