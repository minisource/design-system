import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthCard } from '../components/auth-card';
import { AuthFooter } from '../components/auth-footer';
import { AuthSuccess } from '../components/auth-success';

describe('AuthCard', () => {
  it('renders with title and description', () => {
    render(
      <AuthCard title="Sign In" description="Welcome back">
        <div>form content</div>
      </AuthCard>
    );
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });
});

describe('AuthFooter', () => {
  it('renders text and link', () => {
    render(<AuthFooter text="Don't have an account?" linkText="Sign up" linkHref="/register" />);
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });
});

describe('AuthSuccess', () => {
  it('renders with title', () => {
    render(<AuthSuccess title="Check your email" />);
    expect(screen.getByText('Check your email')).toBeInTheDocument();
  });
});