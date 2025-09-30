// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'string' | 'email' | 'number' | 'boolean';
  custom?: (value: any) => string | null;
}

export class Validator {
  private validationRules: ValidationRule[] = [];
  private data: any = {};

  constructor(data: any) {
    this.data = data;
  }

  static create(data: any): Validator {
    return new Validator(data);
  }

  // Add validation rules
  rule(rule: ValidationRule): Validator {
    this.validationRules.push(rule);
    return this;
  }

  rules(rules: ValidationRule[]): Validator {
    this.validationRules.push(...rules);
    return this;
  }

  // Validate all rules
  validate(): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: any = {};

    for (const rule of this.validationRules) {
      const value = this.data[rule.field];
      const fieldErrors = this.validateField(value, rule);
      
      if (fieldErrors.length > 0) {
        errors.push(...fieldErrors);
      } else {
        // Sanitize the value if validation passes
        sanitizedData[rule.field] = this.sanitizeValue(value, rule);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  }

  private validateField(value: any, rule: ValidationRule): string[] {
    const errors: string[] = [];

    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`);
      return errors; // Don't continue validation if required field is missing
    }

    // Skip other validations if field is not provided and not required
    if (value === undefined || value === null || value === '') {
      return errors;
    }

    // Type validation
    if (rule.type) {
      const typeError = this.validateType(value, rule.type, rule.field);
      if (typeError) errors.push(typeError);
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push(`${rule.field} format is invalid`);
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) errors.push(customError);
    }

    return errors;
  }

  private validateType(value: any, type: string, field: string): string | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return `${field} must be a string`;
        }
        break;
      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return `${field} must be a valid email address`;
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          return `${field} must be a number`;
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${field} must be a boolean`;
        }
        break;
    }
    return null;
  }

  private sanitizeValue(value: any, rule: ValidationRule): any {
    if (typeof value === 'string') {
      // Basic HTML sanitization - strip potentially dangerous tags
      value = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
      value = value.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
      value = value.replace(/javascript:/gi, '');
      value = value.replace(/on\w+\s*=/gi, '');
      
      // Trim whitespace
      value = value.trim();
    }

    // Convert to appropriate type
    if (rule.type === 'number' && typeof value === 'string') {
      return Number(value);
    }
    if (rule.type === 'boolean' && typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Pre-defined validation rule sets
export const ValidationRules = {
  user: {
    register: [
      { field: 'username', required: true, type: 'string' as const, minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_-]+$/ },
      { field: 'email', required: true, type: 'email' as const },
      { field: 'password', required: true, type: 'string' as const, minLength: 8, maxLength: 128 },
      { field: 'full_name', required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
      { field: 'user_type', required: true, type: 'string' as const, custom: (value: any) => 
        ['admin', 'user'].includes(value) ? null : 'user_type must be either admin or user'
      }
    ],
    profile: [
      { field: 'full_name', type: 'string' as const, minLength: 2, maxLength: 100 },
      { field: 'bio', type: 'string' as const, maxLength: 500 },
      { field: 'location', type: 'string' as const, maxLength: 100 },
      { field: 'website', type: 'string' as const, maxLength: 200, pattern: /^https?:\/\/.+$/ },
      { field: 'social_github', type: 'string' as const, maxLength: 100 },
      { field: 'social_linkedin', type: 'string' as const, maxLength: 100 },
      { field: 'social_twitter', type: 'string' as const, maxLength: 100 },
      { field: 'social_instagram', type: 'string' as const, maxLength: 100 }
    ]
  },
  post: {
    create: [
      { field: 'content', required: true, type: 'string' as const, minLength: 1, maxLength: 2000 },
      { field: 'author_id', required: true, type: 'string' as const, pattern: /^[0-9]+$/ }
    ]
  },
  comment: {
    create: [
      { field: 'content', required: true, type: 'string' as const, minLength: 1, maxLength: 1000 },
      { field: 'post_id', required: true, type: 'string' as const, pattern: /^[0-9]+$/ },
      { field: 'author_id', required: true, type: 'string' as const, pattern: /^[0-9]+$/ }
    ]
  },
  announcement: {
    create: [
      { field: 'title', required: true, type: 'string' as const, minLength: 5, maxLength: 200 },
      { field: 'content', required: true, type: 'string' as const, minLength: 10, maxLength: 2000 },
      { field: 'announcement_type', required: true, type: 'string' as const, custom: (value: any) => 
        ['info', 'warning', 'success'].includes(value) ? null : 'announcement_type must be info, warning, or success'
      },
      { field: 'created_by', required: true, type: 'string' as const, pattern: /^[0-9]+$/ }
    ]
  },
  auth: {
    login: [
      { field: 'email', required: true, type: 'email' as const },
      { field: 'password', required: true, type: 'string' as const, minLength: 1 }
    ]
  }
};

// SQL injection prevention
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove or escape potentially dangerous SQL characters
  return input
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/;/g, '')    // Remove semicolons
    .replace(/--/g, '')   // Remove SQL comments
    .replace(/\/\*/g, '') // Remove start of block comments
    .replace(/\*\//g, '') // Remove end of block comments
    .trim();
}

// XSS prevention
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting helper
export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get or create request history for this identifier
    const requestTimes = this.requests.get(identifier) || [];
    
    // Remove requests outside the current window
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    // Check if under limit
    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const requestTimes = this.requests.get(identifier) || [];
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    return Math.max(0, this.config.maxRequests - validRequests.length);
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    this.requests.forEach((requestTimes: number[], identifier: string) => {
      const validRequests = requestTimes.filter((time: number) => time > now - this.config.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    });
  }
}