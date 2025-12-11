import NodeCache from 'node-cache';

/**
 * Cache service for API results with TTL and throttling
 * Respects API rate limits by caching results and throttling requests
 */
class CacheService {
  private cache: NodeCache;
  private rateLimitTracker: Map<string, number[]> = new Map();
  private readonly maxRequestsPerMinute = 30;
  private cacheTTLSeconds: number;

  constructor(ttlSeconds: number = 3600) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: 120 });
    this.cacheTTLSeconds = ttlSeconds;
  }

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(prefix: string, params: Record<string, string | number>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Check if request is within rate limits
   */
  private isWithinRateLimit(identifier: string): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.rateLimitTracker.has(identifier)) {
      this.rateLimitTracker.set(identifier, []);
    }

    const requests = this.rateLimitTracker.get(identifier)!;
    const recentRequests = requests.filter(timestamp => timestamp > oneMinuteAgo);

    if (recentRequests.length < this.maxRequestsPerMinute) {
      recentRequests.push(now);
      this.rateLimitTracker.set(identifier, recentRequests);
      return true;
    }

    return false;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    try {
      const value = this.cache.get<T>(key);
      return value;
    } catch (error) {
      console.warn(`Cache get failed for key ${key}:`, error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    try {
      this.cache.set(key, value, ttlSeconds || this.cacheTTLSeconds);
    } catch (error) {
      console.warn(`Cache set failed for key ${key}:`, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get or compute value with automatic caching
   */
  async getOrCompute<T>(
    cacheKey: string,
    computeFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = this.get<T>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const computed = await computeFn();
    this.set(cacheKey, computed, ttlSeconds);
    return computed;
  }

  /**
   * Check rate limit and return result or null if limited
   */
  async withRateLimit<T>(
    identifier: string,
    computeFn: () => Promise<T>
  ): Promise<T | null> {
    if (!this.isWithinRateLimit(identifier)) {
      return null;
    }

    return computeFn();
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return this.cache.getStats();
  }
}

export { CacheService };
