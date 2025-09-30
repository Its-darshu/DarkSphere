// Performance optimization utilities including caching, query optimization, and monitoring

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

export class MemoryCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private hits = 0;
  private misses = 0;
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize: number = 1000, defaultTtl: number = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl || this.defaultTtl));
    
    // Remove expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
      
      // If still full after cleanup, remove oldest entry
      if (this.cache.size >= this.maxSize) {
        const firstKey = Array.from(this.cache.keys())[0];
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      hits: 0
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update hit count
    entry.hits++;
    this.hits++;
    
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry || new Date() > entry.expiresAt) {
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    return {
      totalEntries: this.cache.size,
      totalHits: this.hits,
      totalMisses: this.misses,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let usage = 0;
    this.cache.forEach((entry, key) => {
      usage += key.length * 2; // Rough string size
      usage += JSON.stringify(entry.data).length * 2; // Rough data size
      usage += 64; // Overhead for Date objects and metadata
    });
    return usage;
  }
}

// Global cache instances
export const userCache = new MemoryCache(500, 10 * 60 * 1000); // 10 minutes for user data
export const postCache = new MemoryCache(1000, 5 * 60 * 1000); // 5 minutes for posts
export const announcementCache = new MemoryCache(100, 15 * 60 * 1000); // 15 minutes for announcements

// Cache key generators
export const CacheKeys = {
  user: {
    byId: (id: string) => `user:id:${id}`,
    byUsername: (username: string) => `user:username:${username}`,
    byEmail: (email: string) => `user:email:${email}`,
    all: () => 'users:all'
  },
  post: {
    byId: (id: string) => `post:id:${id}`,
    all: (limit: number, offset: number) => `posts:all:${limit}:${offset}`,
    byAuthor: (authorId: string) => `posts:author:${authorId}`
  },
  announcement: {
    all: () => 'announcements:all'
  }
};

// Cached database operations
export class CachedDatabase {
  // Cached user operations
  static async getUserById(id: string) {
    const cacheKey = CacheKeys.user.byId(id);
    let user = userCache.get(cacheKey);
    
    if (!user) {
      const { Database } = await import('./database');
      user = await Database.getUserById(id);
      if (user) {
        userCache.set(cacheKey, user);
      }
    }
    
    return user;
  }

  static async getUserByUsername(username: string) {
    const cacheKey = CacheKeys.user.byUsername(username);
    let user = userCache.get(cacheKey);
    
    if (!user) {
      const { Database } = await import('./database');
      user = await Database.getUserByUsername(username);
      if (user) {
        userCache.set(cacheKey, user);
        // Also cache by ID
        userCache.set(CacheKeys.user.byId(user.id), user);
      }
    }
    
    return user;
  }

  static async getAllPosts(limit: number = 50, offset: number = 0) {
    const cacheKey = CacheKeys.post.all(limit, offset);
    let posts = postCache.get(cacheKey);
    
    if (!posts) {
      const { Database } = await import('./database');
      posts = await Database.getAllPosts(limit, offset);
      if (posts) {
        postCache.set(cacheKey, posts, 3 * 60 * 1000); // 3 minutes for post lists
        
        // Cache individual posts
        posts.forEach((post: any) => {
          postCache.set(CacheKeys.post.byId(post.id), post);
        });
      }
    }
    
    return posts;
  }

  static async getAllAnnouncements() {
    const cacheKey = CacheKeys.announcement.all();
    let announcements = announcementCache.get(cacheKey);
    
    if (!announcements) {
      const { Database } = await import('./database');
      announcements = await Database.getAllAnnouncements();
      if (announcements) {
        announcementCache.set(cacheKey, announcements);
      }
    }
    
    return announcements;
  }

  // Cache invalidation
  static invalidateUserCache(userId?: string, username?: string, email?: string) {
    if (userId) userCache.delete(CacheKeys.user.byId(userId));
    if (username) userCache.delete(CacheKeys.user.byUsername(username));
    if (email) userCache.delete(CacheKeys.user.byEmail(email));
    userCache.delete(CacheKeys.user.all());
  }

  static invalidatePostCache(postId?: string) {
    if (postId) postCache.delete(CacheKeys.post.byId(postId));
    
    // Invalidate all post listings
    postCache.clear(); // Simple approach for now
  }

  static invalidateAnnouncementCache() {
    announcementCache.clear();
  }
}

// Database query optimization utilities
export class QueryOptimizer {
  private static slowQueries: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  static trackQuery(queryName: string, duration: number, threshold: number = 1000) {
    const stats = this.slowQueries.get(queryName) || { count: 0, totalTime: 0, avgTime: 0 };
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    
    this.slowQueries.set(queryName, stats);

    // Log slow queries
    if (duration > threshold) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms (avg: ${stats.avgTime.toFixed(2)}ms)`);
    }
  }

  static getSlowQueries(): Record<string, any> {
    const result: Record<string, any> = {};
    this.slowQueries.forEach((stats, queryName) => {
      result[queryName] = stats;
    });
    return result;
  }

  static resetStats() {
    this.slowQueries.clear();
  }
}

// Performance monitoring with alerts
export class PerformanceAlert {
  private static thresholds = {
    slowQuery: 2000, // 2 seconds
    highMemoryUsage: 100 * 1024 * 1024, // 100MB
    lowHitRate: 0.7, // 70%
    highErrorRate: 0.05 // 5%
  };

  private static alerts: Array<{
    type: string;
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }> = [];

  static checkPerformance() {
    // Check cache hit rates
    const userCacheStats = userCache.getStats();
    const postCacheStats = postCache.getStats();
    
    if (userCacheStats.hitRate < this.thresholds.lowHitRate && userCacheStats.totalHits + userCacheStats.totalMisses > 100) {
      this.addAlert('cache', `Low user cache hit rate: ${(userCacheStats.hitRate * 100).toFixed(1)}%`, 'medium');
    }
    
    if (postCacheStats.hitRate < this.thresholds.lowHitRate && postCacheStats.totalHits + postCacheStats.totalMisses > 100) {
      this.addAlert('cache', `Low post cache hit rate: ${(postCacheStats.hitRate * 100).toFixed(1)}%`, 'medium');
    }

    // Check memory usage
    const totalMemoryUsage = userCacheStats.memoryUsage + postCacheStats.memoryUsage;
    if (totalMemoryUsage > this.thresholds.highMemoryUsage) {
      this.addAlert('memory', `High cache memory usage: ${(totalMemoryUsage / 1024 / 1024).toFixed(1)}MB`, 'high');
    }

    return {
      alerts: this.alerts.slice(-10), // Last 10 alerts
      stats: {
        userCache: userCacheStats,
        postCache: postCacheStats,
        totalMemoryUsage
      }
    };
  }

  private static addAlert(type: string, message: string, severity: 'low' | 'medium' | 'high') {
    this.alerts.push({
      type,
      message,
      timestamp: new Date(),
      severity
    });

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    // Log high severity alerts
    if (severity === 'high') {
      console.warn(`PERFORMANCE ALERT: ${message}`);
    }
  }

  static getAlerts() {
    return this.alerts;
  }

  static clearAlerts() {
    this.alerts = [];
  }
}

// Automatic cache cleanup
setInterval(() => {
  userCache.cleanup();
  postCache.cleanup();
  announcementCache.cleanup();
}, 60 * 1000); // Clean up every minute

// Automatic performance monitoring
setInterval(() => {
  PerformanceAlert.checkPerformance();
}, 5 * 60 * 1000); // Check every 5 minutes