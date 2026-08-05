# @minisource/tokens

Design tokens for the MiniSource design system — CSS custom properties and Tailwind CSS theme config.

## Installation

```bash
pnpm add @minisource/tokens
```

## Usage

```css
/* Import CSS variables */
@import '@minisource/tokens/styles.css';
```

```js
// Use in Tailwind config
const tokens = require('@minisource/tokens');

module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
    },
  },
};
```

## Tokens Include

- **Colors**: Primary, secondary, accent, destructive, muted, border, background, foreground
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Border radius**: Rounded corners
- **Shadows**: Elevation levels
- **Breakpoints**: Responsive design tokens
- **Transitions**: Animation durations

## Theme Support

Supports light and dark mode via CSS custom properties:

```css
:root {
  --background: 0 0% 100%;
}

.dark {
  --background: 222.2 84% 4.9%;
}
```