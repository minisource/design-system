import * as React from 'react';
import { cn } from '../lib/utils';

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  cols?: 1 | 2 | 3 | 4;
}

export function DescriptionList({
  cols = 2,
  className,
  children,
  ...props
}: DescriptionListProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4 text-sm',
        colClasses[cols],
        className
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

export interface KeyValueItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  vertical?: boolean;
}

export function KeyValueItem({
  label,
  value,
  vertical = false,
  className,
  ...props
}: KeyValueItemProps) {
  return (
    <div
      className={cn(
        vertical
          ? 'flex flex-col gap-1'
          : 'flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b pb-2 sm:border-0 sm:pb-0',
        className
      )}
      {...props}
    >
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground break-all">{value ?? '—'}</dd>
    </div>
  );
}
