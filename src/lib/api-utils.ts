/**
 * Backend Development Guidelines - API Utilities
 * 
 * This module provides utilities for building robust API routes following
 * backend development best practices including:
 * - Input validation
 * - Error handling
 * - Rate limiting
 * - Response formatting
 * - Logging
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================
// TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  options?: {
    message?: string;
    pagination?: ApiResponse['pagination'];
    meta?: Record<string, unknown>;
    status?: number;
    headers?: HeadersInit;
  }
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message: options?.message,
    pagination: options?.pagination,
    meta: options?.meta,
  };

  return NextResponse.json(response, {
    status: options?.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      ...options?.headers,
    },
  });
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string | ApiError,
  statusCode: number = 500
): NextResponse<ApiResponse> {
  const apiError: ApiError = typeof error === 'string' 
    ? { code: 'INTERNAL_ERROR', message: error, statusCode }
    : error;

  return NextResponse.json(
    {
      success: false,
      error: apiError.message,
      meta: {
        code: apiError.code,
        details: apiError.details,
      },
    },
    { 
      status: apiError.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  options: {
    total: number;
    limit: number;
    offset: number;
    meta?: Record<string, unknown>;
  }
): NextResponse<ApiResponse<T[]>> {
  const hasMore = options.offset + data.length < options.total;
  
  return successResponse(data, {
    pagination: {
      total: options.total,
      limit: options.limit,
      offset: options.offset,
      hasMore,
    },
    meta: options.meta,
  });
}

// ============================================
// ERROR CLASSES
// ============================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Too many requests',
    public retryAfter: number = 60
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// ============================================
// ERROR HANDLER
// ============================================

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('[API Error]', error);

  if (error instanceof ValidationError) {
    return errorResponse(
      {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
        statusCode: 400,
      },
      400
    );
  }

  if (error instanceof NotFoundError) {
    return errorResponse(
      {
        code: 'NOT_FOUND',
        message: error.message,
        statusCode: 404,
      },
      404
    );
  }

  if (error instanceof UnauthorizedError) {
    return errorResponse(
      {
        code: 'UNAUTHORIZED',
        message: error.message,
        statusCode: 401,
      },
      401
    );
  }

  if (error instanceof ForbiddenError) {
    return errorResponse(
      {
        code: 'FORBIDDEN',
        message: error.message,
        statusCode: 403,
      },
      403
    );
  }

  if (error instanceof ConflictError) {
    return errorResponse(
      {
        code: 'CONFLICT',
        message: error.message,
        statusCode: 409,
      },
      409
    );
  }

  if (error instanceof RateLimitError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        meta: { code: 'RATE_LIMIT', retryAfter: error.retryAfter },
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(error.retryAfter),
        },
      }
    );
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const details: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(err.message);
    });

    return errorResponse(
      {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
        statusCode: 400,
      },
      400
    );
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'Internal server error';
  return errorResponse(
    {
      code: 'INTERNAL_ERROR',
      message,
      statusCode: 500,
    },
    500
  );
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}

// Common validation schemas
export const schemas = {
  id: z.string().cuid().or(z.string().uuid()),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  pagination: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }),
  status: z.enum(['online', 'offline', 'busy']),
  language: z.enum(['ar', 'fr']),
  vehicleType: z.enum(['sedan', 'van', 'suv']),
};

// ============================================
// RATE LIMITING (Simple in-memory)
// ============================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: record.resetAt - now 
    };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetIn: record.resetAt - now 
  };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

// ============================================
// LOGGING
// ============================================

export function logRequest(
  method: string,
  path: string,
  status: number,
  duration: number,
  meta?: Record<string, unknown>
): void {
  const log = {
    timestamp: new Date().toISOString(),
    method,
    path,
    status,
    duration: `${duration}ms`,
    ...meta,
  };
  
  if (status >= 400) {
    console.error('[API]', JSON.stringify(log));
  } else {
    console.log('[API]', JSON.stringify(log));
  }
}

// ============================================
// REQUEST TIMING
// ============================================

export function withTiming<T>(
  handler: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  return handler().then((result) => ({
    result,
    duration: Date.now() - start,
  }));
}

// ============================================
// CORS HEADERS
// ============================================

export function corsHeaders(origin?: string): HeadersInit {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const allowOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin || '')
    ? origin || '*'
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// ============================================
// MIDDLENESS WRAPPER
// ============================================

type RouteHandler<T = unknown> = (
  request: Request,
  context?: { params: Record<string, string> }
) => Promise<NextResponse<T>>;

interface RouteOptions {
  rateLimit?: { max: number; windowMs: number };
  requireAuth?: boolean;
  logRequests?: boolean;
}

/**
 * Wrap a route handler with common middleware
 */
export function withMiddleware(
  handler: RouteHandler,
  options: RouteOptions = {}
): RouteHandler {
  return async (request, context) => {
    const start = Date.now();
    const url = new URL(request.url);

    try {
      // Rate limiting
      if (options.rateLimit) {
        const clientId = getClientIdentifier(request);
        const { allowed, resetIn } = checkRateLimit(
          clientId,
          options.rateLimit.max,
          options.rateLimit.windowMs
        );

        if (!allowed) {
          throw new RateLimitError('Too many requests', Math.ceil(resetIn / 1000));
        }
      }

      // Execute handler
      const response = await handler(request, context);

      // Log request
      if (options.logRequests !== false) {
        logRequest(
          request.method,
          url.pathname,
          response.status,
          Date.now() - start
        );
      }

      return response;
    } catch (error) {
      // Log error
      logRequest(
        request.method,
        url.pathname,
        500,
        Date.now() - start,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      return handleApiError(error);
    }
  };
}
