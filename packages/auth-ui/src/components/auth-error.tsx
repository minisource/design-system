import * as React from 'react';
import { Alert, AlertTitle, AlertDescription, cn } from '@minisource/ui';

export interface AuthErrorProps {
  title?: string;
  message: string;
  className?: string;
}

export function AuthError({ title = 'Error', message, className }: AuthErrorProps) {
  return (
    <Alert variant="destructive" className={cn('mb-4', className)}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
