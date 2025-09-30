// Advanced security middleware and utilities

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { RateLimiter } from './validation';

export interface AuthContext {
  user?: {
    id: string;
    username: string;
    userType: 'admin' | 'user';
  };
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface SecurityConfig {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  allowedMethods?: string[];
  corsOrigins?: string[];
}

// Global rate limiters for different types of requests
const globalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 requests per 15 minutes
});

const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10 // 10 auth attempts per 15 minutes
});

const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5 // 5 requests per hour for sensitive operations
});

// Suspicious activity tracking
class SuspiciousActivityTracker {
  private static activities: Map<string, Array<{
    type: string;
    timestamp: Date;
    details: any;
  }>> = new Map();

  static trackActivity(ip: string, type: string, details: any = {}) {
    if (!this.activities.has(ip)) {
      this.activities.set(ip, []);
    }

    const ipActivities = this.activities.get(ip)!;
    ipActivities.push({
      type,
      timestamp: new Date(),
      details
    });

    // Keep only last 50 activities per IP
    if (ipActivities.length > 50) {
      ipActivities.shift();
    }

    // Check for suspicious patterns
    this.checkSuspiciousPatterns(ip, ipActivities);
  }

  private static checkSuspiciousPatterns(ip: string, activities: Array<any>) {
    const recentActivities = activities.filter(
      a => Date.now() - a.timestamp.getTime() < 10 * 60 * 1000 // Last 10 minutes
    );

    // Multiple failed auth attempts
    const failedAuthAttempts = recentActivities.filter(a => a.type === 'failed_auth').length;
    if (failedAuthAttempts >= 5) {
      console.warn(`SECURITY ALERT: Multiple failed auth attempts from IP ${ip}`);
      // In production, you might want to temporarily block this IP
    }

    // Rapid requests
    if (recentActivities.length >= 50) {
      console.warn(`SECURITY ALERT: Rapid requests from IP ${ip}`);
    }

    // SQL injection attempts (looking for common patterns in failed requests)
    const suspiciousRequests = recentActivities.filter(a => 
      a.type === 'validation_failed' && 
      JSON.stringify(a.details).toLowerCase().includes('select')
    );
    if (suspiciousRequests.length >= 3) {
      console.warn(`SECURITY ALERT: Possible SQL injection attempts from IP ${ip}`);
    }
  }

  static getActivities(ip: string) {
    return this.activities.get(ip) || [];
  }

  static isBlocked(ip: string): boolean {
    const activities = this.activities.get(ip) || [];
    const recentFailedAuth = activities.filter(
      a => a.type === 'failed_auth' && 
           Date.now() - a.timestamp.getTime() < 30 * 60 * 1000 // Last 30 minutes
    ).length;

    return recentFailedAuth >= 10; // Block after 10 failed attempts in 30 minutes
  }

  static clearActivities(ip: string) {
    this.activities.delete(ip);
  }
}

// Authentication utilities
export class Auth {
  static async verifyToken(request: NextRequest): Promise<AuthContext> {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return { isAuthenticated: false, isAdmin: false };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      return {
        user: {
          id: decoded.userId,
          username: decoded.username,
          userType: decoded.userType
        },
        isAuthenticated: true,
        isAdmin: decoded.userType === 'admin'
      };
    } catch (error) {
      return { isAuthenticated: false, isAdmin: false };
    }
  }

  static getClientIP(request: NextRequest): string {
    return request.ip || 
           request.headers.get('x-forwarded-for')?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           'unknown';
  }

  static generateCSRFToken(): string {
    return crypto.randomUUID();
  }

  static validateCSRFToken(request: NextRequest, expectedToken: string): boolean {
    const token = request.headers.get('x-csrf-token');
    return token === expectedToken;
  }
}

