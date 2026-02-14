'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// ERROR BOUNDARY
// ============================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorFallback 
          error={this.state.error!} 
          onRetry={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorFallback({ error, onRetry, className }: ErrorFallbackProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-8 text-center',
        className
      )}
      role="alert"
    >
      <div className="w-16 h-16 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-destructive" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-foreground mb-2">
        شيء ما went wrong
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium',
            'bg-primary text-primary-foreground',
            'hover:bg-primary-hover',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

// ============================================
// LOADING STATES
// ============================================

// Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  width, 
  height,
  animate = true 
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-muted',
    animate && 'animate-pulse',
    variant === 'circular' && 'rounded-full',
    variant === 'text' && 'rounded',
    variant === 'rectangular' && 'rounded-lg',
    className
  );

  const style: React.CSSProperties = {
    width: width,
    height: height ?? (variant === 'text' ? '1em' : undefined),
  };

  return <div className={baseClasses} style={style} aria-hidden="true" />;
}

// Skeleton Card
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card p-4 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

// Skeleton Table
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={cn('animate-spin text-primary', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Loading Overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinner?: boolean;
  text?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className,
  spinner = true,
  text 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      {isLoading && (
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            {spinner && <Spinner size="lg" />}
            {text && <p className="text-muted-foreground">{text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Page Loading State
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent animate-pulse" />
          <Spinner size="lg" className="absolute inset-0 m-auto" />
        </div>
        <p className="text-muted-foreground animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATES
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      
      {action}
    </div>
  );
}

// ============================================
// UTILITY HOOKS
// ============================================

// Hook for async operations with loading state
export function useAsync<T, E = Error>() {
  const [state, setState] = React.useState<{
    data: T | null;
    error: E | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = React.useCallback(async (asyncFn: () => Promise<T>) => {
    setState({ data: null, error: null, isLoading: true });
    
    try {
      const data = await asyncFn();
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (error) {
      setState({ data: null, error: error as E, isLoading: false });
      throw error;
    }
  }, []);

  return { ...state, execute };
}

// Hook for retry logic
export function useRetry(
  fn: () => Promise<unknown>,
  maxRetries: number = 3,
  delay: number = 1000
) {
  const [retries, setRetries] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(async () => {
    if (retries >= maxRetries) return false;
    
    setIsRetrying(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, delay * (retries + 1)));
      await fn();
      setRetries(0);
      return true;
    } catch {
      setRetries(prev => prev + 1);
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, [fn, maxRetries, delay, retries]);

  return { retry, retries, isRetrying, canRetry: retries < maxRetries };
}
