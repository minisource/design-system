import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Lock, Shield, ArrowLeft } from 'lucide-react';

export interface AccessDeniedProps {
  /** Required permission strings */
  requiredPermissions?: string[];
  /** Active tenant name if applicable */
  tenantName?: string;
  /** Go back or dashboard action */
  onGoBack?: () => void;
  /** Custom dashboard link action */
  dashboardAction?: React.ReactNode;
  className?: string;
}

export function AccessDenied({
  requiredPermissions = [],
  tenantName,
  onGoBack,
  dashboardAction,
  className,
}: AccessDeniedProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center min-h-[380px]', className)}>
      <div className="mb-4 rounded-full bg-purple-500/10 p-4 border border-purple-500/20 text-purple-600 dark:text-purple-400">
        <Lock className="h-10 w-10" />
      </div>

      <h3 className="text-xl font-bold tracking-tight">Access Restricted (403)</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        You do not have the required security permissions to access this feature or perform this administration action.
      </p>

      {tenantName && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Active Context: {tenantName}</span>
        </div>
      )}

      {requiredPermissions.length > 0 && (
        <div className="mt-4 rounded-md border bg-muted/30 p-3 text-xs text-left max-w-md w-full">
          <span className="font-semibold text-muted-foreground">Required Permissions:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {requiredPermissions.map((perm) => (
              <span key={perm} className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground border">
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        )}
        {dashboardAction}
      </div>
    </div>
  );
}
