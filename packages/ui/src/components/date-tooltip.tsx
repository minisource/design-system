'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { cn } from '../lib/utils';

export interface DateTooltipProps {
  /** ISO date string or Date object */
  date: string | Date;
  /** Optional custom children (replaces default relative time text) */
  children?: React.ReactNode;
  /** Additional class names for the trigger span */
  className?: string;
  /** Format function for the tooltip content (default: locale date-time) */
  formatDate?: (date: Date) => string;
  /** Format function for relative time display (default: "X ago" / "in X") */
  formatRelative?: (date: Date) => string;
}

/**
 * Displays relative time with an absolute date tooltip on hover.
 * Inspired by Dokploy's DateTooltip.
 *
 * Default behavior shows "2 hours ago" and tooltip shows full date.
 */
export function DateTooltip({
  date,
  children,
  className,
  formatDate,
  formatRelative,
}: DateTooltipProps) {
  const d = typeof date === 'string' ? new Date(date) : date;

  const absolute = formatDate
    ? formatDate(d)
    : new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'medium',
      }).format(d);

  const relative = formatRelative ? formatRelative(d) : getRelativeTime(d);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center text-muted-foreground text-left cursor-default',
              className,
            )}
          >
            {children ?? relative}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {absolute}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Simple relative time formatter.
 * Avoids external date-fns dependency for basic use cases.
 */
function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) {
    const months = Math.floor(days / 30);
    return isFuture ? `in ${months} month${months > 1 ? 's' : ''}` : `${months} month${months > 1 ? 's' : ''} ago`;
  }
  if (days > 0) {
    return isFuture ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return isFuture ? `in ${hours} hour${hours > 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return isFuture ? `in ${minutes} min` : `${minutes} min ago`;
  }
  return isFuture ? 'in a moment' : 'just now';
}
