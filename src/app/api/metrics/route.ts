/**
 * Metrics API Route
 * Smart Inter-Wilaya Taxi v2
 * 
 * Provides Prometheus-compatible metrics for monitoring
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Metrics format helper
function formatMetric(name: string, value: number, labels: Record<string, string> = {}): string {
  const labelStr = Object.entries(labels)
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
  const labelPart = labelStr ? `{${labelStr}}` : '';
  return `smart_taxi_${name}${labelPart} ${value}`;
}

export async function GET() {
  const metrics: string[] = [];
  
  try {
    // Application metrics
    metrics.push('# HELP smart_taxi_app_info Application information');
    metrics.push('# TYPE smart_taxi_app_info gauge');
    metrics.push(formatMetric('app_info', 1, { version: '2.0.0', env: process.env.NODE_ENV || 'development' }));
    metrics.push('');
    
    // Database metrics
    metrics.push('# HELP smart_taxi_db_users_total Total number of users');
    metrics.push('# TYPE smart_taxi_db_users_total gauge');
    
    const userCount = await db.user.count();
    metrics.push(formatMetric('db_users_total', userCount));
    
    const driverCount = await db.user.count({ where: { role: 'driver' } });
    metrics.push(formatMetric('db_users_total', driverCount, { role: 'driver' }));
    
    const onlineDrivers = await db.user.count({ 
      where: { role: 'driver', status: 'online' } 
    });
    metrics.push(formatMetric('db_users_total', onlineDrivers, { role: 'driver', status: 'online' }));
    metrics.push('');
    
    // Trip metrics
    metrics.push('# HELP smart_taxi_trips_total Total number of trips');
    metrics.push('# TYPE smart_taxi_trips_total gauge');
    
    const totalTrips = await db.driver.aggregate({
      _sum: { totalTrips: true },
    });
    metrics.push(formatMetric('trips_total', totalTrips._sum.totalTrips || 0));
    metrics.push('');
    
    // Revenue metrics
    metrics.push('# HELP smart_taxi_revenue_total Total revenue in DZD');
    metrics.push('# TYPE smart_taxi_revenue_total gauge');
    
    const totalRevenue = await db.driver.aggregate({
      _sum: { totalEarnings: true },
    });
    metrics.push(formatMetric('revenue_total', totalRevenue._sum.totalEarnings || 0));
    metrics.push('');
    
    // Memory metrics
    metrics.push('# HELP smart_taxi_memory_bytes Memory usage in bytes');
    metrics.push('# TYPE smart_taxi_memory_bytes gauge');
    
    const memUsage = process.memoryUsage();
    metrics.push(formatMetric('memory_bytes', memUsage.heapUsed, { type: 'heap_used' }));
    metrics.push(formatMetric('memory_bytes', memUsage.heapTotal, { type: 'heap_total' }));
    metrics.push(formatMetric('memory_bytes', memUsage.rss, { type: 'rss' }));
    metrics.push('');
    
    // Uptime metrics
    metrics.push('# HELP smart_taxi_uptime_seconds Application uptime in seconds');
    metrics.push('# TYPE smart_taxi_uptime_seconds gauge');
    metrics.push(formatMetric('uptime_seconds', Math.floor(process.uptime())));
    metrics.push('');
    
    // Group metrics
    metrics.push('# HELP smart_taxi_groups_total Total number of groups');
    metrics.push('# TYPE smart_taxi_groups_total gauge');
    
    const groupCount = await db.group.count();
    const activeGroupCount = await db.group.count({ where: { status: 'active' } });
    metrics.push(formatMetric('groups_total', groupCount));
    metrics.push(formatMetric('groups_total', activeGroupCount, { status: 'active' }));
    
  } catch (error) {
    console.error('Error collecting metrics:', error);
    metrics.push('# Error collecting some metrics');
  }
  
  return new NextResponse(metrics.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
