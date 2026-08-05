import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export interface EmptyStateProps {
  /** Icon to display (ReactNode or component function) */
  icon?: React.ReactNode | React.ElementType;
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Custom action element */
  action?: React.ReactNode;
  /** Primary action button label */
  actionLabel?: string;
  /** Primary action click handler */
  onAction?: () => void;
  /** Array of action objects */
  actions?: EmptyStateAction[];
  /** Optional tips/suggestions shown below */
  tips?: string[];
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title = 'No data found',
  description = 'There are no items to display.',
  action,
  actionLabel,
  onAction,
  actions = [],
  tips,
  className,
}: EmptyStateProps) {
  const allActions: EmptyStateAction[] = [
    ...(actionLabel && onAction ? [{ label: actionLabel, onClick: onAction, variant: 'outline' as const }] : []),
    ...actions,
  ];

  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in (Icon as object))) {
      const Component = Icon as React.ElementType;
      return <Component className="h-12 w-12 text-muted-foreground/60" />;
    }
    return Icon as React.ReactNode;
  };

  return (
    <div className={cn('relative flex flex-col items-center justify-center py-12 px-6 text-center overflow-hidden', className)}>
      {Icon && (
        <div className="mb-4 text-muted-foreground">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
      {!action && allActions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {allActions.map((act, idx) => (
            <Button
              key={idx}
              onClick={act.onClick}
              variant={act.variant || (idx === 0 ? 'default' : 'outline')}
              size="sm"
            >
              {act.label}
            </Button>
          ))}
        </div>
      )}
      {tips && tips.length > 0 && (
        <div className="mt-6 w-full max-w-sm rounded-lg border border-dashed bg-muted/30 p-4 text-left">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            💡 Suggestions
          </p>
          <ul className="space-y-1.5">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}