'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total pages */
  total?: number;
  /** Total pages alias */
  totalPages?: number;
  /** Total items count */
  totalItems?: number;
  /** Items per page */
  pageSize?: number;
  /** Page change callback */
  onPageChange: (page: number) => void;
  /** Page size change callback */
  onPageSizeChange?: (size: number) => void;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Show page info text */
  showInfo?: boolean;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Custom info text formatter */
  formatInfo?: (start: number, end: number, total: number) => string;
  /** Max visible page buttons */
  maxVisible?: number;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

function getPageNumbers(current: number, total: number, maxVisible = 5): (number | 'ellipsis')[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, current + half);

  if (current - half <= 2) {
    end = Math.min(total - 1, maxVisible);
  }
  if (current + half >= total - 1) {
    start = Math.max(2, total - maxVisible + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  if (total > 1) pages.push(total);

  return pages;
}

export function Pagination({
  page,
  total,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showInfo = true,
  showPageSize = true,
  formatInfo,
  maxVisible = 5,
  dir = 'ltr',
  className,
}: PaginationProps) {
  const pageCount = totalPages ?? total ?? 1;
  if (pageCount <= 1 && (!showPageSize || !onPageSizeChange)) return null;

  const ChevronIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ChevronIconAlt = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const pages = getPageNumbers(page, pageCount, maxVisible);

  const start = totalItems ? (page - 1) * (pageSize || 0) + 1 : 0;
  const end = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : 0;
  const infoText = formatInfo
    ? formatInfo(start, end, totalItems || 0)
    : totalItems
      ? `Showing ${start}–${end} of ${totalItems}`
      : `Page ${page} of ${pageCount}`;

  return (
    <div dir={dir} className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      {showInfo && (
        <p className="text-sm text-muted-foreground">{infoText}</p>
      )}
      <div className="flex items-center gap-4">
        {showPageSize && onPageSizeChange && pageSize && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {pageCount > 1 && (
          <nav className="flex items-center gap-0.5" aria-label="Pagination">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label={dir === 'rtl' ? 'Next page' : 'Previous page'}
            >
              <ChevronIcon className="size-4" />
            </Button>
            {pages.map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e-${i}`} className="flex size-8 items-center justify-center text-muted-foreground">
                  <MoreHorizontal className="size-3.5" />
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'ghost'}
                  size="icon"
                  className="size-8 text-xs"
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
              aria-label={dir === 'rtl' ? 'Previous page' : 'Next page'}
            >
              <ChevronIconAlt className="size-4" />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
