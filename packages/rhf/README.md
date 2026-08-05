# @minisource/rhf

React Hook Form integration layer for the MiniSource design system.

## Installation

```bash
pnpm add @minisource/rhf react-hook-form
```

## Exports

### Form Components
- `Form` - RHF provider wrapper
- `FormField` - Field wrapper with Label, Description, Error
- `FormInput` - Input with aria-describedby/invalid wiring
- `FormMessage` - Error message display
- `FormLabel` - Label with required indicator
- `FormDescription` - Field description

### Hooks
- `useForm` - Thin wrapper with zodResolver preset
- `useFormContext` - Access RHF context
- `useFormField` - Access current field context

### Error Handling
- `ErrorSummary` - Form-level error summary with field linking
- `flattenZodError` - Zod error → field map
- `normalizeFormError` - Any error → form error state
- `mergeErrors` - Client + server error merge
- `parseBackendError` - API error → display-friendly
- `normalizeBackendError` - Any error shape → NormalizedError
- `mergeClientServerErrors` - Merge client/server

## Usage

```tsx
import { Form, FormField, FormInput, FormMessage, useForm } from '@minisource/rhf';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

function MyForm() {
  const form = useForm({ email: '' }, schema);
  return (
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <FormField name="email" label="Email" required>
        <FormInput type="email" />
        <FormMessage />
      </FormField>
    </Form>
  );
}
```

## Architecture

This package bridges React Hook Form + Zod with the design system. No backend logic — all API/session management stays in the consuming app.