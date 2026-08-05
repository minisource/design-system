// @minisource/rhf — React Hook Form integration for MiniSource Design System

// Form provider and context
export { Form, useForm, useFormContext, FormProvider, useFieldArray } from './form';
export type { FormProps, UseFormReturn, FieldValues, DefaultValues, SubmitHandler } from './form';

// Field components
export { FormField, FormLabel, FormDescription, FormMessage } from './form-field';
export type { FormFieldProps } from './form-field';

// Input integration
export { FormInput } from './form-input';
export type { FormInputProps } from './form-input';

// Field context hook
export { useFormField, FormFieldProvider } from './use-form-field';
export type { FormFieldContextValue } from './use-form-field';

// Error summary
export { ErrorSummary } from './error-summary';
export type { ErrorSummaryProps } from './error-summary';

// Zod helpers
export { flattenZodError, normalizeFormError, mergeErrors, parseBackendError } from './zod-helpers';
export type { FormErrorState } from './zod-helpers';

// Server error helpers
export { normalizeBackendError, mergeClientServerErrors } from './server-errors';
export type { BackendErrorResponse, NormalizedError } from './server-errors';
