'use client';

import * as React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

export interface ConfirmActionDialogProps {
  /** The element that triggers the dialog */
  trigger?: React.ReactElement;
  /** Title of the confirmation dialog */
  title: React.ReactNode;
  /** Description of the confirmation dialog */
  description?: React.ReactNode;
  /** Label for the confirm button */
  confirmLabel?: React.ReactNode;
  /** Label for the cancel button */
  cancelLabel?: React.ReactNode;
  /** Tone of the dialog (destructive adds red badge/icon and uses destructive button) */
  tone?: 'default' | 'warning' | 'destructive';
  /** Is the confirm action currently executing (loading state) */
  pending?: boolean;
  /** Is the dialog disabled */
  disabled?: boolean;
  /** Managed open state (optional) */
  open?: boolean;
  /** Managed default open state (optional) */
  defaultOpen?: boolean;
  /** Managed open change callback (optional) */
  onOpenChange?: (open: boolean) => void;
  /** Action executed when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Error to display inside the dialog */
  error?: React.ReactNode;
  /** Custom icon to show next to the title (optional) */
  confirmIcon?: React.ReactNode;
  /** Prevent closing the dialog while pending */
  preventCloseOnPending?: boolean;
  className?: string;
}

export function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  pending = false,
  disabled = false,
  open,
  defaultOpen,
  onOpenChange,
  onConfirm,
  error,
  confirmIcon,
  preventCloseOnPending = true,
  className,
}: ConfirmActionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen || false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (pending && preventCloseOnPending) return;
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent automatic closing from AlertDialogAction
    if (disabled || pending) return;

    try {
      await onConfirm();
      handleOpenChange(false);
    } catch (err) {
      // Rejections should NOT close the dialog
      console.error('ConfirmActionDialog error:', err);
    }
  };

  const showIcon = confirmIcon || tone === 'destructive' || tone === 'warning';

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <AlertDialogTrigger asChild disabled={disabled}>
          {React.cloneElement(trigger as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
              (trigger as React.ReactElement<any>).props.onClick?.(e);
              if (!e.defaultPrevented) {
                handleOpenChange(true);
              }
            },
          })}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className={cn('sm:max-w-md', className)}>
        <AlertDialogHeader>
          <div className="flex items-start gap-3 text-left">
            {showIcon && (
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  tone === 'destructive'
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                    : tone === 'warning'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                )}
              >
                {confirmIcon || <AlertTriangle className="size-5" />}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription>{description}</AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              disabled={pending || disabled}
              onClick={() => handleOpenChange(false)}
            >
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            disabled={pending || disabled}
            onClick={handleConfirm}
          >
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
