/**
 * Theme Provider Tests
 * Smart Inter-Wilaya Taxi v2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme, ThemeToggle } from '@/lib/theme-provider';

// Test component to access theme context
function TestComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('should provide default theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('should toggle theme', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText('Toggle');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme').textContent).toBe('dark');
    });
  });

  it('should set specific theme', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setDarkButton = screen.getByText('Set Dark');
    fireEvent.click(setDarkButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });
  });

  it('should throw error when useTheme is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleError.mockRestore();
  });
});

describe('ThemeToggle', () => {
  it('should render toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('should toggle theme on click', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    const initialTheme = screen.getByTestId('resolved-theme').textContent;

    fireEvent.click(toggleButton);

    await waitFor(() => {
      const newTheme = screen.getByTestId('resolved-theme').textContent;
      expect(newTheme).not.toBe(initialTheme);
    });
  });

  it('should render with different sizes', () => {
    const { rerender } = render(
      <ThemeProvider>
        <ThemeToggle size="sm" />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <ThemeToggle size="lg" />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
