'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { LoadingState } from './loading-state';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';

export interface Column<T> {
  /** Column key (maps to data field) */
  key: string;
  /** Column header label */
  header: string;
  /** Custom render function */
  render?: (row: T, index: number) => React.ReactNode;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width (CSS) */
  width?: string;
  /** Hide on small screens */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Row data */
  data: T[];
  /** Unique key extractor for rows */
  getRowId: (row: T, index: number) => string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Row actions (rendered in last column) */
  renderRowActions?: (row: T, index: number) => React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: React.ReactNode;
  /** Toolbar (above table) */
  toolbar?: React.ReactNode;
  /** Footer (below table) */
  footer?: React.ReactNode;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  renderRowActions,
  isLoading,
  error,
  emptyMessage = 'No data available',
  emptyAction,
  toolbar,
  footer,
  dir = 'ltr',
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card', className)}>
        {toolbar && <div className="border-b px-4 py-3">{toolbar}</div>}
        <LoadingState fullPage message="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-lg border bg-card', className)}>
        {toolbar && <div className="border-b px-4 py-3">{toolbar}</div>}
        <ErrorState title="Error" description={error} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-card', className)}>
        {toolbar && <div className="border-b px-4 py-3">{toolbar}</div>}
        <EmptyState title={emptyMessage} action={emptyAction} />
        {footer}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {toolbar && <div className="border-b px-4 py-3">{toolbar}</div>}

      <div className="overflow-x-auto">
        <table dir={dir} className="w-full caption-bottom text-sm">
          <thead className="border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'h-10 px-4 text-start font-medium text-muted-foreground',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-end',
                    col.hideOnMobile && 'hidden md:table-cell'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
              {renderRowActions && (
                <th className="h-10 w-12 px-4 text-end font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={getRowId(row, i)}
                onClick={() => onRowClick?.(row, i)}
                className={cn(
                  'border-b transition-colors hover:bg-muted/50',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-end',
                      col.hideOnMobile && 'hidden md:table-cell'
                    )}
                  >
                    {col.render
                      ? col.render(row, i)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
                {renderRowActions && (
                  <td className="px-4 py-3 text-end">
                    {renderRowActions(row, i)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  );
}