// Comprehensive error handling and logging system

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL'
}

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  body?: any;
  query?: any;
  headers?: any;
  timestamp?: Date;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: ErrorContext;
  timestamp: Date;
  type?: ErrorType;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, AppError);
  }

  static validation(message: string, context?: ErrorContext): AppError {
    return new AppError(message, ErrorType.VALIDATION, 400, true, context);
  }

  static authentication(message: string = 'Authentication required', context?: ErrorContext): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, 401, true, context);
  }

  static authorization(message: string = 'Insufficient permissions', context?: ErrorContext): AppError {
    return new AppError(message, ErrorType.AUTHORIZATION, 403, true, context);
  }

  static notFound(message: string = 'Resource not found', context?: ErrorContext): AppError {
    return new AppError(message, ErrorType.NOT_FOUND, 404, true, context);
  }

  static rateLimit(message: string = 'Rate limit exceeded', context?: ErrorContext): AppError {
    return new AppError(message, ErrorType.RATE_LIMIT, 429, true, context);
  }

  static database(message: string, context?: ErrorContext): AppError {
    return new AppError(message, ErrorType.DATABASE, 500, true, context);
  }

  static internal(message: string = 'Internal server error', context?: ErrorContext): AppError {
    return new AppError(message, ErrorType.INTERNAL, 500, true, context);
  }
}

export class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000; // Keep last 1000 logs in memory

  static log(level: LogLevel, message: string, error?: Error, context?: ErrorContext, type?: ErrorType): void {
    const logEntry: LogEntry = {
      level,
      message,
      error,
      context,
      timestamp: new Date(),
      type
    };

    // Add to memory store
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with formatting
    this.outputToConsole(logEntry);

    // In production, you would also send to external logging service
    // this.sendToExternalService(logEntry);
  }

  static error(message: string, error?: Error, context?: ErrorContext, type?: ErrorType): void {
    this.log(LogLevel.ERROR, message, error, context, type);
  }

  static warn(message: string, context?: ErrorContext, type?: ErrorType): void {
    this.log(LogLevel.WARN, message, undefined, context, type);
  }

  static info(message: string, context?: ErrorContext): void {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  static debug(message: string, context?: ErrorContext): void {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, undefined, context);
    }
  }

  static getLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }

    return filteredLogs.slice(-limit);
  }

  static clearLogs(): void {
    this.logs = [];
  }

  private static outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const context = logEntry.context ? JSON.stringify(logEntry.context, null, 2) : '';
    
    switch (logEntry.level) {
      case LogLevel.ERROR:
        console.error(`[${timestamp}] ERROR: ${logEntry.message}`);
        if (logEntry.error) {
          console.error('Stack:', logEntry.error.stack);
        }
        if (context) console.error('Context:', context);
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] WARN: ${logEntry.message}`);
        if (context) console.warn('Context:', context);
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] INFO: ${logEntry.message}`);
        if (context) console.info('Context:', context);
        break;
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] DEBUG: ${logEntry.message}`);
        if (context) console.debug('Context:', context);
        break;
    }
  }

  // In production, implement external logging service integration
  private static sendToExternalService(logEntry: LogEntry): void {
    // Implement external logging service here (e.g., Sentry, LogRocket, etc.)
  }
}

// Error handling middleware for API routes
export function handleApiError(error: any, context?: ErrorContext) {
  if (error instanceof AppError) {
    Logger.error(error.message, error, { ...error.context, ...context }, error.type);
    return {
      error: error.message,
      type: error.type,
      statusCode: error.statusCode
    };
  }

  // Handle known error types
  if (error.code === 'ECONNREFUSED') {
    const dbError = AppError.database('Database connection failed', context);
    Logger.error(dbError.message, error, context, ErrorType.DATABASE);
    return {
      error: 'Service temporarily unavailable',
      type: ErrorType.DATABASE,
      statusCode: 503
    };
  }

  if (error.code === '23505') { // PostgreSQL unique violation
    const validationError = AppError.validation('Resource already exists', context);
    Logger.error(validationError.message, error, context, ErrorType.VALIDATION);
    return {
      error: 'Resource already exists',
      type: ErrorType.VALIDATION,
      statusCode: 409
    };
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    const validationError = AppError.validation('Referenced resource not found', context);
    Logger.error(validationError.message, error, context, ErrorType.VALIDATION);
    return {
      error: 'Referenced resource not found',
      type: ErrorType.VALIDATION,
      statusCode: 400
    };
  }

  // Unknown error
  const internalError = AppError.internal('An unexpected error occurred', context);
  Logger.error('Unhandled error', error, context, ErrorType.INTERNAL);
  return {
    error: 'Internal server error',
    type: ErrorType.INTERNAL,
    statusCode: 500
  };
}

// Request context builder
export function buildRequestContext(request: any): ErrorContext {
  return {
    requestId: crypto.randomUUID(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
    timestamp: new Date()
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(operation: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration);
      
      if (duration > 5000) { // Log slow operations (> 5 seconds)
        Logger.warn(`Slow operation detected: ${operation} took ${duration}ms`, {
          operation,
          duration
        });
      }
    };
  }

  private static recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const measurements = this.metrics.get(operation)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  static getMetrics(operation?: string): Record<string, any> {
    if (operation) {
      const measurements = this.metrics.get(operation) || [];
      return this.calculateStats(measurements);
    }

    const allMetrics: Record<string, any> = {};
    this.metrics.forEach((measurements, op) => {
      allMetrics[op] = this.calculateStats(measurements);
    });
    return allMetrics;
  }

  private static calculateStats(measurements: number[]): any {
    if (measurements.length === 0) return { count: 0 };

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);

    return {
      count: measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      avg: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  static reset(): void {
    this.metrics.clear();
  }
}

// Health check utilities
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'up' | 'down';
    responseTime?: number;
    lastCheck: Date;
    error?: string;
  }>;
  timestamp: Date;
}

export class HealthChecker {
  private static lastCheck: HealthStatus | null = null;
  private static checkInterval = 60000; // 1 minute

  static async checkHealth(): Promise<HealthStatus> {
    const services: HealthStatus['services'] = {};

    // Check database
    const dbTimer = PerformanceMonitor.startTimer('health_check_database');
    try {
      // Simple database check - you can customize this
      const start = Date.now();
      // await Database.checkConnection(); // Implement this method
      const responseTime = Date.now() - start;
      
      services.database = {
        status: 'up',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      services.database = {
        status: 'down',
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      dbTimer();
    }

    // Determine overall status
    const downServices = Object.values(services).filter(s => s.status === 'down').length;
    let status: HealthStatus['status'] = 'healthy';
    
    if (downServices > 0) {
      status = downServices === Object.keys(services).length ? 'unhealthy' : 'degraded';
    }

    const healthStatus: HealthStatus = {
      status,
      services,
      timestamp: new Date()
    };

    this.lastCheck = healthStatus;
    return healthStatus;
  }

  static getLastCheck(): HealthStatus | null {
    return this.lastCheck;
  }
}