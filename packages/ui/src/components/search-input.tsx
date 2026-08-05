'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  /** Current value */
  value?: string;
  /** Value change callback */
  onValueChange?: (value: string) => void;
  /** Alias for onValueChange */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms (0 = no debounce) */
  debounce?: number;
  /** Direction */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function SearchInput({
  value,
  onValueChange,
  onChange,
  placeholder = 'Search...',
  debounce = 300,
  dir = 'ltr',
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value || '');
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyChange = React.useCallback(
    (val: string) => {
      if (onValueChange) onValueChange(val);
      if (onChange) onChange(val);
    },
    [onValueChange, onChange]
  );

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounce > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => notifyChange(newValue), debounce);
    } else {
      notifyChange(newValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    notifyChange('');
  };

  return (
    <div dir={dir} className={cn('relative', className)}>
      <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border bg-background ps-9 pe-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}