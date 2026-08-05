'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '../lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: 'sm' | 'default';
  }
>(({ className, size = 'default', ...props }, ref) => (
  <SwitchPrimitives.Root
    data-slot="switch"
    data-size={size}
    className={cn(
      'peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50',
      size === 'default' && 'h-5 w-9',
      size === 'sm' && 'h-[14px] w-[24px]',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      data-slot="switch-thumb"
      className={cn(
        'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
        size === 'default' && 'size-4 data-[state=checked]:translate-x-[calc(100%-2px)]',
        size === 'sm' && 'size-3 data-[state=checked]:translate-x-[calc(100%-2px)]',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
