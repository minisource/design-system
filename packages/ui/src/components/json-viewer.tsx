import * as React from 'react';
import { CopyableValue } from './copyable-value';
import { cn } from '../lib/utils';

export interface JsonViewerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  data: any;
  title?: string;
  maxHeight?: string;
}

export function JsonViewer({
  data,
  title,
  maxHeight = 'max-h-96',
  className,
  ...props
}: JsonViewerProps) {
  const jsonString = React.useMemo(() => {
    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  }, [data]);

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-slate-950 p-4 text-slate-50 dark:bg-slate-900',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <span className="text-xs font-mono text-slate-400">
          {title || 'JSON Payload'}
        </span>
        <CopyableValue value={jsonString} codeStyle={false} className="text-slate-400 hover:text-white" />
      </div>

      <pre
        className={cn(
          'overflow-auto font-mono text-xs leading-relaxed text-slate-200',
          maxHeight
        )}
      >
        <code>{jsonString}</code>
      </pre>
    </div>
  );
}
