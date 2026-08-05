'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export interface ConfirmDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Close callback */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm callback */
  onConfirm: () => void;
  /** Loading state during confirm action */
  isConfirming?: boolean;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Show warning icon */
  showIcon?: boolean;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isConfirming,
  destructive = false,
  showIcon = true,
  dir = 'ltr',
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)} showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            {showIcon && destructive && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isConfirming}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
