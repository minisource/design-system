import * as React from 'react';
import { Button, cn } from '@minisource/ui';

export interface AuthFooterProps {
  text: string;
  linkText: string;
  onLinkClick?: () => void;
  linkHref?: string;
  className?: string;
}

export function AuthFooter({ text, linkText, onLinkClick, linkHref, className }: AuthFooterProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {text}{' '}
      {linkHref ? (
        <a href={linkHref} className="font-medium text-primary hover:underline">
          {linkText}
        </a>
      ) : (
        <button
          type="button"
          onClick={onLinkClick}
          className="font-medium text-primary hover:underline"
        >
          {linkText}
        </button>
      )}
    </p>
  );
}
