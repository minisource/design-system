import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import {
  WifiOff,
  ServerOff,
  Clock,
  ShieldAlert,
  Lock,
  FileQuestion,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type PageErrorVariant =
  | 'network'
  | 'offline'
  | 'timeout'
  | 'service-unavailable'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'rate-limited'
  | 'tenant-unavailable'
  | 'unknown';

export interface PageErrorStateProps {
  /** Error variant for styling & icons */
  variant?: PageErrorVariant;
  /** Primary title */
  title?: string;
  /** Detailed user message */
  description?: string;
  /** Request ID for support tracing */
  requestId?: string;
  /** HTTP status code */
  status?: number;
  /** Manual retry callback */
  onRetry?: () => void;
  /** Custom action button */
  action?: React.ReactNode;
  /** Custom technical details */
  technicalDetails?: string;
  className?: string;
}

export function PageErrorState({
  variant = 'service-unavailable',
  title,
  description,
  requestId,
  status,
  onRetry,
  action,
  technicalDetails,
  className,
}: PageErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const getVariantConfig = () => {
    switch (variant) {
      case 'offline':
        return {
          icon: <WifiOff className="h-12 w-12 text-amber-500" />,
          title: title || 'Browser Offline',
          description: description || 'Your internet connection appears to be offline. Please check your network.',
        };
      case 'network':
      case 'service-unavailable':
        return {
          icon: <ServerOff className="h-12 w-12 text-destructive" />,
          title: title || 'Backend Service Unavailable',
          description:
            description ||
            'We could not connect to the Auth API service. Your login session is safe and has not been cleared.',
        };
      case 'timeout':
        return {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: title || 'Request Timed Out',
          description: description || 'The server took too long to respond. Please try again.',
        };
      case 'forbidden':
        return {
          icon: <Lock className="h-12 w-12 text-purple-500" />,
          title: title || 'Access Denied (403)',
          description: description || 'You do not have the required permissions to access this page or resource.',
        };
      case 'unauthorized':
        return {
          icon: <ShieldAlert className="h-12 w-12 text-amber-500" />,
          title: title || 'Session Expired (401)',
          description: description || 'Your session authentication credentials have expired. Please log in again.',
        };
      case 'not-found':
        return {
          icon: <FileQuestion className="h-12 w-12 text-muted-foreground" />,
          title: title || 'Resource Not Found (404)',
          description: description || 'The requested resource or page could not be located.',
        };
      case 'rate-limited':
        return {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: title || 'Rate Limit Exceeded',
          description: description || 'Too many requests were sent in a short time. Please wait a moment and try again.',
        };
      case 'unknown':
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
          title: title || 'An Unexpected Error Occurred',
          description: description || 'An error occurred while processing your request.',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center min-h-[320px]', className)}>
      <div className="mb-4 rounded-full bg-muted/50 p-4 border">{config.icon}</div>
      <h3 className="text-xl font-bold tracking-tight">{config.title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">{config.description}</p>

      {/* Primary Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}
        {action}
      </div>

      {/* Safe Technical Details Disclosure */}
      {(requestId || status || technicalDetails) && (
        <div className="mt-6 w-full max-w-md">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center gap-1 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{showDetails ? 'Hide technical details' : 'View technical details'}</span>
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showDetails && (
            <div className="mt-3 rounded-md border bg-muted/40 p-3 text-left font-mono text-[11px] space-y-1 text-muted-foreground">
              {status && <div>Status Code: {status}</div>}
              {requestId && <div>Reference ID: {requestId}</div>}
              {technicalDetails && <div className="truncate">Detail: {technicalDetails}</div>}
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
