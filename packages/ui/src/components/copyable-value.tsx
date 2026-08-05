import * as React from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from './button';
import { cn } from '../lib/utils';

export interface CopyableValueProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  maskable?: boolean;
  codeStyle?: boolean;
  truncate?: boolean;
}

export function CopyableValue({
  value,
  maskable = false,
  codeStyle = true,
  truncate = false,
  className,
  ...props
}: CopyableValueProps) {
  const [copied, setCopied] = React.useState(false);
  const [showSecret, setShowSecret] = React.useState(!maskable);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const displayValue = maskable && !showSecret ? '••••••••••••••••' : value;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 max-w-full',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          codeStyle
            ? 'rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground'
            : 'text-sm text-foreground',
          truncate && 'truncate'
        )}
      >
        {displayValue}
      </span>

      {maskable && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => setShowSecret(!showSecret)}
          title={showSecret ? 'Hide value' : 'Show value'}
        >
          {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