// Security middleware
export class SecurityMiddleware {
  static checkRateLimit(request: NextRequest, type: 'global' | 'auth' | 'strict' = 'global'): boolean {
    const ip = Auth.getClientIP(request);

    if (SuspiciousActivityTracker.isBlocked(ip)) {
      SuspiciousActivityTracker.trackActivity(ip, 'blocked_request');
      return false;
    }

    let rateLimiter: RateLimiter;
    switch (type) {
      case 'auth':
        rateLimiter = authRateLimiter;
        break;
      case 'strict':
        rateLimiter = strictRateLimiter;
        break;
      default:
        rateLimiter = globalRateLimiter;
    }

    const isAllowed = rateLimiter.isAllowed(ip);
    
    if (!isAllowed) {
      SuspiciousActivityTracker.trackActivity(ip, 'rate_limit_exceeded', { type });
    }

    return isAllowed;
  }

  static checkMethod(request: NextRequest, allowedMethods: string[]): boolean {
    return allowedMethods.includes(request.method);
  }

  static async checkAuth(request: NextRequest, requireAdmin: boolean = false): Promise<{
    isValid: boolean;
    authContext?: AuthContext;
    error?: string;
  }> {
    const authContext = await Auth.verifyToken(request);

    if (!authContext.isAuthenticated) {
      const ip = Auth.getClientIP(request);
      SuspiciousActivityTracker.trackActivity(ip, 'failed_auth', {
        reason: 'no_token',
        url: request.url
      });
      return { isValid: false, error: 'Authentication required' };
    }

    if (requireAdmin && !authContext.isAdmin) {
      const ip = Auth.getClientIP(request);
      SuspiciousActivityTracker.trackActivity(ip, 'unauthorized_admin_access', {
        userId: authContext.user?.id,
        url: request.url
      });
      return { isValid: false, error: 'Admin access required' };
    }

    return { isValid: true, authContext };
  }

  static addSecurityHeaders(headers: Headers): void {
    // Security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // CORS headers (adjust origins as needed)
    headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    headers.set('Access-Control-Max-Age', '86400');
  }

  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remove potential XSS patterns
      return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }
}

// Secure API wrapper
export function withSecurity(config: SecurityConfig = {}) {
  return function(handler: (request: NextRequest, authContext?: AuthContext) => Promise<Response>) {
    return async function(request: NextRequest): Promise<Response> {
      const ip = Auth.getClientIP(request);

      try {
        // Check allowed methods
        if (config.allowedMethods && !SecurityMiddleware.checkMethod(request, config.allowedMethods)) {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Check rate limiting
        const rateLimitType = config.requireAuth ? 'auth' : config.requireAdmin ? 'strict' : 'global';
        if (!SecurityMiddleware.checkRateLimit(request, rateLimitType)) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Check authentication
        let authContext: AuthContext | undefined;
        if (config.requireAuth || config.requireAdmin) {
          const authResult = await SecurityMiddleware.checkAuth(request, config.requireAdmin);
          if (!authResult.isValid) {
            return new Response(JSON.stringify({ error: authResult.error }), {
              status: config.requireAdmin ? 403 : 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          authContext = authResult.authContext;
        }

        // Call the actual handler
        const response = await handler(request, authContext);

        // Add security headers
        SecurityMiddleware.addSecurityHeaders(response.headers);

        return response;

      } catch (error) {
        console.error('Security middleware error:', error);
        SuspiciousActivityTracker.trackActivity(ip, 'security_error', {
          error: error instanceof Error ? error.message : String(error)
        });

        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  };
}

// Security monitoring
export class SecurityMonitor {
  static getSuspiciousActivities(limit: number = 50): Array<{
    ip: string;
    activities: Array<any>;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const results: Array<any> = [];
    
    // This would need to be implemented to iterate over the suspicious activities
    // For now, returning empty array due to Map iteration issues
    return results;
  }

  static getSecurityMetrics() {
    return {
      timestamp: new Date(),
      rateLimits: {
        global: globalRateLimiter.getRemainingRequests('system'),
        auth: authRateLimiter.getRemainingRequests('system'),
        strict: strictRateLimiter.getRemainingRequests('system')
      },
      activeThreats: this.getSuspiciousActivities().filter(a => a.riskLevel === 'high').length
    };
  }
}

// Export the suspicious activity tracker for external use
export { SuspiciousActivityTracker };