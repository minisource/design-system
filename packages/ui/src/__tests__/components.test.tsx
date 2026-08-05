import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Alert, AlertTitle, AlertDescription } from '../components/alert';
import { LoadingState } from '../components/loading-state';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { MetricCard } from '../components/metric-card';
import { Pagination } from '../components/pagination';
import { SearchInput } from '../components/search-input';
import { ConfirmDialog } from '../components/confirm-dialog';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('renders card with title', () => {
    render(
      <Card>
        <CardHeader><CardTitle>Test Title</CardTitle></CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});

describe('Alert', () => {
  it('renders with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

describe('LoadingState', () => {
  it('renders with custom message', () => {
    render(<LoadingState message="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items" description="Create your first item" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders default title', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
  it('renders retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    screen.getByText('Try Again').click();
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Users" value={1234} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('renders when total > 1', () => {
    render(<Pagination page={1} total={5} onPageChange={vi.fn()} />);
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });
  it('does not render when total <= 1', () => {
    const { container } = render(<Pagination page={1} total={1} onPageChange={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput placeholder="Search users" onValueChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search users')).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <ConfirmDialog open={true} onOpenChange={vi.fn()} title="Delete?" onConfirm={vi.fn()} />
    );
    expect(screen.getByText('Delete?')).toBeInTheDocument();
  });
  it('does not render when closed', () => {
    const { container } = render(
      <ConfirmDialog open={false} onOpenChange={vi.fn()} title="Delete?" onConfirm={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });
});