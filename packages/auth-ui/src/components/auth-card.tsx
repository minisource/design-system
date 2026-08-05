import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cn } from '@minisource/ui';

export interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, title, description, footer, className }: AuthCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="justify-center">{footer}</CardFooter>}
    </Card>
  );
}
