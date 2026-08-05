# @minisource/ui

The core component library for the MiniSource design system.

## Installation

```bash
pnpm add @minisource/ui
```

## Components

### Core
- `Button`, `Input`, `Label`, `Textarea`

### Layout
- `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`
- `Separator`, `Table`

### Feedback
- `Alert`, `Badge`, `Skeleton`

### Navigation
- `Tabs`, `DropdownMenu`

### Overlay
- `Dialog`, `AlertDialog`

### Form
- `Avatar`, `Switch`, `Select`

### Data Display
- `LoadingState`, `EmptyState`, `ErrorState`
- `MetricCard`, `DataTable`, `Pagination`
- `FilterBar`, `SearchInput`, `ConfirmDialog`

## Usage

```tsx
import { Button, Card, CardHeader, CardTitle, Badge } from '@minisource/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <Button>Click me</Button>
      <Badge>New</Badge>
    </Card>
  );
}
```

## Styling

Uses Tailwind CSS with CSS variables for theming. Import `@minisource/ui/styles.css` in your root layout.

## RTL/LTR

All components support `dir="rtl"` for right-to-left layouts.