/**
 * Web Search API Route
 * Smart Inter-Wilaya Taxi v2
 * 
 * Provides web search capabilities using z-ai-web-dev-sdk
 */

import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { withMiddleware, successResponse, RateLimitError } from '@/lib/api-utils';
import { z } from 'zod';

// Validation schema
const searchSchema = z.object({
  q: z.string().min(2).max(200),
  num: z.coerce.number().int().min(1).max(20).default(10),
  lang: z.enum(['ar', 'fr', 'en']).default('ar'),
});

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 20, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || record.resetAt <= now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Web Search Handler
 */
async function searchHandler(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateCheck = checkRateLimit(ip, 20, 60000);
  
  if (!rateCheck.allowed) {
    throw new RateLimitError('Too many search requests. Please wait.', 60);
  }
  
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = searchSchema.parse({
    q: searchParams.get('q'),
    num: searchParams.get('num') || 10,
    lang: searchParams.get('lang') || 'ar',
  });
  
  // Initialize Z-AI SDK
  const zai = await ZAI.create();
  
  // Enhance search query
  const searchQuery = params.lang === 'ar' 
    ? `${params.q} الجزائر تاكسي` 
    : params.lang === 'fr'
      ? `${params.q} Algérie taxi`
      : `${params.q} Algeria taxi`;
  
  // Perform web search
  const searchResult = await zai.functions.invoke('web_search', {
    query: searchQuery,
    num: params.num,
  });
  
  // Format results
  const formattedResults = Array.isArray(searchResult) 
    ? searchResult.map((item: any) => ({
        title: item.name || 'Untitled',
        url: item.url,
        snippet: item.snippet || '',
        hostname: item.host_name || new URL(item.url).hostname,
        date: item.date || null,
      }))
    : [];
  
  return successResponse({
    query: params.q,
    results: formattedResults,
    total: formattedResults.length,
  });
}

export const GET = withMiddleware(searchHandler, {
  rateLimit: { max: 20, windowMs: 60000 },
  logRequests: true,
});
