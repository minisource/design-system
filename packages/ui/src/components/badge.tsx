import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border-border text-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground',
        // Status colors
        red: 'bg-red-600/20 text-red-600 dark:bg-red-500/15 dark:text-red-500',
        yellow: 'bg-yellow-600/20 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-500',
        orange: 'bg-orange-600/20 text-orange-600 dark:bg-orange-500/15 dark:text-orange-500',
        green: 'bg-emerald-600/20 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-500',
        blue: 'bg-blue-600/20 text-blue-600 dark:bg-blue-500/15 dark:text-blue-500',
        blank: 'bg-black/15 text-foreground dark:bg-white/15',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
