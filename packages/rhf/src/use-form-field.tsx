'use client';

import * as React from 'react';

/**
 * Context for a single form field — carries name, ID, error state, and description.
 */
export interface FormFieldContextValue {
  name: string;
  id: string;
  error?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function FormFieldProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FormFieldContextValue;
}) {
  return (
    <FormFieldContext.Provider value={value}>
      {children}
    </FormFieldContext.Provider>
  );
}

/**
 * Hook to access the nearest FormField context.
 * Returns null if outside a FormFieldProvider.
 */
export function useFormField() {
  return React.useContext(FormFieldContext);
}
