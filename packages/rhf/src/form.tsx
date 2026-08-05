'use client';

import * as React from 'react';
import {
  useForm as useRHF,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  useFormContext as useRHFContext,
  FormProvider as RHFFormProvider,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export { useFieldArray } from 'react-hook-form';
export type { UseFormReturn, FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form';

export function useForm<T extends FieldValues = FieldValues>(
  defaultValues?: DefaultValues<T>,
  schema?: Parameters<typeof zodResolver>[0],
): UseFormReturn<T> {
  return useRHF<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValues as DefaultValues<T>,
  });
}

export function useFormContext<T extends FieldValues = FieldValues>() {
  return useRHFContext<T>();
}

export interface FormProps {
  children: React.ReactNode;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  form: any;
  onSubmit?: (e?: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  noValidate?: boolean;
}

export function Form({
  children,
  form,
  onSubmit,
  className,
  noValidate = true,
}: FormProps) {
  return (
    <RHFFormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={className}
        noValidate={noValidate}
      >
        {children}
      </form>
    </RHFFormProvider>
  );
}

export { RHFFormProvider as FormProvider };