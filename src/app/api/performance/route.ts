import { NextRequest, NextResponse } from 'next/server';
import { CachedDatabase, PerformanceAlert } from '@/lib/performance';
import { PerformanceMonitor } from '@/lib/error-handling';

export async function GET(request: NextRequest) {
  const stopTimer = PerformanceMonitor.startTimer('performance_metrics_api');
  
  try {
    // Get performance metrics
    const performanceData = PerformanceAlert.checkPerformance();
    const dbMetrics = PerformanceMonitor.getMetrics();
    
    const response = {
      timestamp: new Date(),
      performance: {
        database: dbMetrics,
        cache: performanceData.stats,
        alerts: performanceData.alerts
      },
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Performance metrics error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve performance metrics' 
    }, { status: 500 });
  } finally {
    stopTimer();
  }
}