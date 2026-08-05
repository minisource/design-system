import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '../app-shell';
import { Sidebar, SidebarProvider } from '../sidebar';
import { Topbar } from '../topbar';
import { Footer } from '../footer';
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockItems = [
  { id: 'home', label: 'Home', href: '/home' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'group', label: 'Group', href: '#', children: [
    { id: 'child1', label: 'Child 1', href: '/child1' },
    { id: 'child2', label: 'Child 2', href: '/child2' },
  ]},
];

describe('AppShell', () => {
  it('renders sidebar, topbar and children', () => {
    render(
      <AppShell
        sidebar={<div>Sidebar Content</div>}
        topbar={<div>Topbar Content</div>}
      >
        <div>Page Content</div>
      </AppShell>
    );
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    expect(screen.getByText('Topbar Content')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <AppShell
        sidebar={<div>Sidebar</div>}
        topbar={<div>Topbar</div>}
        footer={<div>Footer Content</div>}
      >
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
});

import { UserMenu } from '../user-menu';

describe('Sidebar', () => {
  it('renders nav items', () => {
    render(
      <SidebarProvider>
        <Sidebar items={mockItems} />
      </SidebarProvider>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getAllByText('Group')[0]).toBeInTheDocument();
  });

  it('renders as collapsed', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar items={mockItems} />
      </SidebarProvider>
    );
    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  });
});

describe('Topbar', () => {
  it('renders title', () => {
    render(<Topbar title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders right content', () => {
    render(<Topbar right={<button>Settings</button>} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('renders children', () => {
    render(<Footer>© 2025 MiniSource</Footer>);
    expect(screen.getByText('© 2025 MiniSource')).toBeInTheDocument();
  });
});

describe('UserMenu', () => {
  it('renders user name', () => {
    render(<UserMenu name="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders initials fallback', () => {
    render(<UserMenu initials="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
