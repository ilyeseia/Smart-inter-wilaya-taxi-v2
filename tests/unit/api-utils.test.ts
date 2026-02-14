/**
 * API Utilities Tests
 * Smart Inter-Wilaya Taxi v2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  handleApiError,
  checkRateLimit,
  schemas,
} from '@/lib/api-utils';
import { NextResponse } from 'next/server';
import { z } from 'zod';

describe('API Utilities', () => {
  describe('Response Helpers', () => {
    it('should create a success response', async () => {
      const data = { id: 1, name: 'Test' };
      const response = successResponse(data);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
    });

    it('should create an error response', async () => {
      const response = errorResponse('Test error', 400);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Test error');
      expect(response.status).toBe(400);
    });

    it('should create a paginated response', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = paginatedResponse(data, {
        total: 10,
        limit: 2,
        offset: 0,
      });
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.pagination?.total).toBe(10);
      expect(json.pagination?.hasMore).toBe(true);
    });
  });

  describe('Error Classes', () => {
    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid input', { email: ['Required'] });
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ email: ['Required'] });
    });

    it('should create NotFoundError', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
    });

    it('should create UnauthorizedError', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });

    it('should create ForbiddenError', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
    });

    it('should create ConflictError', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.message).toBe('Duplicate entry');
    });
  });

  describe('Error Handler', () => {
    it('should handle ValidationError', async () => {
      const error = new ValidationError('Invalid', { field: ['Required'] });
      const response = handleApiError(error);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle NotFoundError', async () => {
      const error = new NotFoundError('User');
      const response = handleApiError(error);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle ZodError', async () => {
      const schema = z.object({ email: z.string().email() });
      try {
        schema.parse({ email: 'invalid' });
      } catch (error) {
        const response = handleApiError(error);
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(response.status).toBe(400);
      }
    });

    it('should handle generic error', async () => {
      const error = new Error('Something went wrong');
      const response = handleApiError(error);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limit store
      vi.clearAllMocks();
    });

    it('should allow requests under limit', () => {
      const result = checkRateLimit('test-key', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests over limit', () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit('blocked-key', 5, 60000);
      }
      // 6th request should be blocked
      const result = checkRateLimit('blocked-key', 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('Validation Schemas', () => {
    it('should validate email', () => {
      expect(() => schemas.email.parse('test@example.com')).not.toThrow();
      expect(() => schemas.email.parse('invalid')).toThrow();
    });

    it('should validate phone', () => {
      expect(() => schemas.phone.parse('+213555123456')).not.toThrow();
      expect(() => schemas.phone.parse('invalid')).toThrow();
    });

    it('should validate pagination', () => {
      const result = schemas.pagination.parse({ limit: '10', offset: '0' });
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should use default pagination values', () => {
      const result = schemas.pagination.parse({});
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });
});
