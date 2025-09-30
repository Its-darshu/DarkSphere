import { NextRequest, NextResponse } from 'next/server';
import { HealthChecker, Logger, PerformanceMonitor } from '@/lib/error-handling';

export async function GET(request: NextRequest) {
  try {
    const healthStatus = await HealthChecker.checkHealth();
    
    // Add performance metrics to response
    const performanceMetrics = PerformanceMonitor.getMetrics();
    
    const response = {
      ...healthStatus,
      performance: performanceMetrics,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Return appropriate status code based on health
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                       healthStatus.status === 'degraded' ? 206 : 503;

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    Logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date()
    }, { status: 503 });
  }
}