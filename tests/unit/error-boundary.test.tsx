/**
 * Error Boundary Tests
 * Smart Inter-Wilaya Taxi v2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, ErrorFallback, Skeleton, Spinner, EmptyState } from '@/components/ui/error-boundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something what went wrong/i)).toBeInTheDocument();
  });

  it('should render custom fallback', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should call onError callback', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });
});

describe('ErrorFallback', () => {
  it('should render error message', () => {
    render(<ErrorFallback error={new Error('Test error')} />);

    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('should render retry button when onRetry provided', () => {
    const onRetry = vi.fn();

    render(<ErrorFallback error={new Error('Test')} onRetry={onRetry} />);

    const retryButton = screen.getByText(/retry/i);
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('Skeleton', () => {
  it('should render skeleton', () => {
    render(<Skeleton />);

    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toBeInTheDocument();
  });

  it('should render circular skeleton', () => {
    render(<Skeleton variant="circular" width={48} height={48} />);

    const skeleton = document.querySelector('.rounded-full');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render text skeleton', () => {
    render(<Skeleton variant="text" />);

    const skeleton = document.querySelector('.rounded');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('should render spinner', () => {
    render(<Spinner />);

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('should render different sizes', () => {
    const { container } = render(<Spinner size="lg" />);

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });
});

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No items found" />);

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <EmptyState
        title="No items"
        description="Try adjusting your search"
      />
    );

    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
  });

  it('should render action button', () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Add item</button>}
      />
    );

    expect(screen.getByText('Add item')).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(
      <EmptyState
        title="No items"
        icon={<span>🔍</span>}
      />
    );

    expect(container.textContent).toContain('🔍');
  });
});
