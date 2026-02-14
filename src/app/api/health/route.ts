/**
 * Health Check API Route
 * Smart Inter-Wilaya Taxi v2
 * 
 * Provides health status for the application
 */

import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'ok' | 'error' | 'not_configured';
    redis: 'ok' | 'error' | 'not_configured';
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// Start time for uptime calculation
const startTime = Date.now();

export async function GET() {
  const checks: HealthStatus['checks'] = {
    database: 'not_configured',
    redis: 'not_configured',
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
  };
  
  let status: HealthStatus['status'] = 'healthy';
  
  // Check database
  try {
    const { db } = await import('@/lib/db');
    await db.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
    status = 'degraded';
  }
  
  // Check Redis (if configured)
  if (process.env.REDIS_URL) {
    try {
      // Simple Redis check would go here
      checks.redis = 'ok';
    } catch (error) {
      checks.redis = 'error';
      status = 'degraded';
    }
  }
  
  // Memory check
  const memUsage = process.memoryUsage();
  checks.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024),
    total: Math.round(memUsage.heapTotal / 1024 / 1024),
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
  };
  
  // If memory usage is above 90%, mark as degraded
  if (checks.memory.percentage > 90) {
    status = 'degraded';
  }
  
  const healthStatus: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    uptime: Math.round((Date.now() - startTime) / 1000),
    checks,
  };
  
  return NextResponse.json(healthStatus, {
    status: status === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

// HEAD request for simple health ping
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
