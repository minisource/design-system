import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { flattenZodError, normalizeFormError, mergeErrors, parseBackendError } from '../zod-helpers';
import { normalizeBackendError, mergeClientServerErrors } from '../server-errors';
import { ErrorSummary } from '../error-summary';
import { z } from 'zod';

describe('flattenZodError', () => {
  it('flattens simple fields', () => {
    const schema = z.object({ name: z.string().min(1), email: z.string().email() });
    const result = schema.safeParse({ name: '', email: 'bad' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = flattenZodError(result.error);
      expect(flat.name).toBeDefined();
      expect(flat.email).toBeDefined();
    }
  });

  it('uses _form key for root-level errors', () => {
    const schema = z.string();
    const result = schema.safeParse(123);
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = flattenZodError(result.error);
      expect(flat._form).toBeDefined();
    }
  });
});

describe('normalizeFormError', () => {
  it('handles null', () => {
    const result = normalizeFormError(null);
    expect(result.formError).toBeNull();
    expect(result.fieldErrors).toEqual({});
  });

  it('handles string', () => {
    const result = normalizeFormError('Server error');
    expect(result.formError).toBe('Server error');
  });

  it('handles ZodError', () => {
    const schema = z.object({ name: z.string() });
    const r = schema.safeParse({});
    if (!r.success) {
      const result = normalizeFormError(r.error);
      expect(result.fieldErrors.name).toBeDefined();
    }
  });
});

describe('mergeErrors', () => {
  it('server errors override client errors', () => {
    const client = { name: 'required', email: 'invalid' };
    const server = { email: 'already exists' };
    const merged = mergeErrors(client, server);
    expect(merged.name).toBe('required');
    expect(merged.email).toBe('already exists');
  });
});

describe('parseBackendError', () => {
  it('parses standard error response', () => {
    const response = {
      message: 'Validation failed',
      errors: { email: ['Already taken'] },
    };
    const result = parseBackendError(response);
    expect(result.formError).toBe('Validation failed');
    expect(result.fieldErrors.email).toBe('Already taken');
  });

  it('handles unknown input', () => {
    const result = parseBackendError(null);
    expect(result.formError).toBe('An unexpected error occurred');
  });
});

describe('normalizeBackendError', () => {
  it('handles Error objects', () => {
    const result = normalizeBackendError(new Error('Network error'));
    expect(result.formError).toBe('Network error');
  });

  it('handles string errors', () => {
    const result = normalizeBackendError('Something broke');
    expect(result.formError).toBe('Something broke');
  });

  it('marks 5xx as retryable', () => {
    const result = normalizeBackendError({ statusCode: 500, message: 'Server error' });
    expect(result.retryable).toBe(true);
  });

  it('marks 4xx as not retryable', () => {
    const result = normalizeBackendError({ statusCode: 400, message: 'Bad request' });
    expect(result.retryable).toBe(false);
  });
});

describe('mergeClientServerErrors', () => {
  it('server overrides client', () => {
    const result = mergeClientServerErrors(
      { name: 'required' },
      { name: 'taken' }
    );
    expect(result.name).toBe('taken');
  });
});

describe('ErrorSummary', () => {
  it('renders form error', () => {
    render(<ErrorSummary error="Something failed" />);
    expect(screen.getByText('Something failed')).toBeInTheDocument();
  });

  it('renders field errors', () => {
    render(
      <ErrorSummary errors={{ email: 'Required', password: 'Too short' }} />
    );
    expect(screen.getByText(/email/)).toBeInTheDocument();
    expect(screen.getByText(/password/)).toBeInTheDocument();
  });

  it('renders nothing when no errors', () => {
    const { container } = render(<ErrorSummary />);
    expect(container.innerHTML).toBe('');
  });
});
