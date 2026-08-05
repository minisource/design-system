// @minisource/tokens - Semantic token values for programmatic use
// CSS custom properties are in tokens.css; this file provides JS-accessible values.

export const tokens = {
  color: {
    background: 'hsl(var(--ms-background))',
    foreground: 'hsl(var(--ms-foreground))',
    card: {
      DEFAULT: 'hsl(var(--ms-card))',
      foreground: 'hsl(var(--ms-card-foreground))',
    },
    popover: {
      DEFAULT: 'hsl(var(--ms-popover))',
      foreground: 'hsl(var(--ms-popover-foreground))',
    },
    primary: {
      DEFAULT: 'hsl(var(--ms-primary))',
      foreground: 'hsl(var(--ms-primary-foreground))',
    },
    secondary: {
      DEFAULT: 'hsl(var(--ms-secondary))',
      foreground: 'hsl(var(--ms-secondary-foreground))',
    },
    muted: {
      DEFAULT: 'hsl(var(--ms-muted))',
      foreground: 'hsl(var(--ms-muted-foreground))',
    },
    accent: {
      DEFAULT: 'hsl(var(--ms-accent))',
      foreground: 'hsl(var(--ms-accent-foreground))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--ms-destructive))',
      foreground: 'hsl(var(--ms-destructive-foreground))',
    },
    success: {
      DEFAULT: 'hsl(var(--ms-success))',
      foreground: 'hsl(var(--ms-success-foreground))',
    },
    warning: {
      DEFAULT: 'hsl(var(--ms-warning))',
      foreground: 'hsl(var(--ms-warning-foreground))',
    },
    info: {
      DEFAULT: 'hsl(var(--ms-info))',
      foreground: 'hsl(var(--ms-info-foreground))',
    },
    border: 'hsl(var(--ms-border))',
    input: 'hsl(var(--ms-input))',
    ring: 'hsl(var(--ms-ring))',
  },
  radius: {
    DEFAULT: 'var(--ms-radius)',
  },
  shadow: {
    sm: 'var(--ms-shadow-sm)',
    DEFAULT: 'var(--ms-shadow)',
    md: 'var(--ms-shadow-md)',
    lg: 'var(--ms-shadow-lg)',
  },
  font: {
    sans: 'var(--ms-font-sans)',
    mono: 'var(--ms-font-mono)',
  },
} as const;

export type Tokens = typeof tokens;
