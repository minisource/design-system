'use client';

import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export interface ServerTimeProps {
  /** Initial server time ISO string (optional - if not provided, uses client time) */
  serverTime?: string;
  /** Timezone string (e.g. "Asia/Tehran") */
  timezone?: string;
  /** Show timezone label */
  showTimezone?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Displays a live-updating clock.
 * If serverTime is provided, syncs to server time with client-side ticking.
 * Inspired by Dokploy's TimeBadge.
 */
export function ServerTime({
  serverTime,
  timezone,
  showTimezone = true,
  className,
}: ServerTimeProps) {
  const [time, setTime] = useState<Date>(
    serverTime ? new Date(serverTime) : new Date(),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeStyle: 'medium',
    hour12: false,
  }).format(time);

  const getUtcOffset = (tz: string) => {
    try {
      const date = new Date();
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
      const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
      const sign = offset >= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offset));
      const minutes = (Math.abs(offset) * 60) % 60;
      return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch {
      return null;
    }
  };

  const offset = timezone ? getUtcOffset(timezone) : null;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border p-1 text-xs whitespace-nowrap max-w-full overflow-hidden gap-1',
        className,
      )}
    >
      <div className="inline-flex items-center px-1 gap-1">
        <span className="hidden sm:inline text-muted-foreground">Server Time:</span>
        <span className="font-medium tabular-nums">{formattedTime}</span>
      </div>
      {showTimezone && (timezone || offset) && (
        <span className="hidden sm:inline text-primary/70 border rounded-full bg-foreground/5 px-1.5 py-0.5">
          {timezone || offset}
          {timezone && offset ? ` | ${offset}` : ''}
        </span>
      )}
    </div>
  );
}
