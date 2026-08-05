'use client';

import * as React from 'react';
import { ChevronsUpDown, LogOut, UserCircle } from 'lucide-react';
import { cn, Avatar, AvatarFallback, AvatarImage } from '@minisource/ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@minisource/ui';

export interface UserMenuItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  separator?: boolean;
}

export interface UserMenuProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
  items?: UserMenuItem[];
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  initials,
  items = [],
  dir = 'ltr',
  className,
}: UserMenuProps) {
  return (
    <DropdownMenu dir={dir}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
            className
          )}
        >
          <Avatar size="sm">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name || ''} />}
            <AvatarFallback>{initials || '?'}</AvatarFallback>
          </Avatar>
          <div className="hidden text-start md:block">
            <p className="text-sm font-medium leading-none">{name || 'User'}</p>
            {email && <p className="mt-0.5 text-xs text-muted-foreground">{email}</p>}
          </div>
          <ChevronsUpDown className="hidden size-3.5 text-muted-foreground md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {name && (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{name}</span>
                {email && <span className="text-xs text-muted-foreground">{email}</span>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item) => {
          if (item.separator) {
            return <DropdownMenuSeparator key={item.id} />;
          }
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={item.onClick}
              className={cn(item.destructive && 'text-destructive focus:bg-destructive/10 focus:text-destructive')}
            >
              {item.icon && <item.icon className="size-4" />}
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
        {items.length === 0 && (
          <DropdownMenuItem disabled>
            <UserCircle className="size-4" />
            <span>No actions</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
