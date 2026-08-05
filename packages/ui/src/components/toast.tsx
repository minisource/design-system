'use client';

import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import {
  CheckCircle2,
  Info,
  Loader2,
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface ToastProps {
  /** Custom Toaster props */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  /** Duration in ms */
  duration?: number;
  /** Whether to show close button */
  closeButton?: boolean;
  /** Whether to show rich colors */
  richColors?: boolean;
  /** Custom class name */
  className?: string;
}

export function Toaster({
  position = 'bottom-right',
  duration = 4000,
  closeButton = true,
  richColors = true,
  className,
}: ToastProps) {
  return (
    <SonnerToaster
      position={position}
      duration={duration}
      closeButton={closeButton}
      richColors={richColors}
      className={cn('toaster group', className)}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        info: <Info className="h-4 w-4 text-blue-500" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        error: <AlertOctagon className="h-4 w-4 text-red-500" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: cn(
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl p-4 gap-3 font-sans text-sm border',
            'data-[type=success]:border-emerald-500/30 data-[type=success]:bg-emerald-500/10 data-[type=success]:text-emerald-950 dark:data-[type=success]:text-emerald-100',
            'data-[type=error]:border-red-500/30 data-[type=error]:bg-red-500/10 data-[type=error]:text-red-950 dark:data-[type=error]:text-red-100',
            'data-[type=warning]:border-amber-500/30 data-[type=warning]:bg-amber-500/10 data-[type=warning]:text-amber-950 dark:data-[type=warning]:text-amber-100',
            'data-[type=info]:border-blue-500/30 data-[type=info]:bg-blue-500/10 data-[type=info]:text-blue-950 dark:data-[type=info]:text-blue-100'
          ),
          title: 'text-sm font-semibold text-current',
          description: 'text-xs text-current opacity-90 mt-0.5',
          actionButton: cn('rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/80'),
          cancelButton: cn('rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80'),
          closeButton: cn(
            'border-0 bg-transparent text-muted-foreground opacity-70 transition-opacity hover:opacity-100',
          ),
        },
      }}
    />
  );
}

/**
 * Programmatic toast API — wraps sonner's toast with MiniSource defaults.
 */
export const toast: {
  default: (message: string, description?: string) => string | number;
  success: (message: string, description?: string) => string | number;
  error: (message: string, description?: string) => string | number;
  warning: (message: string, description?: string) => string | number;
  info: (message: string, description?: string) => string | number;
  action: (message: string, action: { label: string; onClick: () => void }) => string | number;
  loading: (message: string) => string | number;
  dismiss: (id?: string | number) => void;
  dismissAll: () => void;
  promise: typeof sonnerToast.promise;
} = {
  default: (message, description) =>
    sonnerToast(message, description ? { description } : undefined),
  success: (message, description) =>
    sonnerToast.success(message, description ? { description } : undefined),
  error: (message, description) =>
    sonnerToast.error(message, description ? { description } : undefined),
  warning: (message, description) =>
    sonnerToast.warning(message, description ? { description } : undefined),
  info: (message, description) =>
    sonnerToast.info(message, description ? { description } : undefined),
  action: (message, action) =>
    sonnerToast(message, { action }),
  loading: (message) => sonnerToast.loading(message),
  dismiss: (id) => sonnerToast.dismiss(id),
  dismissAll: () => sonnerToast.dismiss(),
  promise: sonnerToast.promise,
};
