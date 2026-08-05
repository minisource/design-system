'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './button';

export interface ModeToggleProps {
  /** Current theme value */
  theme?: string;
  /** Callback to set theme */
  onToggle?: (theme: string) => void;
  /** Show label text (default: icon only) */
  showLabel?: boolean;
  className?: string;
}

/**
 * Dark/Light mode toggle button.
 * Inspired by Dokploy's ModeToggle with sun/moon rotation animation.
 */
export function ModeToggle({ theme: propTheme, onToggle, showLabel, className }: ModeToggleProps) {
  const nextThemes = useTheme();
  const currentTheme = propTheme || nextThemes.theme;
  const isDark = currentTheme === 'dark';

  const handleToggle = () => {
    if (onToggle) {
      onToggle(isDark ? 'light' : 'dark');
    } else {
      nextThemes.setTheme(isDark ? 'light' : 'dark');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={className}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {showLabel && (
        <span className="sr-only">{isDark ? 'Light mode' : 'Dark mode'}</span>
      )}
    </Button>
  );
}

