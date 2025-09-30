import { NextRequest, NextResponse } from 'next/server';
import { SecurityMonitor, withSecurity } from '@/lib/security';

const handler = async (request: NextRequest) => {
  try {
    const securityMetrics = SecurityMonitor.getSecurityMetrics();
    const suspiciousActivities = SecurityMonitor.getSuspiciousActivities(20);

    return NextResponse.json({
      ...securityMetrics,
      suspiciousActivities,
      recommendations: generateSecurityRecommendations(securityMetrics, suspiciousActivities)
    });

  } catch (error) {
    console.error('Security monitoring error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve security metrics' 
    }, { status: 500 });
  }
};

function generateSecurityRecommendations(metrics: any, activities: any[]): string[] {
  const recommendations: string[] = [];

  if (metrics.activeThreats > 5) {
    recommendations.push('High number of active threats detected. Consider tightening rate limits.');
  }

  if (activities.length > 10) {
    recommendations.push('Multiple suspicious activities detected. Review and consider IP blocking.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Security posture looks good. Continue monitoring.');
  }

  return recommendations;
}

// Protect this endpoint - require admin access and use strict rate limiting
export const GET = withSecurity({
  requireAuth: true,
  requireAdmin: true,
  allowedMethods: ['GET']
})(handler);