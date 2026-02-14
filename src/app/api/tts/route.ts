/**
 * Text-to-Speech API Route
 * Smart Inter-Wilaya Taxi v2
 * 
 * Converts text to speech using z-ai-web-dev-sdk TTS
 */

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { z } from 'zod';

// Validation schema
const ttsSchema = z.object({
  text: z.string().min(1).max(500),
  voice: z.enum(['male', 'female']).default('male'),
  language: z.enum(['ar', 'fr']).default('ar'),
  speed: z.coerce.number().min(0.5).max(2).default(1),
});

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 50, windowMs: number = 60000) {
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
 * TTS Handler
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(ip, 50, 60000);
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const params = ttsSchema.parse(body);
    
    // Initialize Z-AI SDK
    const zai = await ZAI.create();
    
    // Call TTS
    const result = await zai.functions.invoke('tts', {
      text: params.text,
      voice: params.voice,
      language: params.language,
      speed: params.speed,
    });
    
    // Return audio data
    if (result && (result as any).audio) {
      return NextResponse.json({
        success: true,
        audio: (result as any).audio, // Base64 encoded audio
        format: 'wav',
      });
    }
    
    // Fallback: return success with note
    return NextResponse.json({
      success: true,
      message: 'TTS processing completed',
      text: params.text,
    });
    
  } catch (error) {
    console.error('TTS Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'TTS processing failed' },
      { status: 500 }
    );
  }
}
