'use client';

import * as React from 'react';

// Theme types
type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

// Storage key
const THEME_KEY = 'smart-taxi-theme';

// Hook to use theme
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Get system preference
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Get stored theme
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'system';
}

// Theme Provider Props
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
}

// Theme Provider Component
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_KEY,
  enableSystem = true,
  enableColorScheme = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>('light');
  const [mounted, setMounted] = React.useState(false);

  // Update resolved theme based on theme setting
  const updateResolvedTheme = React.useCallback((newTheme: Theme) => {
    let resolved: ResolvedTheme;
    
    if (newTheme === 'system' && enableSystem) {
      resolved = getSystemTheme();
    } else {
      resolved = newTheme === 'dark' ? 'dark' : 'light';
    }
    
    setResolvedTheme(resolved);
    
    // Update DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    
    // Update color-scheme
    if (enableColorScheme) {
      root.style.colorScheme = resolved;
    }
  }, [enableSystem, enableColorScheme]);

  // Set theme
  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // localStorage not available
    }
    
    updateResolvedTheme(newTheme);
  }, [storageKey, updateResolvedTheme]);

  // Toggle theme
  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  // Initialize on mount
  React.useEffect(() => {
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
    updateResolvedTheme(storedTheme);
    setMounted(true);
  }, [updateResolvedTheme]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem, updateResolvedTheme]);

  // Prevent flash on load
  React.useEffect(() => {
    // Add script to head for immediate theme application
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        try {
          var theme = localStorage.getItem('${storageKey}') || 'system';
          var resolved = theme;
          if (theme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          document.documentElement.classList.add(resolved);
          document.documentElement.style.colorScheme = resolved;
        } catch (e) {}
      })();
    `;
    document.head.insertBefore(script, document.head.firstChild);
    
    return () => {
      script.remove();
    };
  }, [storageKey]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme Toggle Button Component
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className, 
  size = 'md',
  showLabel = false 
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        'bg-surface hover:bg-surface-hover',
        'border border-border-subtle',
        'text-text-secondary hover:text-text',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'dark:focus:ring-offset-dark',
        sizeClasses[size],
        className
      )}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className={iconSize[size]} />
      ) : (
        <MoonIcon className={iconSize[size]} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}

// Icons
function SunIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// Utility function for class names
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Higher-order component for theme-aware components
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ThemeAwareComponent(props: P) {
    const { resolvedTheme } = useTheme();
    return <Component {...props} data-theme={resolvedTheme} />;
  };
}
