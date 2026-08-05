import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { cn } from '../lib/utils';

export interface FormSectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

export function FormSectionCard({
  title,
  description,
  footer,
  className,
  children,
  ...props
}: FormSectionCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
      {footer && (
        <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/10 px-6 py-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
